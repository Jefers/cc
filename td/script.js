// Preload sample data into localStorage (simulating database)
if (!localStorage.getItem('workoutData')) {
    const workoutData = [
        // Day 1 - Chest
        { trainingDay: 'Day 1', muscleGroup: 'Chest', exercise: 'Peck deck', order: 1, set: 1, weight: 40, reps: 8, note: '6 to 10 Reps to failure', superset: true, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Chest', exercise: 'Incline press', order: 1, set: 2, weight: 45, reps: 8, note: '6 to 10 Reps to failure', superset: true, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Chest', exercise: 'Peck deck', order: 2, set: 3, weight: 45, reps: 8, note: '6 to 10 Reps to failure', superset: true, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Chest', exercise: 'Incline press', order: 2, set: 4, weight: 45, reps: 7, note: '6 to 10 Reps to failure', superset: true, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Chest', exercise: 'Incline press', order: 3, set: 5, weight: 50, reps: 3, note: '1 to 3 Reps to failure', superset: false, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Chest', exercise: 'Incline press', order: 4, set: 6, weight: 50, reps: 3, note: '1 to 3 Reps to failure', superset: false, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Chest', exercise: 'Incline press', order: 5, set: 7, weight: 50, reps: 3, note: '1 to 3 Reps to failure', superset: false, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Chest', exercise: 'Incline press', order: 6, set: 8, weight: 55, reps: 2, note: '1 to 3 Reps to failure', superset: false, date: '2025-07-02' },
        // Day 1 - Back
        { trainingDay: 'Day 1', muscleGroup: 'Back', exercise: 'Pull downs', order: 7, set: 9, weight: 70, reps: 10, note: 'Close grip palms up', superset: true, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Back', exercise: 'Pull downs', order: 8, set: 10, weight: 70, reps: 10, note: 'Close grip palms up', superset: true, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Back', exercise: 'Pull downs', order: 9, set: 11, weight: 70, reps: 10, note: 'Close grip palms up', superset: true, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Back', exercise: 'Pull downs', order: 10, set: 12, weight: 75, reps: 9, note: 'Close grip palms up', superset: true, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Back', exercise: 'Deadlifts', order: 11, set: 13, weight: 110, reps: 8, note: '6 to 10 Reps to failure', superset: false, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Back', exercise: 'Deadlifts', order: 12, set: 14, weight: 110, reps: 8, note: '6 to 10 Reps to failure', superset: false, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Back', exercise: 'Deadlifts', order: 13, set: 15, weight: 110, reps: 8, note: '6 to 10 Reps to failure', superset: false, date: '2025-07-02' },
        { trainingDay: 'Day 1', muscleGroup: 'Back', exercise: 'Deadlifts', order: 14, set: 16, weight: 115, reps: 7, note: '6 to 10 Reps to failure', superset: false, date: '2025-07-02' },
        // Day 2 - Legs
        { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Leg extensions', order: 1, set: 17, weight: 60, reps: 8, note: '8 to 15 Reps to failure', superset: false, date: '2025-07-06' },
        { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Leg extensions', order: 2, set: 18, weight: 60, reps: 8, note: '8 to 15 Reps to failure', superset: false, date: '2025-07-06' },
        { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Leg extensions', order: 3, set: 19, weight: 60, reps: 8, note: '8 to 15 Reps to failure', superset: false, date: '2025-07-06' },
        { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Leg extensions', order: 4, set: 20, weight: 60, reps: 8, note: '8 to 15 Reps to failure', superset: false, date: '2025-07-06' },
        { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Leg press', order: 5, set: 21, weight: 135, reps: 7, note: '8 to 15 Reps to failure', superset: false, date: '2025-07-06' },
        { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Leg press', order: 6, set: 22, weight: 135, reps: 7, note: '8 to 15 Reps to failure', superset: false, date: '2025-07-06' },
        { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Leg press', order: 7, set: 23, weight: 135, reps: 7, note: '8 to 15 Reps to failure', superset: false, date: '2025-07-06' },
        { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Leg press', order: 8, set: 24, weight: 135, reps: 7, note: '8 to 15 Reps to failure', superset: false, date: '2025-07-06' },
        { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Standing calf raises', order: 9, set: 25, weight: 80, reps: 15, note: '12 to 20 Reps to failure', superset: false, date: '2025-07-06' },
        { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Standing calf raises', order: 10, set: 26, weight: 80, reps: 15, note: '12 to 20 Reps to failure', superset: false, date: '2025-07-06' },
        { trainingDay: 'Day 2', muscleGroup: 'Legs', exercise: 'Standing calf raises', order: 11, set: 26, weight: 80, reps: 12, note: '12 to 20 Reps to failure', superset: false, date: '2025-07-06' },
    ];
    localStorage.setItem('workoutData', JSON.stringify(workoutData));
}

function loadWorkout() {
    const selectedDay = document.getElementById('daySelect').value;
    const data = JSON.parse(localStorage.getItem('workoutData'));
    const exercises = data.filter(item => item.trainingDay === selectedDay);

    // Sort by exercise_order
    exercises.sort((a, b) => a.order - b.order);

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
}

// Load default workout on page load
window.onload = loadWorkout;