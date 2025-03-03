let photoSets = JSON.parse(localStorage.getItem('photoSets')) || [
    { id: 1, date: '2024-05-18', notes: 'First set', photos: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'] },
    { id: 2, date: '2024-05-19', notes: 'Second set', photos: ['https://via.placeholder.com/150'] },
];

let currentPage = 'gallery';
let currentSetId = null;
let selectedSets = [];
let slideshowIntervals = [];

function switchPage(page, setId = null) {
    // Clear any existing slideshow intervals
    slideshowIntervals.forEach(id => clearInterval(id));
    slideshowIntervals = [];

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelector(`#${page}`).classList.add('active');
    currentPage = page;
    currentSetId = setId;
    updateHeader();
    if (page === 'gallery') renderGallery();
    else if (page === 'photo-view') renderPhotoView(setId);
    else if (page === 'edit') renderEdit(setId);
    else if (page === 'compare' && setId) renderCompare(setId);
}

function updateHeader() {
    const headerLeft = document.querySelector('.header-left');
    const headerCenter = document.querySelector('.header-center');
    const headerRight = document.querySelector('.header-right');
    const actionBar = document.querySelector('.action-bar');

    if (currentPage === 'gallery') {
        headerLeft.innerHTML = '<h1>Gallery</h1>';
        headerCenter.innerHTML = '';
        headerRight.innerHTML = `<button onclick="switchPage('edit')">Upload</button>`;
        actionBar.style.display = 'flex';
    } else if (currentPage === 'photo-view') {
        const set = photoSets.find(s => s.id === currentSetId);
        const dateStr = formatDate(set.date);
        headerLeft.innerHTML = `<button onclick="switchPage('gallery')">< Stop</button>`;
        headerCenter.innerHTML = `<span>${dateStr}</span>`;
        headerRight.innerHTML = `<button style="color: var(--primary-color);" onclick="switchPage('edit', currentSetId)">Edit</button>`;
        actionBar.style.display = 'none';
    } else if (currentPage === 'edit') {
        headerLeft.innerHTML = `<button onclick="switchPage(currentSetId ? 'photo-view' : 'gallery', currentSetId)">< Back</button>`;
        headerCenter.innerHTML = currentSetId ? 'Edit Set' : 'New Set';
        headerRight.innerHTML = `<button onclick="saveEdit()">Save</button>`;
        actionBar.style.display = 'none';
    } else if (currentPage === 'compare') {
        headerLeft.innerHTML = `<button onclick="switchPage('gallery')">< Stop</button>`;
        headerCenter.innerHTML = 'Compare';
        headerRight.innerHTML = '';
        actionBar.style.display = 'none';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    return `${day}${suffix} ${month} ${year}`;
}

function renderGallery() {
    const grid = document.querySelector('.gallery-grid');
    grid.innerHTML = '';
    photoSets.forEach(set => {
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.dataset.setId = set.id;
        item.innerHTML = `
            <img src="${set.photos[0]}" alt="Thumbnail">
            <div class="set-info">
                <div class="set-date">${formatDate(set.date)}</div>
                <div class="set-count">${set.photos.length} photos</div>
            </div>
            <button class="delete-set-btn" data-id="${set.id}">🗑️</button>
            <span class="compare-icon">✓</span>
        `;
        if (selectedSets.includes(set.id)) item.classList.add('selected');
        item.addEventListener('click', (e) => {
            if (e.target.className === 'delete-set-btn') return;
            if (selectedSets.includes(set.id)) {
                selectedSets = selectedSets.filter(id => id !== set.id);
                item.classList.remove('selected');
            } else if (selectedSets.length < 2) {
                selectedSets.push(set.id);
                item.classList.add('selected');
            } else {
                switchPage('photo-view', set.id);
            }
        });
        grid.appendChild(item);
    });

    document.querySelectorAll('.delete-set-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const setId = parseInt(e.target.dataset.id);
            if (confirm('Are you sure you want to delete this set?')) {
                photoSets = photoSets.filter(set => set.id !== setId);
                selectedSets = selectedSets.filter(id => id !== setId);
                localStorage.setItem('photoSets', JSON.stringify(photoSets));
                renderGallery();
                updateStorageBar();
            }
        });
    });
}

function renderPhotoView(setId) {
    const set = photoSets.find(s => s.id === setId);
    const photoContainer = document.querySelector('.photo-container');
    photoContainer.innerHTML = '';
    set.photos.forEach((photo, index) => {
        const div = document.createElement('div');
        div.className = 'photo-wrapper';
        div.innerHTML = `
            <img src="${photo}" alt="Photo" class="${index === 0 ? 'active' : ''}">
            <button class="delete-btn" data-index="${index}">🗑️</button>
        `;
        photoContainer.appendChild(div);
    });

    const images = photoContainer.querySelectorAll('img');
    const deleteButtons = photoContainer.querySelectorAll('.delete-btn');
    let currentIndex = 0;

    const intervalId = setInterval(() => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
    }, 3500); // 3 seconds visible + 0.5-second transition
    slideshowIntervals.push(intervalId);

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (confirm('Are you sure you want to delete this photo?')) {
                set.photos.splice(index, 1);
                localStorage.setItem('photoSets', JSON.stringify(photoSets));
                slideshowIntervals.forEach(id => clearInterval(id));
                if (set.photos.length > 0) {
                    renderPhotoView(setId);
                } else {
                    photoSets = photoSets.filter(s => s.id !== setId);
                    localStorage.setItem('photoSets', JSON.stringify(photoSets));
                    switchPage('gallery');
                }
                updateStorageBar();
            }
        });
    });
}

