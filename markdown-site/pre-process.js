const fs = require('fs');
const path = require('path');

// Function to create URL-friendly filenames
function generateFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
}

// Read the large MD file
const mdContent = fs.readFileSync('large-file.md', 'utf8');

// Split into sections at "# " (top-level headings)
const sections = mdContent.split(/\n(?=# )/);

// Process each section
const pages = sections.map(section => {
  const lines = section.trim().split('\n');
  const title = lines[0].replace(/^# /, '').trim(); // Extract title
  const content = lines.slice(1).join('\n').trim(); // Extract content
  const mdFilename = `${generateFilename(title)}.md`;
  const contentPath = path.join('content', mdFilename);

  // Write the individual MD file
  fs.mkdirSync('content', { recursive: true }); // Ensure content/ exists
  fs.writeFileSync(contentPath, content);

  return {
    title: title,
    filename: `${generateFilename(title)}.html`,
    heading: title.split(':')[0].trim(), // Shorten heading (before colon)
    content_file: contentPath
  };
});

// Generate YAML entries
const yamlEntries = pages.map(page => `
  - title: "${page.title}"
    filename: "${page.filename}"
    heading: "${page.heading}"
    content_file: "${page.content_file}"`).join('\n');

// Write to YAML file
fs.writeFileSync('data.yaml', `pages:${yamlEntries}\n`, 'utf8');

console.log('MD files and YAML generated successfully!');