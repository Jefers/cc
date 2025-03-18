#!/bin/bash
# Deployment script for Gymerly app
# To use:
# 1. Place this script and the app files (index.html, style.css, script.js, plan-1.html) in the "gymerly" folder.
# 2. Open Terminal, navigate to the "gymerly" folder.
# 3. Run the script with: bash deploy.sh
#    Or make it executable with: chmod +x deploy.sh
#    Then run with: ./deploy.sh

# Change to the script's directory
cd "$(dirname "$0")"

# List of required files
required_files=("index.html" "style.css" "script.js" "plan-1.html")

# Check for missing files
missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "Error: The following required files are missing:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
else
    echo "All required files are present."
    echo "Opening Gymerly app in your default browser..."
    open index.html
fi