// Predefined exercises by body area
const exercisesByBodyArea = {
    "Back": ["Pull-up", "Deadlift", "Bent-over Row"],
    "Chest": ["Bench Press", "Push-up", "Chest Fly"],
    "Legs": ["Squat", "Lunge", "Leg Press"],
    "Arms": ["Bicep Curl", "Tricep Dip", "Hammer Curl"],
    "Core": ["Plank", "Russian Twist", "Leg Raise"]
  };
  
  // State object
  let state = {
    view: "home",       // Current view: "home" or "plan"
    currentWopId: null, // ID of the currently viewed workout plan
    wops: []            // Array of workout plans
  };
  
  // Load data from localStorage
  function loadFromLocalStorage() {
    const wops = JSON.parse(localStorage.getItem("wops")) || [];
    state.wops = wops;
  }
  
  // Save data to localStorage
  function saveToLocalStorage() {
    localStorage.setItem("wops", JSON.stringify(state.wops));
  }
  
  // Generate unique IDs
  function getNextWopId() {
    return state.wops.length > 0 ? Math.max(...state.wops.map(w => w.id)) + 1 : 1;
  }
  
  function getNextExerciseId() {
    const allExerciseIds = state.wops.flatMap(w => w.exercises.map(e => e.id));
    return allExerciseIds.length > 0 ? Math.max(...allExerciseIds) + 1 : 1;
  }
  
  // Main render function
  function render() {
    const app = document.getElementById("app");
    app.innerHTML = "";
    if (state.view === "home") {
      renderHomeView();
    } else if (state.view === "plan") {
      renderPlanView();
    }
  }
  
  // Render home view (list of workout plans)
  function renderHomeView() {
    const app = document.getElementById("app");
  
    // Action buttons
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "actions";
    const newPlanBtn = document.createElement("button");
    newPlanBtn.textContent = "+ New Plan";
    newPlanBtn.addEventListener("click", () => openWopModal());
    actionsDiv.appendChild(newPlanBtn);
    const importBtn = document.createElement("button");
    importBtn.textContent = "Import Data";
    importBtn.addEventListener("click", () => document.getElementById("import-input").click());
    actionsDiv.appendChild(importBtn);
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Export All Data";
    exportBtn.addEventListener("click", exportData);
    actionsDiv.appendChild(exportBtn);
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear All Data";
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all data?")) {
        state.wops = [];
        saveToLocalStorage();
        render();
      }
    });
    actionsDiv.appendChild(clearBtn);
    app.appendChild(actionsDiv);
  
    // Display message if no plans exist
    if (state.wops.length === 0) {
      const message = document.createElement("p");
      message.textContent = "No workout plans yet. Click + New Plan to start.";
      app.appendChild(message);
    } else {
      // Render workout plan cards
      state.wops.forEach(wop => {
        const card = document.createElement("div");
        card.className = "wop-card";
        card.innerHTML = `<h3>${wop.name}</h3><p>${wop.description.slice(0, 20)}...</p>`;
        card.addEventListener("click", () => {
          state.view = "plan";
          state.currentWopId = wop.id;
          render();
        });
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openWopModal(wop);
        });
        card.appendChild(editBtn);
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm(`Delete "${wop.name}"?`)) {
            state.wops = state.wops.filter(w => w.id !== wop.id);
            saveToLocalStorage();
            render();
          }
        });
        card.appendChild(deleteBtn);
        app.appendChild(card);
      });
    }
  }
  
  // Render plan detail view
  function renderPlanView() {
    const app = document.getElementById("app");
    const wop = state.wops.find(w => w.id === state.currentWopId);
    if (!wop) {
      state.view = "home";
      render();
      return;
    }
  
    // Header with plan details and navigation
    const header = document.createElement("div");
    header.innerHTML = `<h2>${wop.name}</h2><p>${wop.description}</p>`;
    const backBtn = document.createElement("button");
    backBtn.textContent = "Back";
    backBtn.addEventListener("click", () => {
      state.view = "home";
      render();
    });
    header.appendChild(backBtn);
    const addExerciseBtn = document.createElement("button");
    addExerciseBtn.textContent = "+ Add Exercise";
    addExerciseBtn.addEventListener("click", openBodyAreasPanel);
    header.appendChild(addExerciseBtn);
    app.appendChild(header);
  
    // Render exercises
    wop.exercises.forEach(exercise => {
      const exerciseCard = document.createElement("div");
      exerciseCard.className = "exercise-card";
      exerciseCard.innerHTML = `<h3>${exercise.name}</h3>`;
      const deleteExerciseBtn = document.createElement("button");
      deleteExerciseBtn.textContent = "Delete";
      deleteExerciseBtn.addEventListener("click", () => {
        if (confirm(`Delete "${exercise.name}"?`)) {
          wop.exercises = wop.exercises.filter(e => e.id !== exercise.id);
          saveToLocalStorage();
          render();
        }
      });
      exerciseCard.appendChild(deleteExerciseBtn);
  
      // Sets table
      const table = document.createElement("table");
      table.innerHTML = `
        <tr>
          <th>Set</th>
          <th>Weight (kg)</th>
          <th>Reps</th>
          <th>Type</th>
          <th>Completed</th>
        </tr>
      `;
      exercise.sets.forEach((set, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${set.number}</td>
          <td><input type="number" value="${set.weight}" data-exercise-id="${exercise.id}" data-set-index="${index}" class="set-weight" min="0"></td>
          <td><input type="number" value="${set.reps}" data-exercise-id="${exercise.id}" data-set-index="${index}" class="set-reps" min="0"></td>
          <td><select data-exercise-id="${exercise.id}" data-set-index="${index}" class="set-type">
            <option value="Warm-up" ${set.type === "Warm-up" ? "selected" : ""}>Warm-up</option>
            <option value="Working" ${set.type === "Working" ? "selected" : ""}>Working</option>
            <option value="Drop" ${set.type === "Drop" ? "selected" : ""}>Drop</option>
          </select></td>
          <td><input type="checkbox" ${set.completed ? "checked" : ""} data-exercise-id="${exercise.id}" data-set-index="${index}" class="set-completed"></td>
        `;
        table.appendChild(row);
      });
      exerciseCard.appendChild(table);
  
      // Add set and notes buttons
      const addSetBtn = document.createElement("button");
      addSetBtn.textContent = "+ Add Set";
      addSetBtn.addEventListener("click", () => {
        const newSet = { number: exercise.sets.length + 1, weight: 0, reps: 0, type: "Working", completed: false };
        exercise.sets.push(newSet);
        saveToLocalStorage();
        render();
      });
      exerciseCard.appendChild(addSetBtn);
      const notesBtn = document.createElement("button");
      notesBtn.textContent = "Notes";
      notesBtn.addEventListener("click", () => openNotesModal(exercise));
      exerciseCard.appendChild(notesBtn);
      app.appendChild(exerciseCard);
    });
  
    // Event listeners for sets inputs
    document.querySelectorAll('.set-weight, .set-reps, .set-type, .set-completed').forEach(input => {
      input.addEventListener('change', (e) => {
        const exerciseId = parseInt(e.target.dataset.exerciseId);
        const setIndex = parseInt(e.target.dataset.setIndex);
        const wop = state.wops.find(w => w.id === state.currentWopId);
        const exercise = wop.exercises.find(e => e.id === exerciseId);
        const set = exercise.sets[setIndex];
        if (e.target.classList.contains('set-weight')) {
          set.weight = parseFloat(e.target.value) || 0;
        } else if (e.target.classList.contains('set-reps')) {
          set.reps = parseInt(e.target.value) || 0;
        } else if (e.target.classList.contains('set-type')) {
          set.type = e.target.value;
        } else if (e.target.classList.contains('set-completed')) {
          set.completed = e.target.checked;
        }
        saveToLocalStorage();
      });
    });
  }
  
  // Open WOP modal for adding/editing
  function openWopModal(wop = null) {
    const modal = document.getElementById("wop-modal");
    const nameInput = document.getElementById("wop-name");
    const descInput = document.getElementById("wop-description");
    if (wop) {
      nameInput.value = wop.name;
      descInput.value = wop.description;
    } else {
      nameInput.value = "";
      descInput.value = "";
    }
    modal.classList.add("active");
    document.getElementById("save-wop").onclick = () => {
      const name = nameInput.value.trim();
      if (!name) {
        alert("Program Name is required");
        return;
      }
      if (wop) {
        wop.name = name;
        wop.description = descInput.value.trim();
      } else {
        const newWop = {
          id: getNextWopId(),
          name,
          description: descInput.value.trim(),
          exercises: []
        };
        state.wops.push(newWop);
      }
      saveToLocalStorage();
      modal.classList.remove("active");
      render();
    };
    document.getElementById("cancel-wop").onclick = () => modal.classList.remove("active");
  }
  
  // Open notes modal
  function openNotesModal(exercise) {
    const modal = document.getElementById("notes-modal");
    const notesInput = document.getElementById("exercise-notes");
    notesInput.value = exercise.notes || "";
    modal.classList.add("active");
    document.getElementById("save-notes").onclick = () => {
      exercise.notes = notesInput.value.trim();
      saveToLocalStorage();
      modal.classList.remove("active");
      render();
    };
    document.getElementById("cancel-notes").onclick = () => modal.classList.remove("active");
  }
  
  // Open body areas panel
  function openBodyAreasPanel() {
    const panel = document.getElementById("body-areas-panel");
    const list = document.getElementById("body-areas-list");
    list.innerHTML = "";
    Object.keys(exercisesByBodyArea).forEach(area => {
      const li = document.createElement("li");
      li.textContent = area;
      li.addEventListener("click", () => openExercisesPanel(area));
      list.appendChild(li);
    });
    panel.classList.add("active");
  }
  
  // Open exercises panel
  function openExercisesPanel(area) {
    const panel = document.getElementById("exercises-panel");
    const list = document.getElementById("exercises-list");
    list.innerHTML = "";
    exercisesByBodyArea[area].forEach(exerciseName => {
      const li = document.createElement("li");
      li.textContent = exerciseName;
      li.addEventListener("click", () => {
        const wop = state.wops.find(w => w.id === state.currentWopId);
        const newExercise = {
          id: getNextExerciseId(),
          name: exerciseName,
          sets: [],
          notes: ""
        };
        wop.exercises.push(newExercise);
        saveToLocalStorage();
        document.getElementById("body-areas-panel").classList.remove("active");
        panel.classList.remove("active");
        render();
      });
      list.appendChild(li);
    });
    panel.classList.add("active");
  }
  
  // Import data
  document.getElementById("import-input").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          state.wops = data;
          saveToLocalStorage();
          render();
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  });
  
  // Export data
  function exportData() {
    const dataStr = JSON.stringify(state.wops, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wops.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  
  // Initialize the app
  loadFromLocalStorage();
  render();