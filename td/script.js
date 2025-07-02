let db;
const request = indexedDB.open('WorkoutDB', 8); // Increment version to 8

request.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStores = ['trainingDays', 'muscleGroups', 'exercises', 'exerciseInstances', 'supersetGroups', 'supersetLinks'];

    objectStores.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            // Create indexes only if the store is newly created
            switch (storeName) {
                case 'trainingDays':
                    store.createIndex('name', 'name', { unique: true });
                    break;
                case 'muscleGroups':
                    store.createIndex('name', 'name', { unique: true });
                    break;
                case 'exercises':
                    store.createIndex('name', 'name', { unique: true });
                    break;
                case 'exerciseInstances':
                    store.createIndex('trainingDay', 'trainingDay', { unique: false });
                    store.createIndex('muscleGroup', 'muscleGroup', { unique: false });
                    store.createIndex('exercise', 'exercise', { unique: false });
                    store.createIndex('order', 'order', { unique: false });
                    break;
                case 'supersetLinks':
                    store.createIndex('supersetId', 'supersetId', { unique: false });
                    store.createIndex('exerciseInstanceId', 'exerciseInstanceId', { unique: false });
                    break;
            }
        }
    });
};

request.onsuccess = (event) => {
    db = event.target.result;
    populateDropdowns();
    loadPageContent();
};

request.onerror = (event) => {
    console.error('IndexedDB error:', event.target.error);
};

// Determine and load the appropriate page content
function loadPageContent() {
    const path = window.location.pathname.split('/').pop();
    switch (path) {
        case 'index.html':
            loadWorkout();
            break;
        case 'trainingdays.html':
            loadTrainingDays();
            break;
        case 'musclegroups.html':
            loadMuscleGroups();
            break;
        case 'exercises.html':
            loadExercises();
            break;
        case 'debug.html':
            loadDebugData();
            break;
    }
}

// Populate dropdowns for all pages
function populateDropdowns() {
    const tx = db.transaction(['trainingDays', 'muscleGroups', 'exercises', 'supersetGroups'], 'readonly');
    const [trainingDaysStore, muscleGroupsStore, exercisesStore, supersetGroupsStore] = [
        tx.objectStore('trainingDays'),
        tx.objectStore('muscleGroups'),
        tx.objectStore('exercises'),
        tx.objectStore('supersetGroups')
    ];

    trainingDaysStore.getAll().onsuccess = (e) => {
        const days = e.target.result;
        const daySelect = document.getElementById('daySelect');
        const crudTrainingDay = document.getElementById('crudTrainingDay');
        if (daySelect) daySelect.innerHTML = '<option value="">Select Day</option>';
        if (crudTrainingDay) crudTrainingDay.innerHTML = '';
        days.forEach(day => {
            if (daySelect) daySelect.add(new Option(day.name, day.name));
            if (crudTrainingDay) crudTrainingDay.add(new Option(day.name, day.name));
        });
    };

    muscleGroupsStore.getAll().onsuccess = (e) => {
        const groups = e.target.result;
        const crudMuscleGroup = document.getElementById('crudMuscleGroup');
        if (crudMuscleGroup) {
            crudMuscleGroup.innerHTML = '';
            groups.forEach(group => crudMuscleGroup.add(new Option(group.name, group.name)));
        }
    };

    exercisesStore.getAll().onsuccess = (e) => {
        const exercises = e.target.result;
        const crudExercise = document.getElementById('crudExercise');
        if (crudExercise) {
            crudExercise.innerHTML = '';
            exercises.forEach(ex => crudExercise.add(new Option(ex.name, ex.name)));
        }
    };

    supersetGroupsStore.getAll().onsuccess = (e) => {
        const supersets = e.target.result;
        const crudSupersetGroup = document.getElementById('crudSupersetGroup');
        if (crudSupersetGroup) {
            crudSupersetGroup.innerHTML = '<option value="">No Superset</option>';
            supersets.forEach(sup => crudSupersetGroup.add(new Option(sup.name || `Superset ${sup.id}`, sup.id)));
        }
    };
}

