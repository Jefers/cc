// data.js – DEFAULT_DATA for 50+ Keto Protocol (70kg → 64kg, 1400 kcal, SPAR only)
const DEFAULT_DATA = {
  // ========== INVENTORY ITEMS ==========
  items: [
    // Protein
    { id: "chicken-thigh", name: "Chicken Thigh (skin-on, bone-in)", category: "protein", unit: "pcs", quantity: 20 },
    { id: "beef-mince", name: "Beef Mince 20% Fat", category: "protein", unit: "g", quantity: 500 },
    { id: "ribeye-steak", name: "Ribeye Steak", category: "protein", unit: "g", quantity: 250 },
    { id: "eggs", name: "Large Free Range Eggs", category: "protein", unit: "pcs", quantity: 12 },
    { id: "cooked-ham", name: "Cooked Ham (no glaze)", category: "protein", unit: "g", quantity: 150 },
    { id: "tuna-can", name: "Tuna in Spring Water (can)", category: "protein", unit: "pcs", quantity: 0 }, // optional bridge

    // Dairy & Fats
    { id: "golden-cow-butter", name: "Golden Cow Salted Butter", category: "dairy", unit: "g", quantity: 454 },
    { id: "double-cream", name: "Double Cream", category: "dairy", unit: "ml", quantity: 600 },
    { id: "mature-cheddar", name: "Mature White Cheddar", category: "dairy", unit: "g", quantity: 200 },
    { id: "french-brie", name: "French Brie 60%", category: "dairy", unit: "g", quantity: 200 },
    { id: "greek-yogurt", name: "Greek Style Yogurt 5% Fat", category: "dairy", unit: "g", quantity: 500 },

    // Pantry & Snacks
    { id: "pork-scratchings", name: "Pork Scratchings", category: "pantry", unit: "g", quantity: 80 }, // 2 bags * 40g
    { id: "sauerkraut", name: "Sauerkraut", category: "pantry", unit: "g", quantity: 500 },
    { id: "instant-coffee", name: "Instant Coffee", category: "pantry", unit: "g", quantity: 100 },
    { id: "pink-salt", name: "Pink Himalayan Salt", category: "pantry", unit: "g", quantity: 100 }
  ],

  // ========== MEAL TEMPLATES ==========
  meals: [
    {
      id: "chicken-dinner-3",
      name: "Air Fryer Chicken Thighs (3 pcs)",
      calories: 750,
      notes: "Cook 5, eat 3 for dinner, save 2 for breakfast",
      ingredients: [
        { itemId: "chicken-thigh", name: "Chicken Thigh (skin-on, bone-in)", quantity: 3, unit: "pcs" }
      ]
    },
    {
      id: "chicken-breakfast-2",
      name: "Cold Chicken Thighs (2 pcs)",
      calories: 500,
      notes: "Leftover from previous dinner",
      ingredients: [
        { itemId: "chicken-thigh", name: "Chicken Thigh (skin-on, bone-in)", quantity: 2, unit: "pcs" }
      ]
    },
    {
      id: "eggs-scrambled-3",
      name: "Scrambled Eggs (3 eggs + butter)",
      calories: 315,
      notes: "With 10g butter",
      ingredients: [
        { itemId: "eggs", name: "Large Free Range Eggs", quantity: 3, unit: "pcs" },
        { itemId: "golden-cow-butter", name: "Golden Cow Salted Butter", quantity: 10, unit: "g" }
      ]
    },
    {
      id: "beef-mince-cheddar",
      name: "Beef Mince with Cheddar",
      calories: 750,
      notes: "250g cooked mince + 30g cheddar",
      ingredients: [
        { itemId: "beef-mince", name: "Beef Mince 20% Fat", quantity: 250, unit: "g" },
        { itemId: "mature-cheddar", name: "Mature White Cheddar", quantity: 30, unit: "g" }
      ]
    },
    {
      id: "ribeye-garlic-butter",
      name: "Ribeye Steak with Garlic Butter",
      calories: 800,
      notes: "250g raw ribeye + 20g butter",
      ingredients: [
        { itemId: "ribeye-steak", name: "Ribeye Steak", quantity: 250, unit: "g" },
        { itemId: "golden-cow-butter", name: "Golden Cow Salted Butter", quantity: 20, unit: "g" }
      ]
    },
    {
      id: "snack-brie-ham",
      name: "Brie & Ham Snack",
      calories: 175,
      notes: "30g brie + 2 slices ham (approx 50g)",
      ingredients: [
        { itemId: "french-brie", name: "French Brie 60%", quantity: 30, unit: "g" },
        { itemId: "cooked-ham", name: "Cooked Ham (no glaze)", quantity: 50, unit: "g" }
      ]
    },
    {
      id: "snack-pork-scratchings",
      name: "Pork Scratchings (20g)",
      calories: 110,
      ingredients: [
        { itemId: "pork-scratchings", name: "Pork Scratchings", quantity: 20, unit: "g" }
      ]
    },
    {
      id: "snack-brie-only",
      name: "Brie (30g)",
      calories: 100,
      ingredients: [
        { itemId: "french-brie", name: "French Brie 60%", quantity: 30, unit: "g" }
      ]
    },
    {
      id: "leftover-mince",
      name: "Leftover Beef Mince",
      calories: 390,
      notes: "~150g cooked mince",
      ingredients: [
        { itemId: "beef-mince", name: "Beef Mince 20% Fat", quantity: 150, unit: "g" }
      ]
    },
    {
      id: "leftover-ribeye",
      name: "Leftover Ribeye Slices",
      calories: 280,
      notes: "~100g cooked steak",
      ingredients: [
        { itemId: "ribeye-steak", name: "Ribeye Steak", quantity: 100, unit: "g" }
      ]
    },
    {
      id: "greek-yogurt-plain",
      name: "Greek Yogurt (200g)",
      calories: 230,
      ingredients: [
        { itemId: "greek-yogurt", name: "Greek Style Yogurt 5% Fat", quantity: 200, unit: "g" }
      ]
    },
    {
      id: "sauerkraut-side",
      name: "Sauerkraut Side (50g)",
      calories: 10,
      ingredients: [
        { itemId: "sauerkraut", name: "Sauerkraut", quantity: 50, unit: "g" }
      ]
    },
    {
      id: "coffee-cream",
      name: "Coffee with Double Cream",
      calories: 100,
      notes: "2 tbsp (30ml) cream",
      ingredients: [
        { itemId: "double-cream", name: "Double Cream", quantity: 30, unit: "ml" }
      ]
    },
    {
      id: "tuna-bridge",
      name: "Tuna Protein Bridge",
      calories: 100,
      notes: "Optional – helps hit 140g protein",
      ingredients: [
        { itemId: "tuna-can", name: "Tuna in Spring Water (can)", quantity: 1, unit: "pcs" }
      ]
    }
  ],

  // ========== 7‑DAY PLAN (4 slots per day: Breakfast, Lunch, Dinner, Snack/Bridge) ==========
  plan: [
    { date: "2026-04-21", slots: ["eggs-scrambled-3", "snack-brie-ham", "chicken-dinner-3", null] },
    { date: "2026-04-22", slots: ["chicken-breakfast-2", "snack-pork-scratchings", "chicken-dinner-3", null] },
    { date: "2026-04-23", slots: ["chicken-breakfast-2", "snack-brie-ham", "beef-mince-cheddar", null] },
    { date: "2026-04-24", slots: ["leftover-mince", "snack-brie-only", "chicken-dinner-3", null] },
    { date: "2026-04-25", slots: ["chicken-breakfast-2", "snack-pork-scratchings", "ribeye-garlic-butter", null] },
    { date: "2026-04-26", slots: ["leftover-ribeye", "snack-brie-ham", "chicken-dinner-3", null] },
    { date: "2026-04-27", slots: ["chicken-breakfast-2", "snack-brie-only", "beef-mince-cheddar", null] }
  ],

  // ========== SUPPLEMENT RECOMMENDATIONS ==========
  supplements: [
    {
      id: "liver-capsules",
      name: "Desiccated Beef Liver Capsules",
      dosage: "6 capsules daily (AM)",
      reason: "Replaces greens powder – provides Vitamin A, B12, Folate, Copper.",
      priority: "essential"
    },
    {
      id: "magnesium-glycinate",
      name: "Magnesium Glycinate",
      dosage: "400 mg at bedtime",
      reason: "Improves sleep depth, prevents muscle cramps and constipation.",
      priority: "essential"
    },
    {
      id: "potassium-citrate",
      name: "Potassium Citrate",
      dosage: "200–400 mg with dinner",
      reason: "Prevents electrolyte imbalance (cramps, fatigue) on low‑carb diet.",
      priority: "essential"
    },
    {
      id: "sodium",
      name: "Pink Himalayan Salt",
      dosage: "¼ tsp in water AM + liberally on food",
      reason: "Critical for energy and avoiding 'keto flu'.",
      priority: "essential"
    },
    {
      id: "vitamin-d3-k2",
      name: "Vitamin D3 + K2",
      dosage: "5,000 IU D3 / 100 mcg K2 daily",
      reason: "Supports insulin sensitivity, bone health, and testosterone.",
      priority: "optional"
    }
  ],

  // ========== NOTES ==========
  notes: {
    nutritionalStatus: [
      "Target: 1,400 kcal/day with ~140g protein (2.0g/kg).",
      "Net carbs <20g to maintain ketosis.",
      "Drink 2–3L water daily with extra sodium.",
      "Hunger is normal in Week 1–2; use warm salt water as appetite suppressant."
    ],
    optionalSupplements: [
      "Vitamin D3 + K2 recommended for 50+ bone and metabolic health.",
      "MCT oil can be added to coffee for quick ketones (use sparingly)."
    ]
  }
};
