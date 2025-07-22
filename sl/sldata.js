// Default data structure for the meal planner
const DEFAULT_DATA = {
    items: [
        // Animal-based proteins
        { id: 'beef-steak', name: 'Beef steak', category: 'protein', unit: 'g', quantity: 1000 },
        { id: 'eggs', name: 'Eggs', category: 'protein', unit: 'pcs', quantity: 18 },
        { id: 'milk', name: 'Milk', category: 'dairy', unit: 'ml', quantity: 2000 },
        { id: 'sardines', name: 'Sardines (canned, with bones)', category: 'protein', unit: 'g', quantity: 600 },
        { id: 'butter', name: 'Butter', category: 'dairy', unit: 'g', quantity: 500 },
        { id: 'greek-yogurt', name: 'Greek yogurt', category: 'dairy', unit: 'g', quantity: 1000 },
        
        // Carbs/sweets
        { id: 'white-rice', name: 'White rice', category: 'pantry', unit: 'g', quantity: 1000 },
        { id: 'porridge-oats', name: 'Porridge oats', category: 'pantry', unit: 'g', quantity: 500 },
        { id: 'honey', name: 'Honey', category: 'pantry', unit: 'g', quantity: 250 },
        { id: 'satsumas', name: 'Satsumas', category: 'produce', unit: 'pcs', quantity: 4 },
        { id: 'banana', name: 'Banana', category: 'produce', unit: 'pcs', quantity: 3 }
    ],

    meals: [
        // Day 1 meals
        {
            id: 'day1-breakfast',
            name: '3 eggs scrambled in butter + oats with milk & honey',
            calories: 550,
            ingredients: [
                { itemId: 'eggs', name: 'Eggs', quantity: 3, unit: 'pcs' },
                { itemId: 'butter', name: 'Butter', quantity: 20, unit: 'g' },
                { itemId: 'porridge-oats', name: 'Porridge oats', quantity: 50, unit: 'g' },
                { itemId: 'milk', name: 'Milk', quantity: 200, unit: 'ml' },
                { itemId: 'honey', name: 'Honey', quantity: 15, unit: 'g' }
            ]
        },
        {
            id: 'day1-lunch',
            name: 'White rice + sardines + satsuma',
            calories: 500,
            notes: 'work lunch',
            ingredients: [
                { itemId: 'white-rice', name: 'White rice', quantity: 100, unit: 'g' },
                { itemId: 'sardines', name: 'Sardines (canned, with bones)', quantity: 100, unit: 'g' },
                { itemId: 'satsumas', name: 'Satsumas', quantity: 1, unit: 'pcs' }
            ]
        },
        {
            id: 'day1-snack',
            name: 'Greek yogurt + honey',
            calories: 200,
            ingredients: [
                { itemId: 'greek-yogurt', name: 'Greek yogurt', quantity: 200, unit: 'g' },
                { itemId: 'honey', name: 'Honey', quantity: 10, unit: 'g' }
            ]
        },
        {
            id: 'day1-dinner',
            name: 'Beef steak + butter + milk',
            calories: 550,
            ingredients: [
                { itemId: 'beef-steak', name: 'Beef steak', quantity: 200, unit: 'g' },
                { itemId: 'butter', name: 'Butter', quantity: 15, unit: 'g' },
                { itemId: 'milk', name: 'Milk', quantity: 200, unit: 'ml' }
            ]
        },

        // Day 2 meals
        {
            id: 'day2-breakfast',
            name: 'Porridge with milk, honey + Greek yogurt',
            calories: 500,
            ingredients: [
                { itemId: 'porridge-oats', name: 'Porridge oats', quantity: 60, unit: 'g' },
                { itemId: 'milk', name: 'Milk', quantity: 200, unit: 'ml' },
                { itemId: 'honey', name: 'Honey', quantity: 15, unit: 'g' },
                { itemId: 'greek-yogurt', name: 'Greek yogurt', quantity: 100, unit: 'g' }
            ]
        },
        {
            id: 'day2-lunch',
            name: 'White rice + sardines + banana + satsuma',
            calories: 550,
            notes: 'work lunch',
            ingredients: [
                { itemId: 'white-rice', name: 'White rice', quantity: 100, unit: 'g' },
                { itemId: 'sardines', name: 'Sardines (canned, with bones)', quantity: 100, unit: 'g' },
                { itemId: 'banana', name: 'Banana', quantity: 1, unit: 'pcs' },
                { itemId: 'satsumas', name: 'Satsumas', quantity: 1, unit: 'pcs' }
            ]
        },
        {
            id: 'day2-snack',
            name: '2 eggs boiled + butter',
            calories: 200,
            ingredients: [
                { itemId: 'eggs', name: 'Eggs', quantity: 2, unit: 'pcs' },
                { itemId: 'butter', name: 'Butter', quantity: 10, unit: 'g' }
            ]
        },
        {
            id: 'day2-dinner',
            name: 'Beef steak + milk',
            calories: 550,
            ingredients: [
                { itemId: 'beef-steak', name: 'Beef steak', quantity: 200, unit: 'g' },
                { itemId: 'milk', name: 'Milk', quantity: 200, unit: 'ml' }
            ]
        },

        // Day 3 meals
        {
            id: 'day3-breakfast',
            name: '2 eggs + oats with milk & honey',
            calories: 500,
            ingredients: [
                { itemId: 'eggs', name: 'Eggs', quantity: 2, unit: 'pcs' },
                { itemId: 'porridge-oats', name: 'Porridge oats', quantity: 50, unit: 'g' },
                { itemId: 'milk', name: 'Milk', quantity: 200, unit: 'ml' },
                { itemId: 'honey', name: 'Honey', quantity: 15, unit: 'g' }
            ]
        },
        {
            id: 'day3-lunch',
            name: 'Sardines + white rice + satsuma',
            calories: 500,
            notes: 'home lunch',
            ingredients: [
                { itemId: 'sardines', name: 'Sardines (canned, with bones)', quantity: 100, unit: 'g' },
                { itemId: 'white-rice', name: 'White rice', quantity: 100, unit: 'g' },
                { itemId: 'satsumas', name: 'Satsumas', quantity: 1, unit: 'pcs' }
            ]
        },
        {
            id: 'day3-snack',
            name: 'Greek yogurt + oats',
            calories: 250,
            ingredients: [
                { itemId: 'greek-yogurt', name: 'Greek yogurt', quantity: 150, unit: 'g' },
                { itemId: 'porridge-oats', name: 'Porridge oats', quantity: 30, unit: 'g' }
            ]
        },
        {
            id: 'day3-dinner',
            name: 'Beef steak + milk + butter',
            calories: 550,
            ingredients: [
                { itemId: 'beef-steak', name: 'Beef steak', quantity: 150, unit: 'g' },
                { itemId: 'milk', name: 'Milk', quantity: 200, unit: 'ml' },
                { itemId: 'butter', name: 'Butter', quantity: 15, unit: 'g' }
            ]
        }
    ]
};

module.exports = DEFAULT_DATA;
