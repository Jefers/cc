**Prompt for Further Development of Francine’s Budgeting App**

I have a budgeting app MVP built with HTML, CSS, vanilla JavaScript, and localStorage, designed for mobile-first use with PWA capabilities. The app includes a dashboard, transaction entry, savings goals, forecasting, what-if simulations, and a Historical Transactions screen. Below is the context and requirements for further development.

**Existing Features**:
- **Dashboard**: Displays current balance, monthly burn rate, weekly transaction calendar, category distribution pie chart, and balance forecast (1 week, 1 month, 3 months).
- **Add Transaction**: Form for income/expense with fields for type, category (Job Income, Worker Wages, Rent, Utilities, Food, Big Expense, Savings Transfer), amount, estimated amount (for Utilities), date, description, recurring (day of month or weekly), and due date. Auto-saves 10% of income to a savings goal with user prompt.
- **Savings Goals**: Add goals with name, target amount, and target date. Tracks progress and triggers confetti at 25%, 50%, 75%, 100% milestones.
- **Historical Transactions**: Table showing all transactions (ID, Type, Amount (₱), Date, Category, Description, Due Date, Is Big, Recurring) with Edit (form) and Delete (confirmation) buttons. Updates localStorage and UI.
- **CSV Import/Export**: Imports `budget.csv` (format: `id,type,amount,date,category,description,dueDate,isBig,recurring`), validates headers, amounts, dates, categories, and recurring fields. Exports transactions to `budget.csv`. Persists data on refresh.
- **Clear All Data**: Testing-only button (visible with `?test=true` in URL) clears localStorage with confirmation.
- **UX**: Mobile-first, responsive table for history, vibrant color scheme (pink, teal, violet), iPhone-optimized touch targets.
- **PWA**: Includes `manifest.json` and `service-worker.js` for offline caching.
- **Sample Data**: 48 transactions (June–August 2025) with sporadic incomes (₱8000–15000), rent (₱6000), utilities (₱1000–1200), worker wages (₱1500–2000), daily food (~₱500), big expense (₱5000), savings transfers (₱1000).

**Files**:
- `index.html`: Main structure with dashboard, add transaction, savings goals, history, and settings sections.
- `style.css`: Mobile-first styling with scrollable history table, responsive layouts, and vibrant colors.
- `script.js`: Core logic for data management, UI updates, CSV handling, forecasting, and event listeners.
- `manifest.json`: PWA manifest for standalone app experience.
- `service-worker.js`: Caches static assets for offline use.
- `budget.csv`: Sample data for testing (48 transactions).

**Saved Work**:
- All files are saved in a `budget-app` directory with a Git repository.
- Sample `budget.csv` is available for import testing.
- Testing conducted in VS Code with Live Server, verifying CSV import, persistence, edit/delete, and export.

**Future Development Tasks**:
[Specify new features or improvements, e.g.,]
1. Add filtering/sorting to the Historical Transactions table (e.g., by date, category, amount).
2. Implement recurring transaction automation (e.g., auto-add monthly rent on the 10th).
3. Enhance forecasting with more granular projections (e.g., weekly breakdowns).
4. Add user authentication for data privacy (e.g., local PIN or cloud sync).
5. Optimize performance for large datasets (e.g., 1000+ transactions).

**Instructions**:
- Use the existing `script.js` as the base (attached or in the `budget-app` directory).
- Ensure compatibility with existing HTML/CSS structure and PWA setup.
- Validate new features with the sample `budget.csv` (48 transactions, June–August 2025).
- Maintain mobile-first UX, error handling, and localStorage persistence.
- Test thoroughly, including edge cases (e.g., invalid CSV, large datasets).
- Provide updated `script.js` (and other files if modified) with clear comments.

**Additional Notes**:
- Current date for testing: [Insert current date, e.g., August 27, 2025].
- Refer to the sample CSV data in `script.js` comments for testing scenarios.
- Ensure changes work offline (via service worker) and on mobile devices (iOS/Android).
- Avoid breaking existing features (e.g., forecasting, savings goals, reminders).

Please provide the updated code (starting with `script.js`) and explain changes made to address the new tasks. Ensure the response is concise and avoids unnecessary delays for large outputs.