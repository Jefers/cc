const fs = require('fs');
const yaml = require('js-yaml');
const marked = require('marked'); // Import marked

// Load YAML file
function loadYAML(filename) {
    return yaml.load(fs.readFileSync(filename, 'utf8'));
}

// Generate navigation menu dynamically with active class
function generateMenu(pages, currentFilename) {
    return pages.map(page => {
        let activeClass = page.filename === currentFilename ? 'class="active"' : '';
        return `<li><a href="${page.filename}" ${activeClass}>${page.title}</a></li>`;
    }).join('\n');
}

// Generate static HTML page
function generatePage(template, page, menu) {
    const contentMd = fs.readFileSync(page.content_file, 'utf8');
    const contentHtml = marked.parse(contentMd); // Use marked.parse() instead of marked()
    let output = template
        .replace('{{title}}', page.title)
        .replace('{{heading}}', page.heading)
        .replace('{{content}}', contentHtml)
        .replace('{{menu}}', menu);

    let outputPath = `pages/${page.filename}`;
    fs.writeFileSync(outputPath, output);
    console.log(`✅ Generated: ${outputPath}`);
}

// Main function
function main() {
    console.log("🔄 Generating static pages...");

    // Load template and data
    const template = fs.readFileSync('template.html', 'utf8');
    const data = loadYAML('data.yaml');

    // Ensure 'pages/' folder exists
    if (!fs.existsSync('pages')) {
        fs.mkdirSync('pages');
    }

    // Generate each page with its own navigation
    data.pages.forEach(page => {
        const menu = generateMenu(data.pages, page.filename);
        generatePage(template, page, menu);
    });

    console.log("🎉 All pages generated successfully!");
}

// Run the script
main();