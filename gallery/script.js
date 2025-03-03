// Initialize photoSets from localStorage or use sample data
let photoSets = JSON.parse(localStorage.getItem('photoSets')) || [
    { id: 1, date: '2024-05-18', notes: 'First set', photos: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'] },
    { id: 2, date: '2024-05-19', notes: 'Second set', photos: ['https://via.placeholder.com/150'] },
];

let currentPage = 'gallery';
let currentSetId = null;

function switchPage(page, setId = null) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelector(`#${page}`).classList.add('active');
    currentPage = page;
    currentSetId = setId;
    updateHeader();
    if (page === 'gallery') renderGallery();
    else if (page === 'photo-view') renderPhotoView(setId);
    else if (page === 'edit') renderEdit(setId);
}

function updateHeader() {
    const headerLeft = document.querySelector('.header-left');
    const headerCenter = document.querySelector('.header-center');
    const headerRight = document.querySelector('.header-right');

    if (currentPage === 'gallery') {
        headerLeft.innerHTML = '<h1>Gallery</h1>';
        headerCenter.innerHTML = '';
        headerRight.innerHTML = '<button onclick="switchPage(\'edit\')">Upload</button>';
    } else if (currentPage === 'photo-view') {
        const set = photoSets.find(s => s.id === currentSetId);
        const dateStr = formatDate(set.date);
        headerLeft.innerHTML = '<button onclick="switchPage(\'gallery\')">< Back</button>';
        headerCenter.innerHTML = `<span>${dateStr}</span>`;
        headerRight.innerHTML = '<button style="color: var(--primary-color);" onclick="switchPage(\'edit\', currentSetId)">Edit</button>';
    } else if (currentPage === 'edit') {
        headerLeft.innerHTML = '<button onclick="switchPage(currentSetId ? \'photo-view\' : \'gallery\', currentSetId)">< Back</button>';
        headerCenter.innerHTML = '';
        headerRight.innerHTML = '<button onclick="saveEdit()">Save</button>';
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
                <span class="set-date">${formatDate(set.date)}</span>
                <span class="set-count">${set.photos.length} photos</span>
            </div>
        `;
        item.addEventListener('click', () => switchPage('photo-view', set.id));
        grid.appendChild(item);
    });
}

function renderPhotoView(setId) {
    const set = photoSets.find(s => s.id === setId);
    const photoContainer = document.querySelector('.photo-container');
    photoContainer.innerHTML = `<img src="${set.photos[0]}" alt="Photo">`;
}

function renderEdit(setId) {
    const editTitle = document.querySelector('#edit h2');
    const editDate = document.querySelector('#edit-date');
    const photoPreviews = document.querySelector('.photo-previews');
    const editNotes = document.querySelector('#edit-notes');

    if (setId) {
        const set = photoSets.find(s => s.id === setId);
        editTitle.textContent = 'Edit Photos';
        editDate.value = set.date;
        editNotes.value = set.notes || '';
        photoPreviews.innerHTML = set.photos.map((photo, index) => `
            <div class="photo-thumbnail" data-index="${index}">
                <img src="${photo}" alt="Photo">
                <button class="delete-btn" data-index="${index}">🗑️</button>
            </div>
        `).join('');
    } else {
        editTitle.textContent = 'New Photo Set';
        editDate.value = new Date().toISOString().split('T')[0]; // Default to today
        editNotes.value = '';
        photoPreviews.innerHTML = '';
    }

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm('Are you sure you want to delete this photo?')) {
                e.target.parentElement.remove();
            }
        });
    });
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
});

function saveEdit() {
    const editDate = document.querySelector('#edit-date');
    const editNotes = document.querySelector('#edit-notes');
    const photoPreviews = document.querySelector('.photo-previews');

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

    // Save to localStorage
    localStorage.setItem('photoSets', JSON.stringify(photoSets));
    switchPage('gallery');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    switchPage('gallery');
});