const fs = require('fs');
const path = require('path');

// Parse command line arguments
let targetDir = null;
const args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir' && i + 1 < args.length) {
    targetDir = args[i + 1];
    break;
  } else if (args[i].startsWith('--dir=')) {
    targetDir = args[i].split('=')[1];
    break;
  }
}

if (!targetDir) {
  console.error('✗ Please specify a directory with --dir');
  process.exit(1);
}

// Resolve absolute path
const absoluteDir = path.resolve(targetDir);

// Verify folder exists
if (!fs.existsSync(absoluteDir) || !fs.statSync(absoluteDir).isDirectory()) {
  console.error(`✗ Directory not found: ${absoluteDir}`);
  process.exit(1);
}

// Define image extensions
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff', '.svg'];

// Scan folder for images
const files = fs.readdirSync(absoluteDir);
const images = files
  .filter(file => {
    const ext = path.extname(file).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  })
  .map(file => ({ filename: file }))
  .sort((a, b) => a.filename.localeCompare(b.filename));

console.log(`✓ Found ${images.length} images`);

// Read template
const templatePath = path.join(__dirname, 'viewer_template.html');
if (!fs.existsSync(templatePath)) {
  console.error(`✗ Template file not found: ${templatePath}`);
  process.exit(1);
}

let template = fs.readFileSync(templatePath, 'utf8');

// Replace manifest
const manifestJson = JSON.stringify(images, null, 2);
template = template.replace('/*__MANIFEST__*/', manifestJson);

// Write output
const outputPath = path.join(absoluteDir, 'viewer.html');
fs.writeFileSync(outputPath, template, 'utf8');

console.log(`✓ viewer.html created by Kimi in ${absoluteDir}`);