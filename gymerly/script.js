// Load workout history from localStorage
let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];

// Function to find the last workout data for a specific exercise
function findLastWorkoutForExercise(exerciseName) {
    const sortedHistory = workoutHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    for (const workout of sortedHistory) {
        const exerciseData = workout.exercises.find(ex => ex.name === exerciseName);
        if (exerciseData) {
            return exerciseData;
        }
    }
    return null;
}

// Pre-fill weights based on progressive overload logic when page loads
document.addEventListener('DOMContentLoaded', () => {
    const exercises = document.querySelectorAll('.exercise');
    exercises.forEach(exercise => {
        const exerciseName = exercise.dataset.name;
        const lastWorkout = findLastWorkoutForExercise(exerciseName);
        const weightInputs = exercise.querySelectorAll('.weight');
        if (lastWorkout && lastWorkout.sets.length > 0) {
            const lastWeight = lastWorkout.sets[0].weight;
            const firstSetReps = lastWorkout.sets[0].reps;
            const suggestedWeight = (firstSetReps >= 12) ? lastWeight + 2.5 : lastWeight;
            weightInputs.forEach(input => input.value = suggestedWeight);
        }
    });
});

// Timer functionality
const restTime = 300; // Default 5 minutes in seconds
let timerInterval;

function startTimer() {
    let timeLeft = restTime;
    const timeElement = document.getElementById('time');
    clearInterval(timerInterval); // Clear any existing timer
    timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeElement.textContent = '00:00';
            alert('Rest time is over!');
        }
    }, 1000);
}

// Add event listeners to rest timer buttons
document.querySelectorAll('.start-rest').forEach(button => {
    button.addEventListener('click', startTimer);
});

// Save workout to localStorage
document.getElementById('save-workout').addEventListener('click', () => {
    const workout = {
        date: new Date().toISOString(),
        plan: document.title, // Use page title as plan name
        exercises: []
    };

    document.querySelectorAll('.exercise').forEach(exercise => {
        const exerciseName = exercise.dataset.name;
        const sets = [];
        exercise.querySelectorAll('.set').forEach(set => {
            const weight = parseFloat(set.querySelector('.weight').value);
            const reps = parseInt(set.querySelector('.reps').value);
            if (!isNaN(weight) && !isNaN(reps) && reps >= 0) {
                sets.push({ weight, reps });
            }
        });
        if (sets.length > 0) {
            workout.exercises.push({ name: exerciseName, sets });
        }
    });

    if (workout.exercises.length > 0) {
        workoutHistory.push(workout);
        localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
        alert('Workout saved successfully!');
    } else {
        alert('Please enter valid workout data to save.');
    }
});