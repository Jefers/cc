// Predefined Exercises by Body Area
const exercisesByBodyArea = {
    "Back": [
        { name: "Pull-up", bodyArea: "Back", equipment: "Pull-up bar" },
        { name: "Lat Pulldown", bodyArea: "Back", equipment: "Cable machine" },
        { name: "Bent-over Row", bodyArea: "Back", equipment: "Barbell" }
    ],
    "Biceps": [
        { name: "Bicep Curl", bodyArea: "Biceps", equipment: "Dumbbells" },
        { name: "Hammer Curl", bodyArea: "Biceps", equipment: "Dumbbells" }
    ],
    "Cardio": [
        { name: "Treadmill", bodyArea: "Cardio", equipment: "Treadmill" },
        { name: "Stationary Bike", bodyArea: "Cardio", equipment: "Bike" }
    ],
    "Chest": [
        { name: "Bench Press", bodyArea: "Chest", equipment: "Barbell" },
        { name: "Push-up", bodyArea: "Chest", equipment: "Bodyweight" }
    ],
    "Core": [
        { name: "Plank", bodyArea: "Core", equipment: "Bodyweight" },
        { name: "Crunches", bodyArea: "Core", equipment: "Bodyweight" }
    ],
    "Legs": [
        { name: "Squat", bodyArea: "Legs", equipment: "Barbell" },
        { name: "Lunges", bodyArea: "Legs", equipment: "Dumbbells" }
    ],
    "Shoulders": [
        { name: "Shoulder Press", bodyArea: "Shoulders", equipment: "Dumbbells" },
        { name: "Lateral Raise", bodyArea: "Shoulders", equipment: "Dumbbells" }
    ],
    "Triceps": [
        { name: "Tricep Extension", bodyArea: "Triceps", equipment: "Cable machine" },
        { name: "Dips", bodyArea: "Triceps", equipment: "Dip bar" }
    ]
};

// State Management
let state = { view: "home", currentWopId: null };
let wops = loadWops();
let currentEditWop = null;
let currentEditExercise = null;
let currentWop = null;

// Data Persistence
function loadWops() {
    const wopsJson = localStorage.getItem("gymerly_wops");
    return wopsJson ? JSON.parse(wopsJson) : [];
}

function saveWops() {
    localStorage.setItem("gymerly_wops", JSON.stringify(wops));
}

// ID Generators
function getNextWopId() {
    return wops.length === 0 ? 1 : Math.max(...wops.map(wop => wop.id)) + 1;
}

function getNextExerciseId(wop) {
    return wop.exercises.length === 0 ? 1 : Math.max(...wop.exercises.map(ex => ex.id)) + 1;
}

// Rendering Functions
function render() {
    const container = document.getElementById("main-container");
    container.innerHTML = ""; // Clear container to prevent duplicates
    if (state.view === "home") {
        renderHome();
    } else if (state.view === "plan") {
        renderPlan(state.currentWopId);
    }
}