// Workouts Page Functions
function loadWorkout() {
    const selectedDay = document.getElementById('daySelect').value;
    if (!selectedDay) return;
    const transaction = db.transaction(['exerciseInstances', 'supersetGroups', 'supersetLinks'], 'readonly');
    const exerciseInstances = transaction.objectStore('exerciseInstances');
    const supersetLinksStore = transaction.objectStore('supersetLinks');
    const request = exerciseInstances.index('trainingDay').getAll(selectedDay);

    request.onsuccess = () => {
        const exercises = request.result.sort((a, b) => a.order - b.order);
        const workoutDisplay = document.getElementById('workoutDisplay');
        workoutDisplay.innerHTML = '';

        let currentSupersetId = null;
        let supersetExercises = [];

        exercises.forEach((exercise, index) => {
            const linkRequest = supersetLinksStore.index('exerciseInstanceId').get(exercise.id);
            linkRequest.onsuccess = () => {
                const supersetId = linkRequest.result ? linkRequest.result.supersetId : null;

                if (supersetId !== currentSupersetId) {
                    if (supersetExercises.length > 0) {
                        displaySuperset(supersetExercises);
                        supersetExercises = [];
                    }
                    currentSupersetId = supersetId;
                }

                supersetExercises.push(exercise);

                if (index === exercises.length - 1 && supersetExercises.length > 0) {
                    displaySuperset(supersetExercises);
                }
            };
        });
        enableDragAndDrop('workoutDisplay');
    };
}

function displaySuperset(exercises) {
    const workoutDisplay = document.getElementById('workoutDisplay');
    const isSuperset = exercises[0].superset;
    const group = document.createElement('div');
    group.className = isSuperset ? 'superset-group' : 'exercise-group';

    exercises.forEach(exercise => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise';
        exerciseDiv.setAttribute('draggable', true);
        exerciseDiv.setAttribute('data-id', exercise.id);
        exerciseDiv.innerHTML = `
            <span>${exercise.exercise}</span>
            <span>Set ${exercise.set}</span>
            <span>${exercise.weight} lbs</span>
            <span>${exercise.reps} reps</span>
            <span>${exercise.note}</span>
            <span>${exercise.muscleGroup}</span>
        `;
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editWorkout(exercise);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteWorkout(exercise.id);
        exerciseDiv.appendChild(editButton);
        exerciseDiv.appendChild(deleteButton);
        group.appendChild(exerciseDiv);
    });
    workoutDisplay.appendChild(group);
}

function enableDragAndDrop(displayId) {
    const items = document.querySelectorAll(`#${displayId} .exercise, #${displayId} .list-item`);
    let draggedItem = null;

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        });

        item.addEventListener('dragover', (e) => e.preventDefault());
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedItem !== item) {
                const draggedId = draggedItem.getAttribute('data-id');
                const droppedId = item.getAttribute('data-id');
                updateOrder(draggedId, droppedId, displayId);
            }
        });
    });
}

function updateOrder(draggedId, droppedId, displayId) {
    const storeName = displayId === 'workoutDisplay' ? 'exerciseInstances' :
                     displayId === 'trainingDaysDisplay' ? 'trainingDays' :
                     displayId === 'muscleGroupsDisplay' ? 'muscleGroups' :
                     displayId === 'exercisesDisplay' ? 'exercises' : null;
    if (!storeName) return;

    const tx = db.transaction([storeName], 'readwrite');
    const store = tx.objectStore(storeName);
    const getDragged = store.get(parseInt(draggedId));
    const getDropped = store.get(parseInt(droppedId));

    Promise.all([new Promise(resolve => getDragged.onsuccess = () => resolve(getDragged.result)),
                 new Promise(resolve => getDropped.onsuccess = () => resolve(getDropped.result))])
        .then(([dragged, dropped]) => {
            const tempOrder = dragged.order || dragged.id; // Use id as fallback for non-order fields
            dragged.order = dropped.order || dropped.id;
            dropped.order = tempOrder;

            store.put(dragged);
            store.put(dropped);
            tx.oncomplete = () => {
                loadPageContent(); // Reload the current page
            };
        });
}

