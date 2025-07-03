import os

# Define the directory and file structure
structure = {
    "pinecraft": [
        "index.html",
        "game.html",
        "README.md",
        ("css", ["reset.css", "styles.css"]),
        ("js", ["game.js", "storage.js", "ui.js"]),
        ("assets", ["grass.png", "dirt.png", "stone.png"]),
    ]
}

# Create the directories and files
for root, items in structure.items():
    os.makedirs(root, exist_ok=True)
    for item in items:
        if isinstance(item, tuple):
            subdir, files = item
            subdir_path = os.path.join(root, subdir)
            os.makedirs(subdir_path, exist_ok=True)
            for file in files:
                open(os.path.join(subdir_path, file), 'w').close()
        else:
            open(os.path.join(root, item), 'w').close()

print("Project structure created successfully.")
