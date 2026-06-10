const DEFAULT_DATA = {
  // ---------- TARGETS ----------
  targets: {
    rest:    { calories: 1250, protein: 140, carbs: 20, fat: 85 },
    training:{ calories: 1450, protein: 140, carbs: 50, fat: 70 }
  },
  carbCycleItem: { id: "carb-allowance", name: "Carb Allowance (30g)", category: "carb-cycle", unit: "g", quantity: 100, carbs: 1, fat: 0, protein: 0, portionAmount: 30 },

  items: [
    // Protein - Fresh & Frozen (macros per unit: pcs or g)
    { id: "chicken-thigh", name: "Chicken Thigh (skin-on, bone-in)", category: "protein", unit: "pcs", quantity: 10, carbs: 0, fat: 20, protein: 30 },
    { id: "beef-mince", name: "Beef Mince 20% Fat", category: "protein", unit: "g", quantity: 400, carbs: 0, fat: 0.2, protein: 0.2 },
    { id: "ribeye-steak", name: "Ribeye Steak", category: "protein", unit: "g", quantity: 250, carbs: 0, fat: 0.22, protein: 0.2 },
    { id: "eggs", name: "Large Free Range Eggs", category: "protein", unit: "pcs", quantity: 10, carbs: 0.4, fat: 5, protein: 6 },
    { id: "cooked-ham", name: "Cooked Ham (no glaze)", category: "protein", unit: "g", quantity: 150, carbs: 0.02, fat: 0.05, protein: 0.2 },
    { id: "sardines", name: "Sardines in Olive Oil (can)", category: "protein", unit: "pcs", quantity: 4, carbs: 0, fat: 12, protein: 23 },
    { id: "salmon-fillet", name: "Salmon Fillet (skin-on)", category: "protein", unit: "g", quantity: 300, carbs: 0, fat: 0.16, protein: 0.22 },
    { id: "pork-belly", name: "Pork Belly (sliced)", category: "protein", unit: "g", quantity: 250, carbs: 0, fat: 0.35, protein: 0.15 },

    // Protein - Supplements
    { id: "whey-protein", name: "Time 4 Whey (Strawberries & Cream)", category: "protein", unit: "g", quantity: 1800, carbs: 0.05, fat: 0.02, protein: 0.75 },
    { id: "creatine", name: "Creatine Monohydrate", category: "protein", unit: "g", quantity: 500, carbs: 0, fat: 0, protein: 0 },

    // Dairy & Fats
    { id: "golden-cow-butter", name: "Golden Cow Salted Butter", category: "dairy", unit: "g", quantity: 500, carbs: 0, fat: 0.82, protein: 0.01 },
    { id: "double-cream", name: "Double Cream", category: "dairy", unit: "ml", quantity: 600, carbs: 0.03, fat: 0.48, protein: 0.02 },
    { id: "mature-cheddar", name: "Mature White Cheddar", category: "dairy", unit: "g", quantity: 200, carbs: 0.01, fat: 0.34, protein: 0.25 },
    { id: "french-brie", name: "French Brie 60%", category: "dairy", unit: "g", quantity: 190, carbs: 0.01, fat: 0.30, protein: 0.17 },
    { id: "greek-yogurt", name: "Greek Style Yogurt 5% Fat", category: "dairy", unit: "g", quantity: 950, carbs: 0.04, fat: 0.05, protein: 0.09 },

    // Carb Cycle Sources
    { id: "pomegranate-concentrate", name: "Pomegranate Juice Concentrate", category: "carb-cycle", unit: "ml", quantity: 500, carbs: 0.6, fat: 0, protein: 0, portionAmount: 25 },
    { id: "sweet-potato", name: "Sweet Potato (cubed)", category: "carb-cycle", unit: "g", quantity: 500, carbs: 0.2, fat: 0, protein: 0.02, portionAmount: 150 },
    { id: "jasmine-rice", name: "Jasmine White Rice (cooked)", category: "carb-cycle", unit: "g", quantity: 300, carbs: 0.28, fat: 0, protein: 0.03, portionAmount: 100 },
    { id: "banana", name: "Banana (medium)", category: "carb-cycle", unit: "pcs", quantity: 4, carbs: 27, fat: 0.3, protein: 1.3, portionAmount: 1 },

    // Pantry & Snacks
    { id: "pork-scratchings", name: "Pork Scratchings", category: "pantry", unit: "g", quantity: 1500, carbs: 0.01, fat: 0.6, protein: 0.3 },
    { id: "sauerkraut", name: "Sauerkraut", category: "pantry", unit: "g", quantity: 700, carbs: 0.02, fat: 0, protein: 0.01 },
    { id: "psyllium-husk", name: "Psyllium Husk Powder", category: "pantry", unit: "g", quantity: 500, carbs: 0, fat: 0, protein: 0 },
    { id: "apple-cider-vinegar", name: "Apple Cider Vinegar (with Mother)", category: "pantry", unit: "ml", quantity: 1000, carbs: 0, fat: 0, protein: 0 },
    { id: "dark-chocolate-85", name: "Lindt Excellence 85% Cocoa", category: "pantry", unit: "g", quantity: 100, carbs: 0.15, fat: 0.46, protein: 0.1 },
    { id: "mixed-nuts", name: "Mixed Nuts (Macadamia, Almonds)", category: "pantry", unit: "g", quantity: 200, carbs: 0.07, fat: 0.65, protein: 0.15 },

    // Beverages
    { id: "instant-coffee", name: "Instant Coffee", category: "pantry", unit: "g", quantity: 200, carbs: 0.01, fat: 0, protein: 0.01 },
    { id: "tea-bags", name: "Various Teas", category: "pantry", unit: "pcs", quantity: 40, carbs: 0, fat: 0, protein: 0 },
    { id: "electrolyte-powder", name: "Electrolyte Powder (no sugar)", category: "pantry", unit: "pcs", quantity: 30, carbs: 0, fat: 0, protein: 0 },

    // Condiments
    { id: "pink-salt", name: "Pink Himalayan Salt", category: "pantry", unit: "g", quantity: 250, carbs: 0, fat: 0, protein: 0 }
  ],

  meals: [
    // --- Breakfasts ---
    { id: "eggs-scrambled-3", name: "Scrambled Eggs (3 eggs + butter)", calories: 315, notes: "With 10g butter. Solid start.", ingredients: [ { itemId: "eggs", name: "Large Free Range Eggs", quantity: 3, unit: "pcs" }, { itemId: "golden-cow-butter", name: "Golden Cow Salted Butter", quantity: 10, unit: "g" } ] },
    { id: "greek-yogurt-200", name: "Greek Yogurt (200g)", calories: 230, notes: "Alternative breakfast or snack.", ingredients: [ { itemId: "greek-yogurt", name: "Greek Style Yogurt 5% Fat", quantity: 200, unit: "g" } ] },
    { id: "eggs-cheddar-omelette", name: "3-Egg Cheddar Omelette", calories: 420, notes: "3 eggs + 30g cheddar + 10g butter", ingredients: [ { itemId: "eggs", name: "Large Free Range Eggs", quantity: 3, unit: "pcs" }, { itemId: "mature-cheddar", name: "Mature White Cheddar", quantity: 30, unit: "g" }, { itemId: "golden-cow-butter", name: "Golden Cow Salted Butter", quantity: 10, unit: "g" } ] },
    { id: "leftover-mince-breakfast", name: "Leftover Beef Mince", calories: 390, notes: "~150g cooked mince", ingredients: [ { itemId: "beef-mince", name: "Beef Mince 20% Fat", quantity: 150, unit: "g" } ] },
    { id: "cold-chicken-2", name: "Cold Chicken Thighs (2 pcs)", calories: 500, notes: "Leftover from dinner, slice cold.", ingredients: [ { itemId: "chicken-thigh", name: "Chicken Thigh (skin-on, bone-in)", quantity: 2, unit: "pcs" } ] },

    // --- Lunches ---
    { id: "chicken-salad", name: "Chicken Thigh (1pc) + Sauerkraut", calories: 280, notes: "Quick lunch. 1 cold chicken thigh + 50g kraut.", ingredients: [ { itemId: "chicken-thigh", name: "Chicken Thigh (skin-on, bone-in)", quantity: 1, unit: "pcs" }, { itemId: "sauerkraut", name: "Sauerkraut", quantity: 50, unit: "g" } ] },
    { id: "ham-brie-rolls", name: "Ham & Brie Roll-ups", calories: 225, notes: "50g ham + 30g brie. Roll and eat.", ingredients: [ { itemId: "cooked-ham", name: "Cooked Ham (no glaze)", quantity: 50, unit: "g" }, { itemId: "french-brie", name: "French Brie 60%", quantity: 30, unit: "g" } ] },
    { id: "sardines-lunch", name: "Sardines + Cheddar", calories: 350, notes: "1 can sardines + 20g cheddar. Omega-3 boost.", ingredients: [ { itemId: "sardines", name: "Sardines in Olive Oil (can)", quantity: 1, unit: "pcs" }, { itemId: "mature-cheddar", name: "Mature White Cheddar", quantity: 20, unit: "g" } ] },

    // --- Dinners ---
    { id: "chicken-dinner-3", name: "Air Fryer Chicken Thighs (3 pcs) + Sauerkraut", calories: 760, notes: "Cook 5, eat 3. Save 2 for breakfast. 50g kraut.", ingredients: [ { itemId: "chicken-thigh", name: "Chicken Thigh (skin-on, bone-in)", quantity: 3, unit: "pcs" }, { itemId: "sauerkraut", name: "Sauerkraut", quantity: 50, unit: "g" } ] },
    { id: "beef-mince-cheddar", name: "Beef Mince with Cheddar", calories: 750, notes: "250g cooked mince + 30g cheddar", ingredients: [ { itemId: "beef-mince", name: "Beef Mince 20% Fat", quantity: 250, unit: "g" }, { itemId: "mature-cheddar", name: "Mature White Cheddar", quantity: 30, unit: "g" } ] },
    { id: "ribeye-garlic-butter", name: "Ribeye Steak with Garlic Butter", calories: 800, notes: "250g raw ribeye + 20g butter. Weekend treat.", ingredients: [ { itemId: "ribeye-steak", name: "Ribeye Steak", quantity: 250, unit: "g" }, { itemId: "golden-cow-butter", name: "Golden Cow Salted Butter", quantity: 20, unit: "g" } ] },
    { id: "pork-belly-kraut", name: "Pork Belly + Sauerkraut", calories: 700, notes: "150g sliced pork belly, air fried. 50g kraut.", ingredients: [ { itemId: "pork-belly", name: "Pork Belly (sliced)", quantity: 150, unit: "g" }, { id: "sauerkraut", name: "Sauerkraut", quantity: 50, unit: "g" } ] },
    { id: "salmon-butter", name: "Salmon Fillet + Butter", calories: 550, notes: "200g salmon pan-seared with 15g butter.", ingredients: [ { itemId: "salmon-fillet", name: "Salmon Fillet (skin-on)", quantity: 200, unit: "g" }, { itemId: "golden-cow-butter", name: "Golden Cow Salted Butter", quantity: 15, unit: "g" } ] },
    { id: "sardines-dinner", name: "Sardines with Butter & Cheddar", calories: 400, notes: "1 can sardines + 15g butter + 20g cheddar. Light option.", ingredients: [ { itemId: "sardines", name: "Sardines in Olive Oil (can)", quantity: 1, unit: "pcs" }, { itemId: "golden-cow-butter", name: "Golden Cow Salted Butter", quantity: 15, unit: "g" }, { itemId: "mature-cheddar", name: "Mature White Cheddar", quantity: 20, unit: "g" } ] },
    { id: "mince-salad", name: "Beef Mince (150g) + Veggies", calories: 450, notes: "Lighter dinner. 150g mince + handful spinach/mushrooms.", ingredients: [ { itemId: "beef-mince", name: "Beef Mince 20% Fat", quantity: 150, unit: "g" } ] },

    // --- Training Day Carb Meals ---
    { id: "chicken-sweet-potato", name: "Chicken Thigh (2pc) + Sweet Potato (150g)", calories: 620, notes: "Post-training meal. Sweet potato = 30g carbs.", ingredients: [ { itemId: "chicken-thigh", name: "Chicken Thigh (skin-on, bone-in)", quantity: 2, unit: "pcs" }, { itemId: "sweet-potato", name: "Sweet Potato (cubed)", quantity: 150, unit: "g" } ] },
    { id: "beef-rice-bowl", name: "Beef Mince (200g) + Jasmine Rice (100g)", calories: 650, notes: "Post-training meal. Rice = 28g carbs.", ingredients: [ { itemId: "beef-mince", name: "Beef Mince 20% Fat", quantity: 200, unit: "g" }, { itemId: "jasmine-rice", name: "Jasmine White Rice (cooked)", quantity: 100, unit: "g" } ] },
    { id: "salmon-rice", name: "Salmon (200g) + Jasmine Rice (100g)", calories: 520, notes: "Post-training. Lean protein + carb refeed.", ingredients: [ { itemId: "salmon-fillet", name: "Salmon Fillet (skin-on)", quantity: 200, unit: "g" }, { itemId: "jasmine-rice", name: "Jasmine White Rice (cooked)", quantity: 100, unit: "g" } ] },
    { id: "banana-whey", name: "Banana + Whey Shake (post-workout)", calories: 240, notes: "1 medium banana + 1 scoop whey + water. Quick carb window.", ingredients: [ { itemId: "banana", name: "Banana (medium)", quantity: 1, unit: "pcs" }, { itemId: "whey-protein", name: "Time 4 Whey (Strawberries & Cream)", quantity: 30, unit: "g" } ] },
    { id: "pomegranate-whey", name: "Pomegranate Concentrate + Whey", calories: 150, notes: "25ml pomegranate conc. + 30g whey in water. ~15g carb.", ingredients: [ { itemId: "pomegranate-concentrate", name: "Pomegranate Juice Concentrate", quantity: 25, unit: "ml" }, { itemId: "whey-protein", name: "Time 4 Whey (Strawberries & Cream)", quantity: 30, unit: "g" } ] },

    // --- Snacks ---
    { id: "snack-brie-ham", name: "Brie & Ham Snack", calories: 175, notes: "30g brie + 2 slices ham (~50g)", ingredients: [ { itemId: "french-brie", name: "French Brie 60%", quantity: 30, unit: "g" }, { itemId: "cooked-ham", name: "Cooked Ham (no glaze)", quantity: 50, unit: "g" } ] },
    { id: "snack-pork-scratchings", name: "Pork Scratchings (20g)", calories: 110, notes: "Crunch craving killer.", ingredients: [ { itemId: "pork-scratchings", name: "Pork Scratchings", quantity: 20, unit: "g" } ] },
    { id: "snack-brie-only", name: "Brie (30g)", calories: 100, notes: "Quick fat hit.", ingredients: [ { itemId: "french-brie", name: "French Brie 60%", quantity: 30, unit: "g" } ] },
    { id: "snack-mixed-nuts", name: "Mixed Nuts (20g)", calories: 130, notes: "Handful of macadamia + almonds.", ingredients: [ { itemId: "mixed-nuts", name: "Mixed Nuts (Macadamia, Almonds)", quantity: 20, unit: "g" } ] },
    { id: "dark-chocolate-square", name: "85% Dark Chocolate (10g)", calories: 60, notes: "2 squares. End of day sanity keeper.", ingredients: [ { itemId: "dark-chocolate-85", name: "Lindt Excellence 85% Cocoa", quantity: 10, unit: "g" } ] },
    { id: "snack-sardines", name: "Sardines (1 can)", calories: 200, notes: "Omega-3 boost. Max 2x/week.", ingredients: [ { itemId: "sardines", name: "Sardines in Olive Oil (can)", quantity: 1, unit: "pcs" } ] },

    // --- Protein Bridges ---
    { id: "whey-bridge", name: "Whey Protein Shake (1 scoop)", calories: 120, notes: "Time 4 Whey – 30g scoop with water. Hit 140g protein.", ingredients: [ { itemId: "whey-protein", name: "Time 4 Whey (Strawberries & Cream)", quantity: 30, unit: "g" } ] },
    { id: "coffee-cream", name: "Coffee with Double Cream (30ml)", calories: 100, notes: "Per coffee. Have 2-3 daily. Counts as snack.", ingredients: [ { itemId: "double-cream", name: "Double Cream", quantity: 30, unit: "ml" } ] }
  ],

  plan: [
    { date: "2026-06-11", type: "rest", slots: ["eggs-cheddar-omelette", "ham-brie-rolls", "pork-belly-kraut", "whey-bridge"] },
    { date: "2026-06-12", type: "training", slots: ["cold-chicken-2", "ham-brie-rolls", "chicken-sweet-potato", "pomegranate-whey"] },
    { date: "2026-06-13", type: "rest", slots: ["greek-yogurt-200", "chicken-salad", "salmon-butter", "whey-bridge"] },
    { date: "2026-06-14", type: "rest", slots: ["eggs-scrambled-3", "sardines-lunch", "beef-mince-cheddar", "whey-bridge"] },
    { date: "2026-06-15", type: "training", slots: ["leftover-mince-breakfast", "snack-brie-ham", "beef-rice-bowl", "banana-whey"] },
    { date: "2026-06-16", type: "rest", slots: ["greek-yogurt-200", "chicken-salad", "mince-salad", "whey-bridge"] },
    { date: "2026-06-17", type: "rest", slots: ["eggs-cheddar-omelette", "ham-brie-rolls", "chicken-dinner-3", "whey-bridge"] }
  ],

  supplements: [
    { id: "liver-capsules", name: "Desiccated Beef Liver Capsules", dosage: "6 capsules daily (AM)", reason: "Vitamin A, B12, Folate, Copper. Replaces greens.", priority: "essential" },
    { id: "magnesium-glycinate", name: "Magnesium Glycinate", dosage: "400 mg at bedtime", reason: "Sleep depth, prevents cramps and constipation.", priority: "essential" },
    { id: "vitamin-d3-k2", name: "Vitamin D3 + K2 Liquid", dosage: "4000 IU D3 / 25 mcg K2 daily", reason: "Immunity, bone health, insulin sensitivity.", priority: "essential" },
    { id: "creatine", name: "Creatine Monohydrate", dosage: "5g daily (any time)", reason: "Muscle retention + power output in deficit.", priority: "essential" },
    { id: "psyllium-husk", name: "Psyllium Husk Powder", dosage: "1 heaped tsp in large glass water each AM", reason: "Fibre. Supports digestive regularity.", priority: "essential" },
    { id: "apple-cider-vinegar", name: "Apple Cider Vinegar (with Mother)", dosage: "~50ml spread over day in water", reason: "Blood glucose regulation and digestion.", priority: "optional" },
    { id: "electrolytes", name: "Electrolyte Powder (no sugar)", dosage: "1 packet in 1L water on training days", reason: "Keto + training = electrolyte dump. Prevents cramps & fatigue.", priority: "recommended" },
    { id: "sodium", name: "Pink Himalayan Salt", dosage: "¼ tsp in water AM + ½ tsp if hungry at 10:30am + liberally on food", reason: "Critical for energy, appetite suppression, avoiding keto flu.", priority: "essential" },
    { id: "potassium-citrate", name: "Potassium Citrate", dosage: "200-400 mg with dinner IF cramps occur", reason: "Only if calf cramps or heart palpitations. Otherwise skip.", priority: "optional" }
  ],

  notes: {
    nutritionalStatus: [
      "🎯 REST DAY: 1,250 kcal | 140g protein | <20g net carbs | ~85g fat.",
      "🎯 TRAINING DAY: 1,450 kcal | 140g protein | ~50g net carbs (includes 30g carb cycle) | ~70g fat.",
      "🔥 Carb cycle: 30g carbs post-workout (sweet potato, rice, banana, or pomegranate conc.).",
      "💧 Drink 2-3L water daily. Extra sodium required on keto.",
      "☕ Coffee with double cream (30ml per cup). 2-3 cups fine.",
      "🍫 10g 85% dark chocolate daily - accounted for in macros.",
      "🐟 Sardines 2x/week max.",
      "🥄 1 heaped tsp psyllium husk in water each morning.",
      "🧂 Hunger at 10:30am? Warm water + ½ tsp pink salt kills it in 10 mins.",
      "🏋️ Training days: carb source goes into post-workout window (within 2 hours).",
      "📉 Target: 64kg by Aug 10, 2026. Current: 68.45kg. Loss: ~0.56kg/week.",
      "🎯 Visceral fat (14.0) is primary target. Preserve muscle (54.1kg Excellent)."
    ]
  }
};
