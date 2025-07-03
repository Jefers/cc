# Sleep Strategies App

A mobile-first web app for insomniacs to test and rate four sleep strategies over four weeks.

## Features
- Four sleep strategies with dedicated pages
- Timestamp recording for actions (e.g., "Last Meal", "Try to Sleep", "Going to CR")
- Rating system (1-5 stars)
- Data export via email
- Mobile-first, responsive, and accessible UI
- Local storage for data persistence

## Deployment
1. Clone the repository.
2. Ensure all files are in the `ss` directory.
3. Deploy to GitHub Pages:
   - Create a GitHub repository (e.g., `username/ss`).
   - Push the code to the repository.
   - Go to Settings > Pages in your repository.
   - Select the `main` branch and `/ss` folder.
   - Save and wait for the site to be published (e.g., `https://username.github.io/ss`).

## Development
- **Tech Stack**: HTML, CSS, JavaScript
- **Storage**: `localStorage`
- **Deployment**: GitHub Pages
- **Accessibility**: ARIA attributes, focus management, screen reader support
- **Performance**: Optimized for fast loading with minimal assets
- **JavaScript**: Uses global `App` namespace (no ES Modules for broader compatibility)

## Usage
1. Open the app on your mobile device or browser (`https://username.github.io/ss`).
2. Select a strategy to view details and record actions.
3. Use the action buttons to log timestamps.
4. Rate the strategy using the star buttons.
5. Export data via the "Export Data" button, which opens your email client with a pre-filled report.

## Notes
- No authentication is required.
- Data is stored locally and persists across sessions.
- The app avoids any mention of screen usage at night, per requirements.
- For local testing, run a server (e.g., `python -m http.server 8000`) and access `http://localhost:8000/index.html`.