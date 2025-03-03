let photoSets = JSON.parse(localStorage.getItem('photoSets')) || [
    { id: 1, date: '2024-05-18', notes: 'First set', photos: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'] },
    { id: 2, date: '2024-05-19', notes: 'Second set', photos: ['https://via.placeholder.com/150'] },
];

let currentPage = 'gallery';
let currentSetId = null;
let selectedSets = [];

function switchPage(page, setId = null) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelector(`#${page}`).classList.add('active');
    currentPage = page;
    currentSetId = setId;
    updateHeader();
    if (page === 'gallery') renderGallery();
    else if (page === 'photo-view') renderPhotoView(setId);
    else if (page === 'edit') renderEdit(setId);
    else if (page === 'compare') renderCompare(setId);
}

function updateHeader() {
    const headerLeft = document.querySelector('.header-left');
    const headerCenter = document.querySelector('.header-center');
    const headerRight = document.querySelector('.header-right');

    if (currentPage === 'gallery') {
        headerLeft.innerHTML = '<h1>Gallery</h1>';
        headerCenter.innerHTML = '';
        headerRight.innerHTML = `<button onclick="switchPage('edit')">Upload</button>`;
    } else if (currentPage === 'photo-view') {
        const set = photoSets.find(s => s.id === currentSetId);
        const dateStr = formatDate(set.date);
        headerLeft.innerHTML = `<button onclick="switchPage('gallery')">< Back</button>`;
        headerCenter.innerHTML = `<span>${dateStr}</span>`;
        headerRight.innerHTML = `<button style="color: var(--primary-color);" onclick="switchPage('edit', currentSetId)">Edit</button>`;
    } else if (currentPage === 'edit') {
        headerLeft.innerHTML = `<button onclick="switchPage(currentSetId ? 'photo-view' : 'gallery', currentSetId)">< Back</button>`;
        headerCenter.innerHTML = '';
        headerRight.innerHTML = `<button onclick="saveEdit()">Save</button>`;
    } else if (currentPage === 'compare') {
        headerLeft.innerHTML = `<button onclick="switchPage('gallery')">< Back</button>`;
        headerCenter.innerHTML = 'Compare';
        headerRight.innerHTML = '';
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
        `;
        item.addEventListener('click', (e) => {
            if (e.target.className !== 'delete-set-btn') {
                if (selectedSets.includes(set.id)) {
                    selectedSets = selectedSets.filter(id => id !== set.id);
                    item.classList.remove('selected');
                } else if (selectedSets.length < 2) {
                    selectedSets.push(set.id);
                    item.classList.add('selected');
                }
            }
        });
        grid.appendChild(item);
    });

    document.querySelectorAll('.delete-set-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const setId = parseInt(e.target.dataset.id);
            if (confirm('Are you sure you want to delete this set?')) {
                photoSets = photoSets.filter(set => set.id !== setId);
                localStorage.setItem('photoSets', JSON.stringify(photoSets));
                renderGallery();
                updateStorageBar();
            }
        });
    });

    const compareButton = document.createElement('button');
    compareButton.textContent = 'Compare';
    compareButton.addEventListener('click', () => {
        if (selectedSets.length === 2) {
            switchPage('compare', selectedSets);
            selectedSets = [];
            renderGallery(); // Reset selections
        } else {
            alert('Please select exactly two sets to compare.');
        }
    });
    grid.appendChild(compareButton);

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear All';
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all photo sets?')) {
            localStorage.removeItem('photoSets');
            photoSets = [];
            renderGallery();
            updateStorageBar();
        }
    });
    grid.appendChild(clearButton);
}

function renderPhotoView(setId) {
    const set = photoSets.find(s => s.id === setId);
    const photoContainer = document.querySelector('.photo-container');
    photoContainer.innerHTML = '';
    set.photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = 'Photo';
        photoContainer.appendChild(img);
    });

    let currentIndex = 0;
    const images = photoContainer.querySelectorAll('img');
    images.forEach((img, index) => img.style.display = index === 0 ? 'block' : 'none');

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
        images[currentIndex].style.display = 'none';
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].style.display = 'block';
    });
    photoContainer.appendChild(nextButton);
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
        editDate.value = new Date().toISOString().split('T')[0];
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

    localStorage.setItem('photoSets', JSON.stringify(photoSets));
    updateStorageBar();
    switchPage('gallery');
}

function renderCompare(setIds) {
    const leftContainer = document.querySelector('.compare-left');
    const rightContainer = document.querySelector('.compare-right');
    leftContainer.innerHTML = '';
    rightContainer.innerHTML = '';

    const leftSet = photoSets.find(s => s.id === setIds[0]);
    const rightSet = photoSets.find(s => s.id === setIds[1]);

    leftSet.photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = 'Photo';
        leftContainer.appendChild(img);
    });
    rightSet.photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = 'Photo';
        rightContainer.appendChild(img);
    });

    let leftIndex = 0;
    let rightIndex = 0;
    const leftImages = leftContainer.querySelectorAll('img');
    const rightImages = rightContainer.querySelectorAll('img');

    leftImages.forEach((img, index) => img.style.display = index === 0 ? 'block' : 'none');
    rightImages.forEach((img, index) => img.style.display = index === 0 ? 'block' : 'none');

    const nextLeftButton = document.createElement('button');
    nextLeftButton.textContent = 'Next Left';
    nextLeftButton.addEventListener('click', () => {
        leftImages[leftIndex].style.display = 'none';
        leftIndex = (leftIndex + 1) % leftImages.length;
        leftImages[leftIndex].style.display = 'block';
    });
    leftContainer.appendChild(nextLeftButton);

    const nextRightButton = document.createElement('button');
    nextRightButton.textContent = 'Next Right';
    nextRightButton.addEventListener('click', () => {
        rightImages[rightIndex].style.display = 'none';
        rightIndex = (rightIndex + 1) % rightImages.length;
        rightImages[rightIndex].style.display = 'block';
    });
    rightContainer.appendChild(nextRightButton);
}

function updateStorageBar() {
    const storageBar = document.querySelector('.storage-bar');
    const totalSize = JSON.stringify(photoSets).length;
    const maxSize = 5 * 1024 * 1024; // 5MB for localStorage
    const percentage = (totalSize / maxSize) * 100;
    storageBar.textContent = `Storage Used: ${totalSize} bytes (${percentage.toFixed(2)}%)`;
}

document.addEventListener('DOMContentLoaded', () => {
    switchPage('gallery');
    updateStorageBar();
});