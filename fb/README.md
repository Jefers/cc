# Francine's Budget App

A mobile-first, offline-capable budgeting app to track income, expenses, savings goals, and financial projections, designed for Francine's financial needs with a vibrant, modern UI.

## Features
- **Transaction Tracking**: Add income (e.g., Job Income) and expenses (e.g., Rent, Worker Wages) with recurring options and notes.
- **Savings Goals**: Set goals (e.g., Emergency Buffer) with progress bars and confetti animations for milestones (25%, 50%, 75%, 100%).
- **Forecasting**: View balance projections for 1 week, 1 month, or 3 months with warnings (e.g., "Short ₱2000 in 30 days") and goal-specific advice (e.g., "Save ₱200/week").
- **What-If Simulator**: Adjust daily spending by category to see impacts on projections.
- **Educational Tips**: Dismissible pop-ups with advice like "Build a buffer for 1 month's expenses."
- **Incentives**: Badges for saving 3 weeks straight and confetti for goal milestones.
- **CSV Import/Export**: Export transactions to `budget.csv` and import from CSV with validation.
- **PWA Support**: Installable on iPhone with offline functionality via service worker.
- **iPhone Optimized**: Touch-friendly with large tap targets and smooth scrolling.
- **Currency**: Uses ₱ (Philippine Peso) consistently.

## Installation
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd francines-budget-app



### Explanation of Changes
- **index.html**:
  - Added a `settings` section with "Export to CSV" button and "Import from CSV" file input.
  - Kept existing structure for dashboard, transactions, goals, and projections.

- **style.css**:
  - Added styles for `#settings` section, ensuring buttons and file input match the vibrant, touch-friendly design.
  - Adjusted grid layout for larger screens to accommodate export/import controls.
  - Maintained sophisticated color scheme (soft pink `#ff8e9e`, teal `#14b8a6`, violet `#7c3aed`).

- **manifest.json** and **service-worker.js**:
  - Unchanged, ensuring PWA readiness and offline caching of static assets.
  - Export functionality works offline (uses Blob); import requires file access.

- **script.js**:
  - **Sample CSV Data**: Added in comments, matching `loadTestData` with 10 transactions (incomes, bills on 10th, worker wages, dental expense, savings transfer).
  - **exportToCsv**:
    - Converts transactions to CSV with headers (`id,type,category,amount,estimatedAmount,date,description,recurring,recurringDay,goalId`).
    - Formats amounts with ₱ symbol (e.g., `₱12000.00`).
    - Escapes quotes in descriptions for CSV compatibility.
    - Triggers download as `budget.csv` using Blob and a temporary link.
  - **handleImportCsv**:
    - Reads uploaded CSV file using FileReader.
    - Validates file type, headers, and data (positive amounts, valid dates, categories, worker names for wages, goal IDs).
    - Adds valid transactions to `transactions` array, updates savings goals for transfers, and refreshes UI.
    - Alerts on errors (e.g., "Invalid CSV format: Incorrect headers").
  - **Error Handling**:
    - Checks for `.csv` extension, non-empty file, correct headers, and valid data formats.
    - Ensures unique IDs by using `Date.now()` for new transactions.
  - **Integration**:
    - Updates savings goals during import for `Savings Transfer` transactions, triggering confetti if milestones are reached.
    - Calls `updateDashboard`, `updateSavingsGoals`, `checkReminders`, `checkSavingsStreak`, and `updateForecast` after import.
  - **Other Functions**: Unchanged but integrated with import/export (e.g., updating goals and forecasts).

- **README.md**:
  - Updated to include CSV import/export instructions and testing steps.
  - Describes CSV format and sample data usage.

### Key Features
- **CSV Export**: Downloads `budget.csv` with all transactions, including ₱ formatting, works offline.
- **CSV Import**: Parses uploaded CSV, validates structure and data, updates transactions and goals, requires file access.
- **Error Handling**: Robust validation for CSV format, amounts, dates, and categories with user-friendly alerts.
- **Sample CSV**: Matches Francine’s scenarios (10 transactions), included in comments for testing.
- **Offline Support**: Export is fully offline; import needs file selection but validates offline.
- **iPhone UX**: Maintained touch-friendly design with large buttons and no hover effects.
- **PWA**: Service worker ensures offline access for UI and export.

This updated code adds seamless CSV import/export functionality, fully integrated with Francine’s budgeting app, while preserving all prior features and ensuring robust error handling and offline compatibility where possible.