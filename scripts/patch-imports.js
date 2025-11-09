const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appDir = path.join(root, "app");

function walk(dir) {
  const res = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      res.push(...walk(p));
    } else if (/\.(js|jsx|ts|tsx)$/.test(name)) {
      res.push(p);
    }
  }
  return res;
}

function needsImport(content, regex) {
  return regex.test(content);
}

function hasImport(content, importRegex) {
  return importRegex.test(content);
}

function determineDataImport(filePath) {
  const lp = filePath.toLowerCase();
  if (lp.includes("vulnerabilities")) return 'import vulnerabilitiesData from "@/data/vulnerabilities.json";';
  if (lp.includes("malware")) return 'import malwareData from "@/data/malware.json";';
  if (lp.includes("zero-days") || lp.includes("zerodays") || lp.includes("zero_days")) return 'import zeroDaysData from "@/data/zero-days.json";';
  if (lp.includes("jobs")) return 'import jobs from "@/data/jobs.json";';
  return null;
}

function insertAtTop(content, linesToInsert) {
  const lines = content.split(/\r?\n/);
  let idx = 0;
  while (idx < lines.length) {
    const line = lines[idx].trim();
    if (line === "" || line.startsWith("//") || line.startsWith("/*") || line.startsWith("*") || line.startsWith("#!")) {
      idx++;
      continue;
    }
    if (/^['"]use client['"];\s*$/.test(line)) {
      idx++;
      while (idx < lines.length && lines[idx].trim() === "") idx++;
      continue;
    }
    if (/^import\s/.test(line)) {
      while (idx < lines.length && (/^import\s/.test(lines[idx].trim()) || lines[idx].trim() === "")) idx++;
      break;
    }
    break;
  }
  const before = lines.slice(0, idx);
  const after = lines.slice(idx);
  const newLines = [...before, ...linesToInsert, ...after];
  return newLines.join("\n");
}

function mergeUseStateIntoReactImport(content) {
  // find an import line from 'react'
  const reactImportMatch = content.match(/(^import\s+[^;]+from\s+['"]react['"];?)/m);
  if (!reactImportMatch) return content; // nothing to merge into

  const line = reactImportMatch[1];
  if (/\buseState\b/.test(line)) return content; // already has useState

  let newLine;
  if (/\{[^}]*\}/.test(line)) {
    // has named imports -> add useState into braces
    newLine = line.replace(/\{([^}]*)\}/, (m, inner) => {
      const items = inner.split(",").map(s => s.trim()).filter(Boolean);
      if (!items.includes("useState")) items.push("useState");
      return `{ ${items.join(", ")} }`;
    });
  } else {
    // default import only -> convert to default + named
    // e.g. import React from "react"; -> import React, { useState } from "react";
    newLine = line.replace(/from\s+['"]react['"]/, `, { useState } from "react"`);
  }
  return content.replace(line, newLine);
}

const files = walk(appDir);

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  const edits = [];

  const useStateUsed = needsImport(content, /\buseState\s*\(/);
  const linkUsed = needsImport(content, /<\s*Link\b|Link\(/);
  const dataImportLine = determineDataImport(file);

  // If useState is used:
  if (useStateUsed) {
    // If there's already any import from react, merge useState into it
    if (/from\s+['"]react['"]/.test(content)) {
      const merged = mergeUseStateIntoReactImport(content);
      if (merged !== content) {
        content = merged;
      }
    } else {
      // no react import -> ensure "use client" and add a react import with useState
      if (!/^(['"])use client\1;\s*/m.test(content)) {
        edits.push("'use client';");
      }
      edits.push('import React, { useState } from "react";');
    }
  }

  // add Link import if used and missing
  if (linkUsed && !hasImport(content, /import\s+Link\s+from\s+['"]next\/link['"]/)) {
    edits.push('import Link from "next/link";');
  }

  // add data import if applicable and missing
  if (dataImportLine && !content.includes(dataImportLine.split(" from ")[0])) {
    if (!/from\s+['"]@\/data\//.test(content)) {
      edits.push(dataImportLine);
    }
  }

  if (edits.length > 0) {
    const uniqueEdits = edits.filter((l) => !content.includes(l));
    if (uniqueEdits.length > 0) {
      const bak = file + ".bak";
      if (!fs.existsSync(bak)) fs.writeFileSync(bak, original, "utf8");
      content = insertAtTop(content, uniqueEdits);
      fs.writeFileSync(file, content, "utf8");
      console.log("Patched:", path.relative(root, file));
    }
  } else {
    // even if no new top edits, we may have merged useState into react import already and need to save
    if (content !== original) {
      const bak = file + ".bak";
      if (!fs.existsSync(bak)) fs.writeFileSync(bak, original, "utf8");
      fs.writeFileSync(file, content, "utf8");
      console.log("Merged React import in:", path.relative(root, file));
    }
  }
});

console.log("Done. If files were patched, backups saved with .bak extensions.");