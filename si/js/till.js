// till.js
const Till = {
    render() {
        const tillSummary = document.getElementById('till-summary');
        const till = Storage.getTill();
        const transactions = Storage.getTransactions();
        const latestTill = till[till.length - 1];

        if (latestTill) {
            const expected = transactions.reduce((sum, t) => sum + t.moneyReceived, 0);
            const actual = latestTill.end - latestTill.start;
            const difference = actual - expected;

            tillSummary.innerHTML = `
                <p><strong>Date:</strong> ${new Date(latestTill.date).toLocaleDateString()}</p>
                <p><strong>Till Start:</strong> £${latestTill.start.toFixed(2)}</p>
                <p><strong>Till End:</strong> £${latestTill.end.toFixed(2)}</p>
                <p><strong>Expected Sales:</strong> £${expected.toFixed(2)}</p>
                <p><strong>Actual Sales:</strong> £${actual.toFixed(2)}</p>
                <p class="${difference !== 0 ? 'difference' : ''}">
                    <strong>Difference:</strong> £${difference.toFixed(2)}
                </p>
            `;
        } else {
            tillSummary.innerHTML = '<p>No till data recorded.</p>';
        }
    },

    save(start, end) {
        const till = Storage.getTill();
        till.push({
            date: new Date().toISOString(),
            start: parseFloat(start),
            end: parseFloat(end)
        });
        Storage.saveTill(till);
        Till.render();
        Transactions.calculate();
    }
};

const Transactions = {
    calculate() {
        const inventory = Storage.getInventory();
        const transactions = Storage.getTransactions();
        const today = new Date().toDateString();

        // Clear transactions for today to avoid duplicates
        const todayTransactions = transactions.filter(t => t.date !== today);
        const newTransactions = [];

        // Calculate sales based on quantity changes
        inventory.forEach(item => {
            // Note: This assumes you have a way to track previous quantities
            // For debugging, you may need to store previous inventory state
            // This is a simplified version; you can enhance it
            const previous = Storage.getInventory().find(i => i.id === item.id) || item;
            const sold = previous.quantity - item.quantity;
            if (sold > 0) {
                newTransactions.push({
                    date: today,
                    itemId: item.id,
                    description: item.description,
                    itemsSold: sold,
                    moneyReceived: sold * item.price
                });
            }
        });

        Storage.saveTransactions([...todayTransactions, ...newTransactions]);
        Transactions.render();
    },

    render() {
        const transactionsSummary = document.getElementById('transactions-summary');
        const transactions = Storage.getTransactions();
        if (transactions.length > 0) {
            transactionsSummary.innerHTML = transactions.map(t => `
                <p>${t.date}: ${t.description} - Sold: ${t.itemsSold} - £${t.moneyReceived.toFixed(2)}</p>
            `).join('');
        } else {
            transactionsSummary.innerHTML = '<p>No transactions recorded.</p>';
        }
    }
};