function showCrudForm(mode = 'create', exercise = null) {
    const form = document.getElementById('crudForm');
    form.classList.remove('hidden');
    document.getElementById('formTitle').textContent = mode === 'create' ? 'Add Workout' : 'Edit Workout';

    if (mode === 'edit' && exercise) {
        document.getElementById('crudTrainingDay').value = exercise.trainingDay;
        document.getElementById('crudMuscleGroup').value = exercise.muscleGroup;
        document.getElementById('crudExercise').value = exercise.exercise;
        document.getElementById('crudOrder').value = exercise.order;
        document.getElementById('crudSet').value = exercise.set;
        document.getElementById('crudWeight').value = exercise.weight;
        document.getElementById('crudReps').value = exercise.reps;
        document.getElementById('crudNote').value = exercise.note;
    } else {
        document.getElementById('crudOrder').value = '';
        document.getElementById('crudSet').value = '';
        document.getElementById('crudWeight').value = '';
        document.getElementById('crudReps').value = '';
        document.getElementById('crudNote').value = '';
        document.getElementById('crudSupersetGroup').value = '';
    }
    form.dataset.mode = mode;
    form.dataset.id = exercise ? exercise.id : null;
}

function saveWorkout() {
    const mode = document.getElementById('crudForm').dataset.mode;
    const id = document.getElementById('crudForm').dataset.id;
    const data = {
        id: mode === 'edit' ? parseInt(id) : undefined,
        trainingDay: document.getElementById('crudTrainingDay').value,
        muscleGroup: document.getElementById('crudMuscleGroup').value,
        exercise: document.getElementById('crudExercise').value,
        order: parseInt(document.getElementById('crudOrder').value),
        set: parseInt(document.getElementById('crudSet').value),
        weight: parseInt(document.getElementById('crudWeight').value),
        reps: parseInt(document.getElementById('crudReps').value),
        note: document.getElementById('crudNote').value,
        superset: document.getElementById('crudSupersetGroup').value !== '',
        date: '2025-07-02T21:49:00' // 09:49 PM BST, July 02, 2025
    };

    const tx = db.transaction(['trainingDays', 'muscleGroups', 'exercises', 'exerciseInstances', 'supersetGroups', 'supersetLinks'], 'readwrite');
    const [trainingDays, muscleGroups, exercises, exerciseInstances, supersetGroups, supersetLinks] = [
        tx.objectStore('trainingDays'),
        tx.objectStore('muscleGroups'),
        tx.objectStore('exercises'),
        tx.objectStore('exerciseInstances'),
        tx.objectStore('supersetGroups'),
        tx.objectStore('supersetLinks')
    ];

    trainingDays.get(data.trainingDay).onsuccess = (e) => { if (!e.target.result) trainingDays.add({ name: data.trainingDay, date: data.date }); };
    muscleGroups.get(data.muscleGroup).onsuccess = (e) => { if (!e.target.result) muscleGroups.add({ name: data.muscleGroup }); };
    exercises.get(data.exercise).onsuccess = (e) => { if (!e.target.result) exercises.add({ name: data.exercise }); };

    const action = mode === 'edit' ? exerciseInstances.put(data) : exerciseInstances.add(data);
    action.onsuccess = (e) => {
        const exerciseId = e.target.result || id;
        const supersetId = document.getElementById('crudSupersetGroup').value;
        if (supersetId) {
            supersetLinks.put({ supersetId: parseInt(supersetId), exerciseInstanceId: exerciseId });
        } else {
            supersetLinks.delete(IDBKeyRange.only({ exerciseInstanceId: exerciseId }));
        }
        cancelCrud();
        populateDropdowns();
        loadWorkout();
    };
    action.onerror = (e) => {
        console.error('Save workout failed:', e.target.error);
    };
}

