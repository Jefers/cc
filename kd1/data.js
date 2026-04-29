const DEFAULT_DATA = {
  items: [
    // Protein – Fresh & Frozen (macros per unit: pcs or g)
    { id: "chicken-thigh", name: "Chicken Thigh (skin-on, bone-in)", category: "protein", unit: "pcs", quantity: 10, carbs: 0, fat: 20, protein: 30 },
    { id: "beef-mince", name: "Beef Mince 20% Fat", category: "protein", unit: "g", quantity: 400, carbs: 0, fat: 0.2, protein: 0.2 },
    { id: "ribeye-steak", name: "Ribeye Steak", category: "protein", unit: "g", quantity: 250, carbs: 0, fat: 0.22, protein: 0.2 },
    { id: "eggs", name: "Large Free Range Eggs", category: "protein", unit: "pcs", quantity: 10, carbs: 0.4, fat: 5, protein: 6 },
    { id: "cooked-ham", name: "Cooked Ham (no glaze)", category: "protein", unit: "g", quantity: 150, carbs: 0.02, fat: 0.05, protein: 0.2 },
    { id: "sardines", name: "Sardines in Olive Oil (can)", category: "protein", unit: "pcs", quantity: 4, carbs: 0, fat: 12, protein: 23 },

    // Protein – Supplements
    { id: "whey-protein", name: "Time 4 Whey (Strawberries & Cream)", category: "protein", unit: "g", quantity: 1800, carbs: 0.05, fat: 0.02, protein: 0.75 },
    { id: "creatine", name: "Creatine Monohydrate", category: "protein", unit: "g", quantity: 500, carbs: 0, fat: 0, protein: 0 },

    // Dairy & Fats
    { id: "golden-cow-butter", name: "Golden Cow Salted Butter", category: "dairy", unit: "g", quantity: 500, carbs: 0, fat: 0.82, protein: 0.01 },
    { id: "double-cream", name: "Double Cream", category: "dairy", unit: "ml", quantity: 600, carbs: 0.03, fat: 0.48, protein: 0.02 },
    { id: "mature-cheddar", name: "Mature White Cheddar", category: "dairy", unit: "g", quantity: 200, carbs: 0.01, fat: 0.34, protein: 0.25 },
    { id: "french-brie", name: "French Brie 60%", category: "dairy", unit: "g", quantity: 190, carbs: 0.01, fat: 0.30, protein: 0.17 },
    { id: "greek-yogurt", name: "Greek Style Yogurt 5% Fat", category: "dairy", unit: "g", quantity: 950, carbs: 0.04, fat: 0.05, protein: 0.09 },

    // Pantry & Snacks
    { id: "pork-scratchings", name: "Pork Scratchings", category: "pantry", unit: "g", quantity: 1500, carbs: 0.01, fat: 0.6, protein: 0.3 },
    { id: "sauerkraut", name: "Sauerkraut", category: "pantry", unit: "g", quantity: 700, carbs: 0.02, fat: 0, protein: 0.01 },
    { id: "psyllium-husk", name: "Psyllium Husk Powder", category: "pantry", unit: "g", quantity: 500, carbs: 0, fat: 0, protein: 0 },
    { id: "apple-cider-vinegar", name: "Apple Cider Vinegar (with Mother)", category: "pantry", unit: "ml", quantity: 1000, carbs: 0, fat: 0, protein: 0 },
    { id: "dark-chocolate-85", name: "Lindt Excellence 85% Cocoa", category: "pantry", unit: "g", quantity: 100, carbs: 0.15, fat: 0.46, protein: 0.1 },

    // Beverages
    { id: "instant-coffee", name: "Instant Coffee", category: "pantry", unit: "g", quantity: 200, carbs: 0.01, fat: 0, protein: 0.01 },
    { id: "tea-bags", name: "Various Teas", category: "pantry", unit: "pcs", quantity: 40, carbs: 0, fat: 0, protein: 0 },

    // Condiments & Specials
    { id: "pink-salt", name: "Pink Himalayan Salt", category: "pantry", unit: "g", quantity: 250, carbs: 0, fat: 0, protein: 0 },
    { id: "pomegranate-concentrate", name: "Pomegranate Juice Concentrate", category: "pantry", unit: "ml", quantity: 500, carbs: 0.6, fat: 0, protein: 0 }
  ],

  meals: [
    { id: "chicken-breakfast-2", name: "Cold Chicken Thighs (2 pcs)", calories: 500, notes: "Leftover from previous dinner", ingredients: [ { itemId: "chicken-thigh", name: "Chicken Thigh (skin-on, bone-in)", quantity: 2, unit: "pcs" } ] },
    { id: "eggs-scrambled-3", name: "Scrambled Eggs (3 eggs + butter)", calories: 315, notes: "With 10g butter", ingredients: [ { itemId: "eggs", name: "Large Free Range Eggs", quantity: 3, unit: "pcs" }, { itemId: "golden-cow-butter", name: "Golden Cow Salted Butter", quantity: 10, unit: "g" } ] },
    { id: "leftover-mince-breakfast", name: "Leftover Beef Mince", calories: 390, notes: "~150g cooked mince", ingredients: [ { itemId: "beef-mince", name: "Beef Mince 20% Fat", quantity: 150, unit: "g" } ] },
    { id: "leftover-ribeye-breakfast", name: "Leftover Ribeye Slices", calories: 280, notes: "~100g cooked steak", ingredients: [ { itemId: "ribeye-steak", name: "Ribeye Steak", quantity: 100, unit: "g" } ] },
    { id: "snack-brie-ham", name: "Brie & Ham Snack", calories: 175, notes: "30g brie + 2 slices ham (~50g)", ingredients: [ { itemId: "french-brie", name: "French Brie 60%", quantity: 30, unit: "g" }, { itemId: "cooked-ham", name: "Cooked Ham (no glaze)", quantity: 50, unit: "g" } ] },
    { id: "snack-pork-scratchings", name: "Pork Scratchings (20g)", calories: 110, notes: "Crunch craving killer", ingredients: [ { itemId: "pork-scratchings", name: "Pork Scratchings", quantity: 20, unit: "g" } ] },
    { id: "snack-brie-only", name: "Brie (30g)", calories: 100, notes: "Quick fat hit", ingredients: [ { itemId: "french-brie", name: "French Brie 60%", quantity: 30, unit: "g" } ] },
    { id: "snack-sardines", name: "Sardines (1 can)", calories: 200, notes: "Omega-3 boost. 2x per week.", ingredients: [ { itemId: "sardines", name: "Sardines in Olive Oil (can)", quantity: 1, unit: "pcs" } ] },
    { id: "chicken-dinner-3", name: "Air Fryer Chicken Thighs (3 pcs) + Sauerkraut", calories: 760, notes: "Cook 5, eat 3. Save 2 for breakfast. Serve with 50g sauerkraut.", ingredients: [ { itemId: "chicken-thigh", name: "Chicken Thigh (skin-on, bone-in)", quantity: 3, unit: "pcs" }, { itemId: "sauerkraut", name: "Sauerkraut", quantity: 50, unit: "g" } ] },
    { id: "beef-mince-cheddar", name: "Beef Mince with Cheddar", calories: 750, notes: "250g cooked mince + 30g cheddar", ingredients: [ { itemId: "beef-mince", name: "Beef Mince 20% Fat", quantity: 250, unit: "g" }, { itemId: "mature-cheddar", name: "Mature White Cheddar", quantity: 30, unit: "g" } ] },
    { id: "ribeye-garlic-butter", name: "Ribeye Steak with Garlic Butter", calories: 800, notes: "250g raw ribeye + 20g butter. Friday treat.", ingredients: [ { itemId: "ribeye-steak", name: "Ribeye Steak", quantity: 250, unit: "g" }, { itemId: "golden-cow-butter", name: "Golden Cow Salted Butter", quantity: 20, unit: "g" } ] },
    { id: "sardines-dinner", name: "Sardines with Butter & Cheddar", calories: 400, notes: "1 can sardines + 15g butter + 20g cheddar. Light dinner option.", ingredients: [ { itemId: "sardines", name: "Sardines in Olive Oil (can)", quantity: 1, unit: "pcs" }, { itemId: "golden-cow-butter", name: "Golden Cow Salted Butter", quantity: 15, unit: "g" }, { itemId: "mature-cheddar", name: "Mature White Cheddar", quantity: 20, unit: "g" } ] },
    { id: "whey-bridge", name: "Whey Protein Shake (1 scoop)", calories: 120, notes: "Time 4 Whey – 30g scoop. Mix with water. Essential for hitting 140g protein.", ingredients: [ { itemId: "whey-protein", name: "Time 4 Whey (Strawberries & Cream)", quantity: 30, unit: "g" } ] },
    { id: "dark-chocolate-square", name: "85% Dark Chocolate (10g)", calories: 60, notes: "2 squares. End of day sanity keeper.", ingredients: [ { itemId: "dark-chocolate-85", name: "Lindt Excellence 85% Cocoa", quantity: 10, unit: "g" } ] },
    { id: "coffee-cream", name: "Coffee with Double Cream", calories: 100, notes: "2 tbsp (30ml) cream per coffee. Have 2–3 daily.", ingredients: [ { itemId: "double-cream", name: "Double Cream", quantity: 30, unit: "ml" } ] },
    { id: "greek-yogurt-plain", name: "Greek Yogurt (200g)", calories: 230, notes: "Alternative breakfast or snack.", ingredients: [ { itemId: "greek-yogurt", name: "Greek Style Yogurt 5% Fat", quantity: 200, unit: "g" } ] }
  ],

  plan: [
    { date: "2026-04-28", slots: ["eggs-scrambled-3", "snack-brie-ham", "chicken-dinner-3", "whey-bridge"] },
    { date: "2026-04-29", slots: ["chicken-breakfast-2", "snack-pork-scratchings", "chicken-dinner-3", "whey-bridge"] },
    { date: "2026-04-30", slots: ["chicken-breakfast-2", "snack-sardines", "beef-mince-cheddar", "whey-bridge"] },
    { date: "2026-05-01", slots: ["leftover-mince-breakfast", "snack-brie-only", "chicken-dinner-3", "whey-bridge"] },
    { date: "2026-05-02", slots: ["chicken-breakfast-2", "snack-pork-scratchings", "ribeye-garlic-butter", "whey-bridge"] },
    { date: "2026-05-03", slots: ["leftover-ribeye-breakfast", "snack-sardines", "chicken-dinner-3", "whey-bridge"] },
    { date: "2026-05-04", slots: ["chicken-breakfast-2", "snack-brie-ham", "beef-mince-cheddar", "whey-bridge"] }
  ],

  supplements: [
    { id: "liver-capsules", name: "Desiccated Beef Liver Capsules", dosage: "6 capsules daily (AM)", reason: "Replaces greens powder – provides Vitamin A, B12, Folate, Copper.", priority: "essential" },
    { id: "magnesium-glycinate", name: "Magnesium Glycinate", dosage: "400 mg at bedtime", reason: "Improves sleep depth, prevents muscle cramps and constipation.", priority: "essential" },
    { id: "vitamin-d3-k2", name: "Vitamin D3 + K2 Liquid", dosage: "4000 IU D3 / 25 mcg K2 daily", reason: "Immunity, bone health, insulin sensitivity. Fast absorption oil.", priority: "essential" },
    { id: "creatine", name: "Creatine Monohydrate", dosage: "7g on training days (2x/week) or daily as preferred", reason: "Supports muscle retention and power output during caloric deficit. Hydrate extra.", priority: "essential" },
    { id: "psyllium-husk", name: "Psyllium Husk Powder", dosage: "1 heaped tsp in large glass of water each morning", reason: "Provides bulk/fibre missing from vegetables. Supports digestive regularity.", priority: "essential" },
    { id: "apple-cider-vinegar", name: "Apple Cider Vinegar (with Mother)", dosage: "~50ml (sherry glass) spread over day in water", reason: "May support blood glucose regulation and digestion.", priority: "optional" },
    { id: "pomegranate-concentrate", name: "Pomegranate Juice Concentrate", dosage: "½ sherry glass (~25ml) on resistance training days ONLY (2x/week), post-workout", reason: "Strategic carb cycling. Muscles soak up fructose post-exercise. Skip on rest days.", priority: "optional" },
    { id: "sodium", name: "Pink Himalayan Salt", dosage: "¼ tsp in water AM + ½ tsp warm water at 10:30am if hungry + liberally on food", reason: "Critical for energy, appetite suppression, and avoiding 'keto flu'.", priority: "essential" },
    { id: "potassium-citrate", name: "Potassium Citrate", dosage: "200–400 mg with dinner IF cramps occur", reason: "ONLY if experiencing calf cramps or heart palpitations. Otherwise skip.", priority: "optional" }
  ],

  notes: {
    nutritionalStatus: [
      "🎯 TARGET: 1,400 kcal/day with ~140g protein (1.4g/kg body weight).",
      "🥩 Net carbs <20g to maintain ketosis.",
      "💧 Drink 2–3L water daily. Extra sodium required.",
      "☕ Coffee with double cream (30ml per cup). 2–3 cups fine.",
      "🍫 10g 85% dark chocolate daily – accounted for in macros.",
      "🐟 Sardines 2x/week (Wednesday & Saturday).",
      "🍷 Pomegranate concentrate ONLY on resistance training days (post-workout).",
      "🥄 1 heaped tsp psyllium husk in water each morning.",
      "🧂 Hunger at 10:30am? Warm water + ½ tsp pink salt kills it in 10 mins."
    ],
    optionalSupplements: [
      "Apple Cider Vinegar – 50ml spread across day in water.",
      "Potassium Citrate – keep on hand; use only if cramps appear.",
      "Electrolyte awareness: Low insulin = sodium dumping. Salt everything."
    ]
  }
};