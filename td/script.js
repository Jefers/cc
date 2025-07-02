let db;
const request = indexedDB.open('WorkoutDB', 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    const trainingDays = db.createObjectStore('trainingDays', { keyPath: 'id', autoIncrement: true });
    const muscleGroups = db.createObjectStore('muscleGroups', { keyPath: 'id', autoIncrement: true });
    const exercises = db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
    const exerciseInstances = db.createObjectStore('exerciseInstances', { keyPath: 'id', autoIncrement: true });
    const supersetGroups = db.createObjectStore('supersetGroups', { keyPath: 'id', autoIncrement: true });
    const supersetLinks = db.createObjectStore('supersetLinks', { keyPath: 'id', autoIncrement: true });

    // Create indexes
    exerciseInstances.createIndex('trainingDay', 'trainingDay', { unique: false });
    exerciseInstances.createIndex('muscleGroup', 'muscleGroup', { unique: false });
    exerciseInstances.createIndex('exercise', 'exercise', { unique: false });
    exerciseInstances.createIndex('order', 'order', { unique: false });
};

request.onsuccess = (event) => {
    db = event.target.result;
    populateDropdowns();
    loadWorkout();
};

request.onerror = (event) => {
    console.error('IndexedDB error:', event.target.error);
};

// Populate dropdowns
function populateDropdowns() {
    const tx = db.transaction(['trainingDays', 'muscleGroups', 'exercises'], 'readonly');
    const [trainingDaysStore, muscleGroupsStore, exercisesStore] = [
        tx.objectStore('trainingDays'),
        tx.objectStore('muscleGroups'),
        tx.objectStore('exercises')
    ];

    trainingDaysStore.getAll().onsuccess = (e) => {
        const days = e.target.result;
        const daySelect = document.getElementById('daySelect');
        const addTrainingDay = document.getElementById('addTrainingDay');
        daySelect.innerHTML = '<option value="">Select Day</option>';
        addTrainingDay.innerHTML = '';
        days.forEach(day => {
            daySelect.add(new Option(day.name, day.name));
            addTrainingDay.add(new Option(day.name, day.name));
        });
    };

    muscleGroupsStore.getAll().onsuccess = (e) => {
        const groups = e.target.result;
        const addMuscleGroup = document.getElementById('addMuscleGroup');
        addMuscleGroup.innerHTML = '';
        groups.forEach(group => addMuscleGroup.add(new Option(group.name, group.name)));
    };

    exercisesStore.getAll().onsuccess = (e) => {
        const exercises = e.target.result;
        const addExercise = document.getElementById('addExercise');
        addExercise.innerHTML = '';
        exercises.forEach(ex => addExercise.add(new Option(ex.name, ex.name)));
    };
}

// Load and display workout
function loadWorkout() {
    const selectedDay = document.getElementById('daySelect').value;
    if (!selectedDay) return;
    const transaction = db.transaction(['exerciseInstances', 'supersetGroups', 'supersetLinks'], 'readonly');
    const exerciseInstances = transaction.objectStore('exerciseInstances');
    const request = exerciseInstances.index('trainingDay').getAll(selectedDay);

    request.onsuccess = () => {
        const exercises = request.result.sort((a, b) => a.order - b.order);
        const workoutDisplay = document.getElementById('workoutDisplay');
        workoutDisplay.innerHTML = '';

        let currentOrder = -1;
        let isSuperset = false;

        exercises.forEach((exercise, index) => {
            if (exercise.order !== currentOrder) {
                if (index > 0) workoutDisplay.appendChild(document.createElement('br'));
                currentOrder = exercise.order;
                isSuperset = exercise.superset; // Simplified for MVP, enhance with supersetLinks later
            }

            const group = document.createElement('div');
            group.className = `exercise-group ${isSuperset ? 'superset' : ''}`;

            const exerciseDiv = document.createElement('div');
            exerciseDiv.className = 'exercise';
            exerciseDiv.innerHTML = `
                <span>${exercise.exercise}</span>
                <span>Set ${exercise.set}</span>
                <span>${exercise.weight} lbs</span>
                <span>${exercise.reps} reps</span>
                <span>${exercise.note}</span>
                <span>${exercise.muscleGroup}</span>
            `;
            group.appendChild(exerciseDiv);
            workoutDisplay.appendChild(group);
        });
    };
}

// Show add form
function showAddForm() {
    document.getElementById('addForm').classList.remove('hidden');
}

// Save new workout
function saveWorkout() {
    const data = {
        trainingDay: document.getElementById('addTrainingDay').value,
        muscleGroup: document.getElementById('addMuscleGroup').value,
        exercise: document.getElementById('addExercise').value,
        order: parseInt(document.getElementById('addOrder').value),
        set: parseInt(document.getElementById('addSet').value),
        weight: parseInt(document.getElementById('addWeight').value),
        reps: parseInt(document.getElementById('addReps').value),
        note: document.getElementById('addNote').value,
        superset: document.getElementById('addSuperset').value === 'true',
        date: new Date().toISOString().split('T')[0]
    };

    // Add to respective stores (simplified for MVP)
    const tx = db.transaction(['trainingDays', 'muscleGroups', 'exercises', 'exerciseInstances'], 'readwrite');
    const [trainingDays, muscleGroups, exercises, exerciseInstances] = [
        tx.objectStore('trainingDays'),
        tx.objectStore('muscleGroups'),
        tx.objectStore('exercises'),
        tx.objectStore('exerciseInstances')
    ];

    // Ensure related data exists
    trainingDays.get(data.trainingDay).onsuccess = (e) => {
        if (!e.target.result) trainingDays.add({ name: data.trainingDay, date: data.date });
    };
    muscleGroups.get(data.muscleGroup).onsuccess = (e) => {
        if (!e.target.result) muscleGroups.add({ name: data.muscleGroup });
    };
    exercises.get(data.exercise).onsuccess = (e) => {
        if (!e.target.result) exercises.add({ name: data.exercise });
    };

    exerciseInstances.add(data).onsuccess = () => {
        cancelAdd();
        populateDropdowns();
        loadWorkout();
    };
}

// Cancel add
function cancelAdd() {
    document.getElementById('addForm').classList.add('hidden');
    document.getElementById('addOrder').value = '';
    document.getElementById('addSet').value = '';
    document.getElementById('addWeight').value = '';
    document.getElementById('addReps').value = '';
    document.getElementById('addNote').value = '';
}

// Initial setup
window.onload = () => {
    if (db) {
        // Preload initial data if empty (optional, remove for pure user input)
        const tx = db.transaction(['trainingDays', 'muscleGroups', 'exercises'], 'readwrite');
        const [trainingDays, muscleGroups, exercises] = [
            tx.objectStore('trainingDays'),
            tx.objectStore('muscleGroups'),
            tx.objectStore('exercises')
        ];
        ['Day 1', 'Day 2'].forEach(day => trainingDays.add({ name: day, date: '2025-07-02' }));
        ['Chest', 'Back', 'Legs'].forEach(group => muscleGroups.add({ name: group }));
        ['Peck deck', 'Incline press', 'Pull downs', 'Deadlifts', 'Leg extensions', 'Leg press', 'Standing calf raises'].forEach(ex => exercises.add({ name: ex }));
        populateDropdowns();
    }
};