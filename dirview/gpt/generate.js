#!/usr/bin/env node

// DirView — simple offline viewer generator
// Usage:
//   node generate.js --dir "/path/to/folder"

const fs = require("fs");
const path = require("path");

// Parse simple flags
function getArg(name) {
  const flag = `--${name}`;
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === flag && process.argv[i+1]) return process.argv[i+1];
    if (process.argv[i].startsWith(flag + "=")) return process.argv[i].split("=")[1];
  }
  return null;
}

const inputDir = getArg("dir");
if (!inputDir) {
  console.error('Usage: node generate.js --dir "/path/to/folder"');
  process.exit(1);
}

const resolvedInput = path.isAbsolute(inputDir)
  ? inputDir
  : path.resolve(process.cwd(), inputDir);

if (!fs.existsSync(resolvedInput) || !fs.statSync(resolvedInput).isDirectory()) {
  console.error("ERROR: Directory not found:", resolvedInput);
  process.exit(1);
}

const SUPPORTED = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tiff", ".svg"
]);

// Collect all images
const files = fs.readdirSync(resolvedInput);
const images = [];

for (const f of files) {
  const full = path.join(resolvedInput, f);
  try {
    if (!fs.statSync(full).isFile()) continue;
    const ext = path.extname(f).toLowerCase();
    if (SUPPORTED.has(ext)) {
      images.push({ filename: f });
    }
  } catch (err) {
    console.warn("Skipping", f, "-", err.message);
  }
}

console.log(`✓ Found ${images.length} images.`);

const templatePath = path.join(__dirname, "viewer_template.html");
if (!fs.existsSync(templatePath)) {
  console.error("ERROR: viewer_template.html missing next to generate.js.");
  process.exit(1);
}

let template = fs.readFileSync(templatePath, "utf8");

// Inject manifest
template = template.replace("/*__MANIFEST__*/", JSON.stringify(images, null, 2));

const outPath = path.join(resolvedInput, "viewer.html");
fs.writeFileSync(outPath, template, "utf8");

console.log("✓ viewer.html created by GPT in:");
console.log(outPath);
console.log("Open via double-click or file://");
