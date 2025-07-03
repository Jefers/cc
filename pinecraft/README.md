# Pinecraft

A mobile-first, responsive web app simulating a simplified Minecraft game, built with HTML, CSS, and JavaScript. Deployed on GitHub Pages.

## Features
- Start page with a colorful "Pinecraft" title and "Play" button.
- 2D grid-based gameplay with block placement/breaking.
- Touch-optimized controls for mobile.
- Timer (hh:mm) in the bottom-right corner.
- Pause button to save progress and return to the start page.
- Local storage for saving game state.
- Accessible UX with ARIA attributes.
- Vivid, classic Minecraft colors.

## Setup
1. Clone the repository.
2. Add texture images (`grass.png`, `dirt.png`, `stone.png`) to the `assets/` folder.
3. Serve locally using a tool like `npx serve` or deploy to GitHub Pages.

## Deployment
- Push to a GitHub repository.
- Enable GitHub Pages in the repository settings (use the `main` branch).
- Access the app at `https://<username>.github.io/pinecraft`.

## Tech Stack
- HTML5
- CSS3 (Flexbox, Grid, custom properties)
- JavaScript (ES modules, Canvas API)
- Local Storage

## Accessibility
- ARIA attributes for screen readers.
- Touch-optimized interactions.
- Reduced motion support.