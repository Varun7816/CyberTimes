const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appDir = path.join(root, "app");

function walk(dir) {
  const res = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) res.push(...walk(p));
    else if (/\.(js|jsx|ts|tsx)$/.test(name)) res.push(p);
  }
  return res;
}

function parseReactImports(content) {
  const importRegex = /^import\s+(.+?)\s+from\s+['"]react['"];?/gm;
  const matches = [];
  let m;
  while ((m = importRegex.exec(content)) !== null) {
    matches.push({ full: m[0], spec: m[1], index: m.index });
  }
  return matches;
}

function extractNamedFromSpec(spec) {
  const named = new Set();
  // spec examples: React, { useState, useEffect }  OR { useState }
  const namedMatch = spec.match(/\{([^}]*)\}/);
  if (namedMatch) {
    namedMatch[1]
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .forEach(n => named.add(n));
  }
  return named;
}

function buildCombinedImport(matches, usedHooks) {
  let hasDefault = false;
  let defaultName = null;
  const named = new Set();

  matches.forEach((im) => {
    const spec = im.spec.trim();
    const parts = spec.split(",");
    if (parts.length > 0) {
      const first = parts[0].trim();
      if (!first.startsWith("{")) {
        hasDefault = true;
        defaultName = first;
      }
    }
    extractNamedFromSpec(spec).forEach(n => named.add(n));
  });

  // add any hooks detected in file usage
  usedHooks.forEach(h => named.add(h));

  const namedArr = Array.from(named).sort();
  if (hasDefault) {
    if (namedArr.length > 0) return `import ${defaultName}, { ${namedArr.join(", ")} } from "react";`;
    return `import ${defaultName} from "react";`;
  } else {
    if (namedArr.length > 0) return `import { ${namedArr.join(", ")} } from "react";`;
  }
  return null;
}

function insertCombinedImport(content, combinedImport) {
  const lines = content.split(/\r?\n/);
  let idx = 0;
  while (idx < lines.length) {
    const t = lines[idx].trim();
    if (t === "" || t.startsWith("//") || t.startsWith("/*") || t.startsWith("*") || t.startsWith("#!")) {
      idx++;
      continue;
    }
    if (/^['"]use client['"];\s*$/.test(t)) {
      idx++;
      while (idx < lines.length && lines[idx].trim() === "") idx++;
      continue;
    }
    break;
  }
  let importStart = idx;
  while (importStart < lines.length && !/^import\s/.test(lines[importStart].trim())) importStart++;
  let insertAt = importStart;
  while (insertAt < lines.length && (/^import\s/.test(lines[insertAt].trim()) || lines[insertAt].trim() === "")) insertAt++;
  const before = lines.slice(0, insertAt);
  const after = lines.slice(insertAt);
  return [...before, combinedImport, ...after].join("\n");
}

function detectUsedHooks(content) {
  // common React hooks to look for
  const hooks = [
    "useState","useEffect","useMemo","useCallback","useRef","useLayoutEffect",
    "useImperativeHandle","useReducer","useContext","useDebugValue"
  ];
  const used = new Set();
  for (const h of hooks) {
    const re = new RegExp(`\\b${h}\\b`, "g");
    if (re.test(content)) used.add(h);
  }
  return used;
}

const files = walk(appDir);
files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  const matches = parseReactImports(content);
  const usedHooks = detectUsedHooks(content);

  // if no react imports and no hooks used, nothing to do
  if (matches.length === 0 && usedHooks.size === 0) return;

  // build combined import from existing react imports + used hooks
  const combined = buildCombinedImport(matches, usedHooks);
  if (!combined) {
    // if there were no existing react imports but hooks are used, create default import
    if (usedHooks.size > 0) {
      // add "use client" if missing (hooks require client components)
      if (!/^(['"])use client\1;\s*/m.test(content)) {
        content = `'use client';\n\n` + content;
      }
      const namedArr = Array.from(usedHooks).sort();
      const newImport = `import { ${namedArr.join(", ")} } from "react";`;
      content = insertCombinedImport(content, newImport);
      const bakA = file + ".bak";
      if (!fs.existsSync(bakA)) fs.writeFileSync(bakA, original, "utf8");
      fs.writeFileSync(file, content, "utf8");
      console.log("Inserted React hooks import in:", path.relative(root, file));
    }
    return;
  }

  // remove all original react import lines if any
  let newContent = content;
  matches.forEach(m => {
    newContent = newContent.replace(m.full, "");
  });

  // trim extra blank lines
  newContent = newContent.replace(/(\r?\n){3,}/g, "\n\n");

  // insert combined import
  newContent = insertCombinedImport(newContent, combined);

  // safety: ensure not duplicating hook names
  const hookCount = (newContent.match(/use(State|Effect|Memo|Callback|Ref|LayoutEffect|Reducer|Context|DebugValue)/g) || []).length;
  if (hookCount === 0 && usedHooks.size > 0) {
    console.warn("Warning: hooks detected but not present in combined import for", file);
  }

  if (newContent !== original) {
    const bak = file + ".bak";
    if (!fs.existsSync(bak)) fs.writeFileSync(bak, original, "utf8");
    fs.writeFileSync(file, newContent, "utf8");
    console.log("Merged React imports + hooks in:", path.relative(root, file));
  }
});

console.log("Done.");