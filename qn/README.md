# QNotes (qn) - Mobile-first PWA Note-Taking App

A local-first, mobile-first note-taking PWA with Markdown support, version history, and export/import functionality.

## Features
- **Mobile-first design**: Optimized for touch devices
- **Markdown support**: Full Markdown rendering with sanitization
- **Local-first storage**: All data stored in localStorage
- **Version history**: Automatic versioning of card edits (last 10 versions)
- **Export/Import**: Backup and restore your entire library
- **PWA**: Installable with offline support
- **Dark/Light theme**: Toggle between color schemes
- **Drag & drop reorder**: Manual sorting of titles
- **Swype navigation**: Navigate cards with touch gestures
- **Accessibility**: ARIA labels, keyboard navigation, reduced motion support

## Installation
1. Serve the `qn/` directory with a static file server:
   ```bash
   python -m http.server 8000