function editWorkout(exercise) {
    showCrudForm('edit', exercise);
}

function deleteWorkout(id) {
    const tx = db.transaction(['exerciseInstances', 'supersetLinks'], 'readwrite');
    const exerciseInstances = tx.objectStore('exerciseInstances');
    const supersetLinks = tx.objectStore('supersetLinks');
    supersetLinks.delete(IDBKeyRange.only({ exerciseInstanceId: id }));
    exerciseInstances.delete(id);
    tx.oncomplete = () => loadWorkout();
}

function cancelCrud() {
    document.getElementById('crudForm').classList.add('hidden');
}

// Training Days Page Functions
function loadTrainingDays() {
    const tx = db.transaction(['trainingDays'], 'readonly');
    const trainingDays = tx.objectStore('trainingDays');
    const request = trainingDays.getAll();

    request.onsuccess = () => {
        const days = request.result.sort((a, b) => a.name.localeCompare(b.name));
        const display = document.getElementById('trainingDaysDisplay');
        display.innerHTML = '';
        days.forEach((day, index) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.setAttribute('draggable', true);
            div.setAttribute('data-id', day.id);
            div.textContent = `${day.name} (${day.date})`;
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => editTrainingDay(day);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteTrainingDay(day.id);
            div.appendChild(editButton);
            div.appendChild(deleteButton);
            display.appendChild(div);
        });
        enableDragAndDrop('trainingDaysDisplay');
    };
}

function showTrainingDayForm(mode = 'create', day = null) {
    const form = document.getElementById('trainingDayForm');
    form.classList.remove('hidden');
    document.getElementById('trainingDayFormTitle').textContent = mode === 'create' ? 'Add Training Day' : 'Edit Training Day';
    if (mode === 'edit' && day) {
        document.getElementById('trainingDayName').value = day.name;
        document.getElementById('trainingDayDate').value = day.date;
    } else {
        document.getElementById('trainingDayName').value = '';
        document.getElementById('trainingDayDate').value = '2025-07-02';
    }
    form.dataset.mode = mode;
    form.dataset.id = day ? day.id : null;
}

function saveTrainingDay() {
    const mode = document.getElementById('trainingDayForm').dataset.mode;
    const id = document.getElementById('trainingDayForm').dataset.id;
    const data = {
        id: mode === 'edit' ? parseInt(id) : undefined,
        name: document.getElementById('trainingDayName').value,
        date: document.getElementById('trainingDayDate').value || '2025-07-02T21:49:00'
    };

    const tx = db.transaction(['trainingDays'], 'readwrite');
    const trainingDays = tx.objectStore('trainingDays');
    const action = mode === 'edit' ? trainingDays.put(data) : trainingDays.add(data);
    action.onsuccess = () => {
        cancelTrainingDay();
        populateDropdowns();
        loadTrainingDays();
    };
    action.onerror = (e) => {
        console.error('Save training day failed:', e.target.error);
    };
}

function editTrainingDay(day) {
    showTrainingDayForm('edit', day);
}

function deleteTrainingDay(id) {
    const tx = db.transaction(['trainingDays'], 'readwrite');
    const trainingDays = tx.objectStore('trainingDays');
    trainingDays.delete(id);
    tx.oncomplete = () => {
        populateDropdowns();
        loadTrainingDays();
    };
}

function cancelTrainingDay() {
    document.getElementById('trainingDayForm').classList.add('hidden');
}