function renderHome() {
    const container = document.getElementById("main-container");

    // Import Data Button
    const importInput = document.createElement("input");
    importInput.type = "file";
    importInput.accept = ".json";
    importInput.style.margin = "5px";
    importInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    wops = JSON.parse(e.target.result);
                    saveWops();
                    render();
                } catch (error) {
                    alert("Invalid JSON file.");
                }
            };
            reader.readAsText(file);
        }
    });
    container.appendChild(importInput);

    // Export Data Button
    const exportButton = document.createElement("button");
    exportButton.textContent = "Export All Data";
    exportButton.addEventListener("click", () => {
        const dataStr = JSON.stringify(wops, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "gymerly_wops.json";
        a.click();
        URL.revokeObjectURL(url);
    });
    container.appendChild(exportButton);

    // Clear Data Button
    const clearButton = document.createElement("button");
    clearButton.textContent = "Clear All Data";
    clearButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
            wops = [];
            saveWops();
            render();
        }
    });
    container.appendChild(clearButton);

    // New Plan Button
    const newPlanButton = document.createElement("button");
    newPlanButton.textContent = "+ New Plan";
    newPlanButton.addEventListener("click", () => openWopModal());
    container.appendChild(newPlanButton);

    if (wops.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No workout plans yet. Add a new plan to get started!";
        container.appendChild(message);
        return;
    }

    wops.forEach(wop => {
        const wopCard = document.createElement("div");
        wopCard.className = "wop-card";
        wopCard.addEventListener("click", () => {
            state.view = "plan";
            state.currentWopId = wop.id;
            render();
        });

        const title = document.createElement("h2");
        title.textContent = wop.name;
        wopCard.appendChild(title);

        const desc = document.createElement("p");
        desc.textContent = wop.description.substring(0, 50) + (wop.description.length > 50 ? "..." : "");
        wopCard.appendChild(desc);

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", e => {
            e.stopPropagation();
            openWopModal(wop);
        });
        wopCard.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", e => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${wop.name}"?`)) {
                wops = wops.filter(w => w.id !== wop.id);
                saveWops();
                render();
            }
        });
        wopCard.appendChild(deleteButton);

        container.appendChild(wopCard);
    });
}

function renderPlan(wopId) {
    const wop = wops.find(w => w.id === wopId);
    if (!wop) {
        alert("Workout plan not found.");
        state.view = "home";
        render();
        return;
    }

    const container = document.getElementById("main-container");

    const headerDiv = document.createElement("div");
    headerDiv.style.display = "flex";
    headerDiv.style.justifyContent = "space-between";
    headerDiv.style.alignItems = "center";

    const backButton = document.createElement("button");
    backButton.textContent = "Back";
    backButton.addEventListener("click", () => {
        state.view = "home";
        render();
    });
    headerDiv.appendChild(backButton);

    const addExerciseButton = document.createElement("button");
    addExerciseButton.textContent = "+ Add Exercise";
    addExerciseButton.addEventListener("click", () => openExerciseSelection(wop));
    headerDiv.appendChild(addExerciseButton);

    container.appendChild(headerDiv);

    const title = document.createElement("h1");
    title.textContent = wop.name;
    container.appendChild(title);

    const desc = document.createElement("p");
    desc.textContent = wop.description;
    desc.style.color = "var(--secondary-text)";
    container.appendChild(desc);

    if (wop.exercises.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No exercises added yet.";
        container.appendChild(message);
        return;
    }

    wop.exercises.forEach(ex => {
        const exerciseCard = renderExerciseCard(ex, wop);
        container.appendChild(exerciseCard);
    });
}

function renderExerciseCard(ex, wop) {
    const card = document.createElement("div");
    card.className = "exercise-card";

    const title = document.createElement("h3");
    title.textContent = ex.name;
    card.appendChild(title);

    const deleteExerciseButton = document.createElement("button");
    deleteExerciseButton.textContent = "Delete Exercise";
    deleteExerciseButton.addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete "${ex.name}"?`)) {
            wop.exercises = wop.exercises.filter(e => e.id !== ex.id);
            saveWops();
            renderPlan(wop.id);
        }
    });
    card.appendChild(deleteExerciseButton);

    const setsCounter = document.createElement("p");
    setsCounter.className = "sets-counter";
    const completedSets = ex.sets.filter(set => set.completed).length;
    setsCounter.textContent = `${completedSets}/${ex.sets.length} Sets`;
    card.appendChild(setsCounter);

    const table = document.createElement("table");
    table.innerHTML = `
        <tr>
            <th>Set</th>
            <th>Weight (kg)</th>
            <th>Reps</th>
            <th>Set Type</th>
            <th>Completion</th>
        </tr>
    `;

    ex.sets.forEach((set, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${set.setNumber}</td>
            <td><input type="number" data-index="${index}" name="weight" value="${set.weight || ''}" min="0" step="0.5"></td>
            <td><input type="number" data-index="${index}" name="reps" value="${set.reps || ''}" min="0"></td>
            <td><input type="text" data-index="${index}" name="setType" value="${set.setType || ''}"></td>
            <td><input type="checkbox" data-index="${index}" name="completed" ${set.completed ? "checked" : ""}></td>
        `;

        tr.querySelectorAll("input").forEach(input => {
            input.addEventListener("change", () => {
                const setIndex = parseInt(input.dataset.index);
                const set = ex.sets[setIndex];
                if (input.name === "completed") {
                    set.completed = input.checked;
                } else if (input.type === "number") {
                    set[input.name] = parseFloat(input.value) || 0;
                } else {
                    set[input.name] = input.value;
                }
                saveWops();
                renderPlan(wop.id);
            });
        });

        table.appendChild(tr);
    });

    card.appendChild(table);

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "card-buttons";

    const addSetButton = document.createElement("button");
    addSetButton.textContent = "+ Add Set";
    addSetButton.addEventListener("click", () => {
        const newSetNumber = ex.sets.length + 1;
        ex.sets.push({ setNumber: newSetNumber, weight: 0, reps: 0, setType: "", completed: false });
        saveWops();
        renderPlan(wop.id);
    });
    buttonsDiv.appendChild(addSetButton);

    const notesButton = document.createElement("button");
    notesButton.textContent = ex.notes ? "📝 Notes" : "Notes";
    notesButton.addEventListener("click", () => openNotesModal(ex));
    buttonsDiv.appendChild(notesButton);

    card.appendChild(buttonsDiv);

    return card;
}

// Modal Handlers
function openWopModal(wop = null) {
    currentEditWop = wop;
    const modal = document.getElementById("wop-modal");
    const title = document.getElementById("modal-title");
    const nameInput = document.getElementById("wop-name");
    const descInput = document.getElementById("wop-desc");

    title.textContent = wop ? "Edit Plan" : "Add New Plan";
    nameInput.value = wop ? wop.name : "";
    descInput.value = wop ? wop.description : "";
    modal.classList.add("modal-active");
}

function closeWopModal() {
    document.getElementById("wop-modal").classList.remove("modal-active");
}

function openNotesModal(ex) {
    currentEditExercise = ex;
    const modal = document.getElementById("notes-modal");
    const notesText = document.getElementById("notes-text");
    notesText.value = ex.notes || "";
    modal.classList.add("modal-active");
}

function closeNotesModal() {
    document.getElementById("notes-modal").classList.remove("modal-active");
}

// Exercise Selection Handlers
function openExerciseSelection(wop) {
    currentWop = wop;
    renderBodyAreas();
    document.getElementById("body-areas-panel").classList.add("panel-active");
}

function renderBodyAreas() {
    const list = document.getElementById("body-areas-list");
    list.innerHTML = "";
    Object.keys(exercisesByBodyArea).forEach(area => {
        const li = document.createElement("li");
        li.innerHTML = `${area} <span class="indicator">></span>`;
        li.addEventListener("click", () => showExercisesForArea(area));
        list.appendChild(li);
    });
}

function showExercisesForArea(area) {
    const header = document.getElementById("exercises-header");
    header.textContent = area;
    const list = document.getElementById("exercises-list");
    list.innerHTML = "";
    exercisesByBodyArea[area].forEach(ex => {
        const li = document.createElement("li");
        li.innerHTML = `${ex.name} <small>(${ex.equipment})</small>`;
        li.addEventListener("click", () => addExerciseToWop(currentWop, area, ex));
        list.appendChild(li);
    });
    document.getElementById("body-areas-panel").classList.remove("panel-active");
    document.getElementById("exercises-panel").classList.add("panel-active");
}

function addExerciseToWop(wop, area, ex) {
    const newId = getNextExerciseId(wop);
    wop.exercises.push({
        id: newId,
        name: ex.name,
        bodyArea: area,
        equipment: ex.equipment,
        sets: [],
        notes: ""
    });
    saveWops();
    document.getElementById("exercises-panel").classList.remove("panel-active");
    document.getElementById("body-areas-panel").classList.remove("panel-active");
    render(); // Re-render the entire view
}

// Event Listeners
document.getElementById("save-wop").addEventListener("click", () => {
    const name = document.getElementById("wop-name").value.trim();
    const desc = document.getElementById("wop-desc").value.trim();
    if (!name) {
        alert("Program name is required.");
        return;
    }
    if (currentEditWop) {
        currentEditWop.name = name;
        currentEditWop.description = desc;
    } else {
        wops.push({
            id: getNextWopId(),
            name,
            description: desc,
            exercises: []
        });
    }
    saveWops();
    closeWopModal();
    render();
});

document.getElementById("cancel-wop").addEventListener("click", closeWopModal);

document.getElementById("save-notes").addEventListener("click", () => {
    if (currentEditExercise) {
        currentEditExercise.notes = document.getElementById("notes-text").value.trim();
        saveWops();
        closeNotesModal();
        renderPlan(state.currentWopId);
    }
});

document.getElementById("cancel-notes").addEventListener("click", closeNotesModal);

document.getElementById("back-to-areas").addEventListener("click", () => {
    document.getElementById("exercises-panel").classList.remove("panel-active");
    document.getElementById("body-areas-panel").classList.add("panel-active");
});

// Initialize Application
render();