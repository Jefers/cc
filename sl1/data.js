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
{ itemId: 'milk', name: 'Milk', quantity: 250, unit: 'ml' },
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
}
,

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
    name: 'Greek yogurt + buttered oats',
    calories: 250,
    notes: 'Greek yogurt (150g) + buttered toast or more oats',
    ingredients: [
        { itemId: 'greek-yogurt', name: 'Greek yogurt', quantity: 150, unit: 'g' },
        { itemId: 'porridge-oats', name: 'Porridge oats', quantity: 30, unit: 'g' },
        { itemId: 'butter', name: 'Butter', quantity: 10, unit: 'g' }
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
],

plan: [
    {
        date: new Date().toISOString().split('T')[0],
        slots: ['day1-breakfast', 'day1-lunch', 'day1-dinner', 'day1-snack']
    },
    {
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        slots: ['day2-breakfast', 'day2-lunch', 'day2-dinner', 'day2-snack']
    },
    {
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        slots: ['day3-breakfast', 'day3-lunch', 'day3-dinner', 'day3-snack']
    }
],

supplements: [
    {
        id: 'vitamin-c',
        name: 'Vitamin C',
        dosage: '250-500 mg/day',
        reason: 'Despite satsumas, still needed for full coverage',
        priority: 'essential'
    },
    {
        id: 'magnesium',
        name: 'Magnesium',
        dosage: '200-400 mg/day',
        reason: 'Low in meat/dairy-only diets',
        priority: 'essential'
    },
    {
        id: 'vitamin-k2',
        name: 'Vitamin K2 (MK-7)',
        dosage: '100-200 mcg/day',
        reason: 'Not reliably present unless eating liver or fermented foods',
        priority: 'essential'
    },
    {
        id: 'iodine',
        name: 'Iodine',
        dosage: '150 mcg/day',
        reason: 'Especially if seaweed or iodized salt isn\'t consumed',
        priority: 'essential'
    },
    {
        id: 'vitamin-e',
        name: 'Vitamin E',
        dosage: '15 mg/day',
        reason: 'Low in your diet due to minimal plant oils',
        priority: 'essential'
    },
    {
        id: 'omega-3',
        name: 'Omega-3 (EPA/DHA)',
        dosage: '250-500 mg/day',
        reason: 'Sardines help here, so this is optional unless intake is <2x/week',
        priority: 'optional'
    },
    {
        id: 'fiber',
        name: 'Fiber supplement (psyllium husk)',
        dosage: '5-10 g/day',
        reason: 'To support gut health and prevent constipation',
        priority: 'essential'
    }
],

notes: {
    nutritionalStatus: [
        'You\'re getting plenty of B12, iron, retinol (A), protein, calcium from steak, eggs, milk, sardines.',
        'With your current plan, potassium and vitamin C are borderline — satsumas and bananas at work help.',
        'If beef liver becomes available again, it will replace several supplements.'
    ],
    optionalSupplements: [
        'Zinc and Selenium: likely okay with eggs, dairy, sardines, steak — but could monitor over time'
    ]
}
};   