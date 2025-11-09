const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appDir = path.join(root, "app");

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) out.push(...walk(p));
    else if (/\.(js|jsx|ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const files = walk(appDir);
const re = /from\s+['"]@\/data\/([^'"]+)['"]/g;

files.forEach((file) => {
  let src = fs.readFileSync(file, "utf8");
  let m;
  let changed = false;
  const dirname = path.dirname(file);
  while ((m = re.exec(src)) !== null) {
    const dataFile = m[1]; // e.g. zero-days.json
    const absData = path.join(root, "data", dataFile);
    // if data file exists, compute relative path; otherwise leave unchanged
    if (!fs.existsSync(absData)) {
      console.warn("Skipping (data file missing):", dataFile, "referenced in", path.relative(root, file));
      continue;
    }
    let rel = path.relative(dirname, absData);
    // convert Windows backslashes to posix
    rel = rel.split(path.sep).join("/");
    if (!rel.startsWith(".")) rel = "./" + rel;
    const orig = m[0];
    const replacement = `from "${rel}"`;
    src = src.slice(0, m.index) + orig.replace(/from\s+['"][^'"]+['"]/, replacement) + src.slice(m.index + orig.length);
    changed = true;
    // reset lastIndex because we modified src
    re.lastIndex = m.index + replacement.length;
  }

  if (changed) {
    const bak = file + ".bak";
    if (!fs.existsSync(bak)) fs.writeFileSync(bak, fs.readFileSync(file, "utf8"), "utf8");
    fs.writeFileSync(file, src, "utf8");
    console.log("Patched:", path.relative(root, file));
  }
});

console.log("Done.");