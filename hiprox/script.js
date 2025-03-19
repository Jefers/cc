// Define phases based on the document
const phases = [
    {
        name: "Bulking",
        workoutDays: [
            {
                name: "Day 1: Push",
                focus: "Bench-Focused",
                exercises: [
                    { name: "Bench Press", type: "strength" },
                    { name: "Overhead Press", type: "strength" },
                    { name: "Tricep Extensions", type: "strength" } // Example accessory
                ]
            },
            {
                name: "Day 2: Pull",
                focus: "Deadlift-Focused",
                exercises: [
                    { name: "Deadlift", type: "strength" },
                    { name: "Weighted Pull-ups", type: "strength" },
                    { name: "Bent-over Rows", type: "strength" } // Example accessory
                ]
            },
            {
                name: "Day 3: Legs",
                focus: "Squat-Focused",
                exercises: [
                    { name: "Squat", type: "strength" },
                    { name: "Lunges", type: "strength" },
                    { name: "Leg Press", type: "strength" } // Example accessory
                ]
            },
            {
                name: "Day 4: Full Body Strength & Power",
                focus: "",
                exercises: [
                    { name: "Clean & Jerk", type: "strength" },
                    { name: "Snatch", type: "strength" },
                    { name: "Box Jumps", type: "conditioning" } // Example power
                ]
            },
            {
                name: "Day 5: Hyrox Conditioning + Run",
                focus: "",
                exercises: [
                    { name: "SkiErg", type: "conditioning" },
                    { name: "Row", type: "conditioning" },
                    { name: "Sled Push", type: "conditioning" },
                    { name: "Wall Balls", type: "conditioning" },
                    { name: "Run", type: "conditioning" }
                ]
            }
        ]
    },
    {
        name: "Prep",
        workoutDays: [
            {
                name: "Day 1: Strength & Power (Lower Body)",
                focus: "",
                exercises: [
                    { name: "Squat", type: "strength" },
                    { name: "Deadlift", type: "strength" },
                    { name: "Box Jumps", type: "conditioning" }
                ]
            },
            {
                name: "Day 2: Hyrox Conditioning",
                focus: "Intervals & Functional Work",
                exercises: [
                    { name: "SkiErg", type: "conditioning" },
                    { name: "Sled Push", type: "conditioning" },
                    { name: "Burpee Broad Jumps", type: "conditioning" }
                ]
            },
            {
                name: "Day 3: Strength & Power (Upper Body)",
                focus: "",
                exercises: [
                    { name: "Bench Press", type: "strength" },
                    { name: "Overhead Press", type: "strength" },
                    { name: "Weighted Pull-ups", type: "strength" }
                ]
            },
            {
                name: "Day 4: Hybrid Endurance & Hyrox Skills",
                focus: "",
                exercises: [
                    { name: "Rowing", type: "conditioning" },
                    { name: "Farmers Carry", type: "conditioning" },
                    { name: "Wall Balls", type: "conditioning" }
                ]
            },
            {
                name: "Day 5: Long Run or Hyrox Simulation",
                focus: "",
                exercises: [
                    { name: "Steady Run", type: "conditioning" },
                    { name: "Run (Simulation)", type: "conditioning" },
                    { name: "SkiErg (Simulation)", type: "conditioning" },
                    { name: "Sled Push (Simulation)", type: "conditioning" },
                    { name: "Sled Pull (Simulation)", type: "conditioning" },
                    { name: "Burpee Broad Jumps (Simulation)", type: "conditioning" },
                    { name: "Rowing (Simulation)", type: "conditioning" },
                    { name: "Farmers Carry (Simulation)", type: "conditioning" },
                    { name: "Wall Balls (Simulation)", type: "conditioning" }
                ]
            }
        ]
    }
];

// State management
let state = {
    view: "home",
    selectedPhase: null,
    selectedWorkoutDay: null,
    currentLoggedWorkout: null
};

// Load logged workouts from local storage
let loggedWorkouts = JSON.parse(localStorage.getItem("loggedWorkouts")) || [];

// Save to local storage
function saveLoggedWorkouts() {
    localStorage.setItem("loggedWorkouts", JSON.stringify(loggedWorkouts));
}

// Main render function
function render() {
    const app = document.getElementById("app");
    app.innerHTML = "";
    if (state.view === "home") {
        renderHome();
    } else if (state.view === "workoutDays") {
        renderWorkoutDays();
    } else if (state.view === "logWorkout") {
        renderLogWorkout();
    }
}

// Render home screen
function renderHome() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <h1><span class="hip">HiP</span>rox</h1>
        <div class="actions">
            <button id="import-btn">Import Data</button>
            <button id="export-btn">Export Data</button>
            <button id="clear-btn">Clear Data</button>
        </div>
        <div class="panel">
            <h2>Phases</h2>
            <ul>
                ${phases.map(phase => `<li onclick="selectPhase('${phase.name}')">${phase.name}</li>`).join('')}
            </ul>
        </div>
        <svg id="square1" class="square" viewBox="0 0 50 50"><rect width="50" height="50"/></svg>
        <svg id="square2" class="square" viewBox="0 0 50 50"><rect width="50" height="50"/></svg>
    `;
    document.getElementById("import-btn").addEventListener("click", () => document.getElementById("import-input").click());
    document.getElementById("export-btn").addEventListener("click", exportData);
    document.getElementById("clear-btn").addEventListener("click", clearData);
}

// Select phase
function selectPhase(phaseName) {
    state.selectedPhase = phases.find(p => p.name === phaseName);
    state.view = "workoutDays";
    render();
}

// Render workout days
function renderWorkoutDays() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <h2>${state.selectedPhase.name} - Workout Days</h2>
        <button onclick="backToHome()">Back</button>
        <div class="panel">
            <ul>
                ${state.selectedPhase.workoutDays.map(day => `<li onclick="selectWorkoutDay('${day.name}')">${day.name}</li>`).join('')}
            </ul>
        </div>
    `;
}