function renderCompare(setIds) {
    const leftContainer = document.querySelector('.compare-left');
    const rightContainer = document.querySelector('.compare-right');
    leftContainer.innerHTML = '';
    rightContainer.innerHTML = '';

    const leftSet = photoSets.find(s => s.id === setIds[0]);
    const rightSet = photoSets.find(s => s.id === setIds[1]);

    leftSet.photos.forEach((photo, index) => {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = 'Photo';
        img.className = index === 0 ? 'active' : '';
        leftContainer.appendChild(img);
    });
    rightSet.photos.forEach((photo, index) => {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = 'Photo';
        img.className = index === 0 ? 'active' : '';
        rightContainer.appendChild(img);
    });

    const leftImages = leftContainer.querySelectorAll('img');
    const rightImages = rightContainer.querySelectorAll('img');
    let leftIndex = 0;
    let rightIndex = 0;

    const leftIntervalId = setInterval(() => {
        leftImages[leftIndex].classList.remove('active');
        leftIndex = (leftIndex + 1) % leftImages.length;
        leftImages[leftIndex].classList.add('active');
    }, 3500);

    const rightIntervalId = setInterval(() => {
        rightImages[rightIndex].classList.remove('active');
        rightIndex = (rightIndex + 1) % rightImages.length;
        rightImages[rightIndex].classList.add('active');
    }, 3500);

    slideshowIntervals.push(leftIntervalId, rightIntervalId);
}

function renderEdit(setId) {
    const editDate = document.querySelector('#edit-date');
    const editNotes = document.querySelector('#edit-notes');
    const photoPreviews = document.querySelector('.photo-previews');
    photoPreviews.innerHTML = ''; // Clear previews on entry

    if (setId) {
        const set = photoSets.find(s => s.id === setId);
        editDate.value = set.date;
        editNotes.value = set.notes;
        set.photos.forEach(photo => {
            const div = document.createElement('div');
            div.className = 'photo-thumbnail';
            div.innerHTML = `
                <img src="${photo}" alt="Preview">
                <button class="delete-btn">🗑️</button>
            `;
            div.querySelector('.delete-btn').addEventListener('click', (e) => {
                if (confirm('Are you sure you want to delete this photo?')) {
                    e.target.parentElement.remove();
                }
            });
            photoPreviews.appendChild(div);
        });
    } else {
        editDate.value = new Date().toISOString().split('T')[0];
        editNotes.value = '';
    }
}

function triggerUpload() {
    document.querySelector('#photo-upload').click();
}

document.querySelector('#photo-upload').addEventListener('change', (e) => {
    const files = e.target.files;
    const photoPreviews = document.querySelector('.photo-previews');
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const div = document.createElement('div');
            div.className = 'photo-thumbnail';
            div.innerHTML = `
                <img src="${event.target.result}" alt="Preview">
                <button class="delete-btn">🗑️</button>
            `;
            div.querySelector('.delete-btn').addEventListener('click', (e) => {
                if (confirm('Are you sure you want to delete this photo?')) {
                    e.target.parentElement.remove();
                }
            });
            photoPreviews.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
    e.target.value = ''; // Reset input to allow re-uploading the same files
});

function saveEdit() {
    const editDate = document.querySelector('#edit-date');
    const editNotes = document.querySelector('#edit-notes');
    const photoPreviews = document.querySelector('.photo-previews');

    if (!editDate.value || photoPreviews.children.length === 0) {
        alert('Please provide a date and at least one photo.');
        return;
    }

    if (currentSetId) {
        const set = photoSets.find(s => s.id === currentSetId);
        set.date = editDate.value;
        set.notes = editNotes.value;
        set.photos = Array.from(photoPreviews.children).map(child => child.querySelector('img').src);
    } else {
        const newId = photoSets.length ? Math.max(...photoSets.map(s => s.id)) + 1 : 1;
        const newSet = {
            id: newId,
            date: editDate.value,
            notes: editNotes.value,
            photos: Array.from(photoPreviews.children).map(child => child.querySelector('img').src),
        };
        photoSets.push(newSet);
    }

    localStorage.setItem('photoSets', JSON.stringify(photoSets));
    updateStorageBar();
    switchPage(currentSetId ? 'photo-view' : 'gallery', currentSetId);
}

function updateStorageBar() {
    const storageBar = document.querySelector('.storage-progress');
    const storageText = document.querySelector('.storage-text');
    const totalSize = JSON.stringify(photoSets).length;
    const maxSize = 5 * 1024 * 1024; // 5MB for localStorage
    const percentage = (totalSize / maxSize) * 100;
    storageBar.style.width = `${percentage}%`;
    storageText.textContent = `Storage Used: ${totalSize} bytes (${percentage.toFixed(2)}%)`;
}

document.addEventListener('DOMContentLoaded', () => {
    switchPage('gallery');
    updateStorageBar();

    document.querySelector('#compare-btn').addEventListener('click', () => {
        if (selectedSets.length === 2) {
            switchPage('compare', selectedSets);
            selectedSets = [];
            renderGallery();
        } else {
            alert('Please select exactly two sets to compare.');
        }
    });

    document.querySelector('#clear-all-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all photo sets?')) {
            localStorage.removeItem('photoSets');
            photoSets = [];
            selectedSets = [];
            renderGallery();
            updateStorageBar();
        }
    });
});