// Muscle Groups Page Functions
function loadMuscleGroups() {
    const tx = db.transaction(['muscleGroups'], 'readonly');
    const muscleGroups = tx.objectStore('muscleGroups');
    const request = muscleGroups.getAll();

    request.onsuccess = () => {
        const groups = request.result.sort((a, b) => a.name.localeCompare(b.name));
        const display = document.getElementById('muscleGroupsDisplay');
        display.innerHTML = '';
        groups.forEach((group, index) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.setAttribute('draggable', true);
            div.setAttribute('data-id', group.id);
            div.textContent = group.name;
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => editMuscleGroup(group);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteMuscleGroup(group.id);
            div.appendChild(editButton);
            div.appendChild(deleteButton);
            display.appendChild(div);
        });
        enableDragAndDrop('muscleGroupsDisplay');
    };
}

function showMuscleGroupForm(mode = 'create', group = null) {
    const form = document.getElementById('muscleGroupForm');
    form.classList.remove('hidden');
    document.getElementById('muscleGroupFormTitle').textContent = mode === 'create' ? 'Add Muscle Group' : 'Edit Muscle Group';
    if (mode === 'edit' && group) {
        document.getElementById('muscleGroupName').value = group.name;
    } else {
        document.getElementById('muscleGroupName').value = '';
    }
    form.dataset.mode = mode;
    form.dataset.id = group ? group.id : null;
}

function saveMuscleGroup() {
    const mode = document.getElementById('muscleGroupForm').dataset.mode;
    const id = document.getElementById('muscleGroupForm').dataset.id;
    const data = {
        id: mode === 'edit' ? parseInt(id) : undefined,
        name: document.getElementById('muscleGroupName').value
    };

    const tx = db.transaction(['muscleGroups'], 'readwrite');
    const muscleGroups = tx.objectStore('muscleGroups');
    const action = mode === 'edit' ? muscleGroups.put(data) : muscleGroups.add(data);
    action.onsuccess = () => {
        cancelMuscleGroup();
        populateDropdowns();
        loadMuscleGroups();
    };
    action.onerror = (e) => {
        console.error('Save muscle group failed:', e.target.error);
    };
}

function editMuscleGroup(group) {
    showMuscleGroupForm('edit', group);
}

function deleteMuscleGroup(id) {
    const tx = db.transaction(['muscleGroups'], 'readwrite');
    const muscleGroups = tx.objectStore('muscleGroups');
    muscleGroups.delete(id);
    tx.oncomplete = () => {
        populateDropdowns();
        loadMuscleGroups();
    };
}

function cancelMuscleGroup() {
    document.getElementById('muscleGroupForm').classList.add('hidden');
}

// Exercises Page Functions
function loadExercises() {
    const tx = db.transaction(['exercises'], 'readonly');
    const exercises = tx.objectStore('exercises');
    const request = exercises.getAll();

    request.onsuccess = () => {
        const exs = request.result.sort((a, b) => a.name.localeCompare(b.name));
        const display = document.getElementById('exercisesDisplay');
        display.innerHTML = '';
        exs.forEach((ex, index) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.setAttribute('draggable', true);
            div.setAttribute('data-id', ex.id);
            div.textContent = ex.name;
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => editExercise(ex);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteExercise(ex.id);
            div.appendChild(editButton);
            div.appendChild(deleteButton);
            display.appendChild(div);
        });
        enableDragAndDrop('exercisesDisplay');
    };
}

function showExerciseForm(mode = 'create', ex = null) {
    const form = document.getElementById('exerciseForm');
    form.classList.remove('hidden');
    document.getElementById('exerciseFormTitle').textContent = mode === 'create' ? 'Add Exercise' : 'Edit Exercise';
    if (mode === 'edit' && ex) {
        document.getElementById('exerciseName').value = ex.name;
    } else {
        document.getElementById('exerciseName').value = '';
    }
    form.dataset.mode = mode;
    form.dataset.id = ex ? ex.id : null;
}

