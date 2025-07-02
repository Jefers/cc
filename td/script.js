// Open IndexedDB
let db;
const request = indexedDB.open('WorkoutDB', 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore('trainingDays', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('muscleGroups', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('exerciseInstances', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('supersetGroups', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('supersetLinks', { keyPath: 'id', autoIncrement: true });
};

request.onsuccess = (event) => {
    db = event.target.result;
    preloadData();
    loadWorkout();
};

request.onerror = (event) => {
    console.error('IndexedDB error:', event.target.error);
};

// Preload sample data
function preloadData() {
    const transaction = db.transaction(['trainingDays', 'muscleGroups', 'exercises', 'exerciseInstances', 'supersetGroups', 'supersetLinks'], 'readwrite');
    const exerciseInstances = transaction.objectStore('exerciseInstances');

    // Check if data is already loaded
    const countRequest = exerciseInstances.count();
    countRequest.onsuccess = () => {
        if (countRequest.result === 0) {
            const sampleData = [
                { trainingDay: 'Day 1', muscleGroup: 'Chest', exercise: 'Peck deck', order: 1, set: 1, weight: 40, reps: 8, note: '6 to 10 Reps to failure', superset: true, date: '2025-07-02' },
                { trainingDay: 'Day 1', muscleGroup: 'Chest', exercise: 'Incline press', order: 1, set: 2, weight: 45, reps: 8, note: '6 to 10 Reps to failure', superset: true, date: '2025-07-02' },
                // Add more data as needed (truncated for brevity, add from your spreadsheet)
                { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Leg extensions', order: 1, set: 17, weight: 60, reps: 8, note: '8 to 15 Reps to failure', superset: false, date: '2025-07-06' },
            ];
            sampleData.forEach(data => exerciseInstances.add(data));
        }
    };
}

// Load and display workout
function loadWorkout() {
    const selectedDay = document.getElementById('daySelect').value;
    const transaction = db.transaction(['exerciseInstances'], 'readonly');
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
                isSuperset = exercise.superset;
            }

            const group = document.createElement('div');
            group.className = `exercise-group ${isSuperset ? 'superset' : ''}`;
            group.onclick = () => editExercise(exercise);

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

// Edit exercise
function editExercise(exercise) {
    const form = document.getElementById('editForm');
    document.getElementById('editExercise').value = exercise.exercise;
    document.getElementById('editSet').value = exercise.set;
    document.getElementById('editWeight').value = exercise.weight;
    document.getElementById('editReps').value = exercise.reps;
    document.getElementById('editNote').value = exercise.note;
    document.getElementById('editSuperset').value = exercise.superset;
    form.dataset.id = exercise.id;
    form.classList.remove('hidden');
}

// Save edited exercise
function saveEdit() {
    const id = document.getElementById('editForm').dataset.id;
    const updatedData = {
        id: parseInt(id),
        trainingDay: document.getElementById('daySelect').value,
        muscleGroup: 'Chest', // Simplify for MVP, enhance with muscleGroup selection later
        exercise: document.getElementById('editExercise').value,
        order: 1, // Simplify, calculate based on existing order later
        set: parseInt(document.getElementById('editSet').value),
        weight: parseInt(document.getElementById('editWeight').value),
        reps: parseInt(document.getElementById('editReps').value),
        note: document.getElementById('editNote').value,
        superset: document.getElementById('editSuperset').value === 'true',
        date: new Date().toISOString().split('T')[0]
    };

    const transaction = db.transaction(['exerciseInstances'], 'readwrite');
    const exerciseInstances = transaction.objectStore('exerciseInstances');
    exerciseInstances.put(updatedData);

    transaction.oncomplete = () => {
        cancelEdit();
        loadWorkout();
    };
}

// Cancel edit
function cancelEdit() {
    document.getElementById('editForm').classList.add('hidden');
}

// Load default workout on page load
window.onload = () => {
    if (db) loadWorkout();
};