// Select workout day
function selectWorkoutDay(dayName) {
    state.selectedWorkoutDay = state.selectedPhase.workoutDays.find(d => d.name === dayName);
    state.currentLoggedWorkout = {
        date: new Date().toISOString().split('T')[0],
        phaseName: state.selectedPhase.name,
        workoutDayName: state.selectedWorkoutDay.name,
        exercises: state.selectedWorkoutDay.exercises.map(ex => ({ name: ex.name, sets: [] }))
    };
    state.view = "logWorkout";
    render();
}

// Render log workout screen
function renderLogWorkout() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <h2>Log Workout: ${state.selectedWorkoutDay.name}</h2>
        <button onclick="backToWorkoutDays()">Back</button>
        <button onclick="saveLoggedWorkout()">Save</button>
        <div id="exercises-container"></div>
    `;
    const container = document.getElementById("exercises-container");
    state.currentLoggedWorkout.exercises.forEach((exercise, exIndex) => {
        const exDiv = document.createElement("div");
        exDiv.className = "panel";
        exDiv.innerHTML = `
            <h3>${exercise.name}</h3>
            <div id="sets-${exIndex}"></div>
            <button onclick="addSet(${exIndex})">Add Set</button>
        `;
        container.appendChild(exDiv);
        const setsDiv = document.getElementById(`sets-${exIndex}`);
        exercise.sets.forEach((set, setIndex) => {
            const setDiv = document.createElement("div");
            setDiv.className = "set";
            setDiv.innerHTML = `
                <input type="number" placeholder="Weight (kg)" value="${set.weight || ''}" data-ex="${exIndex}" data-set="${setIndex}" class="weight-input">
                <input type="number" placeholder="Reps" value="${set.reps || ''}" data-ex="${exIndex}" data-set="${setIndex}" class="reps-input">
                <input type="number" placeholder="Distance (m)" value="${set.distance || ''}" data-ex="${exIndex}" data-set="${setIndex}" class="distance-input">
                <input type="number" placeholder="Time (s)" value="${set.time || ''}" data-ex="${exIndex}" data-set="${setIndex}" class="time-input">
                <input type="checkbox" ${set.completed ? 'checked' : ''} data-ex="${exIndex}" data-set="${setIndex}" class="completed-input">
            `;
            setsDiv.appendChild(setDiv);
        });
    });

    // Event listeners for inputs
    document.querySelectorAll(".weight-input, .reps-input, .distance-input, .time-input, .completed-input").forEach(input => {
        input.addEventListener("change", (e) => {
            const exIndex = e.target.dataset.ex;
            const setIndex = e.target.dataset.set;
            const set = state.currentLoggedWorkout.exercises[exIndex].sets[setIndex];
            if (e.target.classList.contains("weight-input")) set.weight = parseFloat(e.target.value) || 0;
            else if (e.target.classList.contains("reps-input")) set.reps = parseInt(e.target.value) || 0;
            else if (e.target.classList.contains("distance-input")) set.distance = parseFloat(e.target.value) || 0;
            else if (e.target.classList.contains("time-input")) set.time = parseFloat(e.target.value) || 0;
            else if (e.target.classList.contains("completed-input")) set.completed = e.target.checked;
        });
    });
}

// Add a new set
function addSet(exIndex) {
    state.currentLoggedWorkout.exercises[exIndex].sets.push({ weight: 0, reps: 0, distance: 0, time: 0, completed: false });
    render();
}

// Save logged workout
function saveLoggedWorkout() {
    loggedWorkouts.push(state.currentLoggedWorkout);
    saveLoggedWorkouts();
    state.view = "workoutDays";
    render();
}

// Navigation functions
function backToHome() {
    state.view = "home";
    render();
}

function backToWorkoutDays() {
    state.view = "workoutDays";
    render();
}

// Import data
document.getElementById("import-input").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                loggedWorkouts = JSON.parse(e.target.result);
                saveLoggedWorkouts();
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
    const dataStr = JSON.stringify(loggedWorkouts, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hiprox-data.json";
    a.click();
    URL.revokeObjectURL(url);
}

// Clear data
function clearData() {
    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modal-body");
    modalBody.innerHTML = `
        <p>Are you sure you want to clear all data?</p>
        <button onclick="confirmClear()">Yes</button>
        <button onclick="closeModal()">No</button>
    `;
    modal.classList.add("active");
    document.getElementById("modal-close").addEventListener("click", closeModal);
}

function confirmClear() {
    loggedWorkouts = [];
    saveLoggedWorkouts();
    closeModal();
    render();
}

function closeModal() {
    document.getElementById("modal").classList.remove("active");
}

// Initialize
render();