function saveExercise() {
    const mode = document.getElementById('exerciseForm').dataset.mode;
    const id = document.getElementById('exerciseForm').dataset.id;
    const data = {
        id: mode === 'edit' ? parseInt(id) : undefined,
        name: document.getElementById('exerciseName').value
    };

    const tx = db.transaction(['exercises'], 'readwrite');
    const exercises = tx.objectStore('exercises');
    const action = mode === 'edit' ? exercises.put(data) : exercises.add(data);
    action.onsuccess = () => {
        cancelExercise();
        populateDropdowns();
        loadExercises();
    };
    action.onerror = (e) => {
        console.error('Save exercise failed:', e.target.error);
    };
}

function editExercise(ex) {
    showExerciseForm('edit', ex);
}

function deleteExercise(id) {
    const tx = db.transaction(['exercises'], 'readwrite');
    const exercises = tx.objectStore('exercises');
    exercises.delete(id);
    tx.oncomplete = () => {
        populateDropdowns();
        loadExercises();
    };
}

function cancelExercise() {
    document.getElementById('exerciseForm').classList.add('hidden');
}

// Debug Page Functions
function loadDebugData() {
    const tx = db.transaction(['trainingDays', 'muscleGroups', 'exercises', 'exerciseInstances', 'supersetGroups', 'supersetLinks'], 'readonly');
    const stores = ['trainingDays', 'muscleGroups', 'exercises', 'exerciseInstances', 'supersetGroups', 'supersetLinks'];
    const display = document.getElementById('debugDisplay');
    display.innerHTML = '';

    stores.forEach(storeName => {
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
            const data = request.result;
            const table = document.createElement('table');
            table.className = 'debug-table';
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            if (data.length > 0) {
                const headers = Object.keys(data[0]);
                const headerRow = document.createElement('tr');
                headers.forEach(header => {
                    const th = document.createElement('th');
                    th.textContent = header;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);

                data.forEach(item => {
                    const row = document.createElement('tr');
                    headers.forEach(header => {
                        const td = document.createElement('td');
                        td.textContent = item[header] || 'N/A';
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                const td = document.createElement('td');
                td.textContent = 'No data in ' + storeName;
                td.colSpan = 2;
                row.appendChild(td);
                tbody.appendChild(row);
            }

            table.appendChild(thead);
            table.appendChild(tbody);
            const title = document.createElement('h2');
            title.textContent = storeName;
            display.appendChild(title);
            display.appendChild(table);
        };
    });
}

function clearDatabase() {
    const tx = db.transaction(['trainingDays', 'muscleGroups', 'exercises', 'exerciseInstances', 'supersetGroups', 'supersetLinks'], 'readwrite');
    const stores = ['trainingDays', 'muscleGroups', 'exercises', 'exerciseInstances', 'supersetGroups', 'supersetLinks'];
    stores.forEach(storeName => {
        const store = tx.objectStore(storeName);
        store.clear();
    });
    tx.oncomplete = () => {
        populateDropdowns();
        loadDebugData();
    };
}

// Initial setup
window.onload = () => {
    if (db) {
        const tx = db.transaction(['trainingDays', 'muscleGroups', 'exercises', 'supersetGroups'], 'readwrite');
        const [trainingDays, muscleGroups, exercises, supersetGroups] = [
            tx.objectStore('trainingDays'),
            tx.objectStore('muscleGroups'),
            tx.objectStore('exercises'),
            tx.objectStore('supersetGroups')
        ];
        // Initial data can be removed or kept as defaults
        ['Day 1', 'Day 2'].forEach(day => trainingDays.add({ name: day, date: '2025-07-02' }));
        ['Chest', 'Back', 'Legs'].forEach(group => muscleGroups.add({ name: group }));
        ['Peck deck', 'Incline press', 'Pull downs', 'Deadlifts', 'Leg extensions', 'Leg press', 'Standing calf raises'].forEach(ex => exercises.add({ name: ex }));
        for (let i = 1; i <= 2; i++) supersetGroups.add({ name: `Superset ${i}` });
        populateDropdowns();
    }
};