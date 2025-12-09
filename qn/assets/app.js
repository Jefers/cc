// QNotes - Vanilla JS PWA
// Storage key: qn.library_v1
const STORAGE_KEY = 'qn.library_v1';
const VERSION_HISTORY_LIMIT = 10;

// UUID Generator
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ISO 8601 Timestamp
function nowISO() {
    return new Date().toISOString();
}

// Sanitize HTML (using DOMPurify)
function sanitizeHTML(html) {
    return DOMPurify.sanitize(html);
}

// Storage Layer
class Storage {
    static load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load data:', e);
            return null;
        }
    }
    
    static save(data) {
        try {
            data.meta.updatedAt = nowISO();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
            return true;
        } catch (e) {
            console.error('Failed to save data:', e);
            return false;
        }
    }
    
    static init() {
        const existing = this.load();
        if (existing) return existing;
        
        const newData = {
            meta: {
                app: 'qn',
                version: 1,
                createdAt: nowISO(),
                updatedAt: nowISO()
            },
            titles: []
        };
        
        this.save(newData);
        return newData;
    }
}

// State Management
const AppState = {
    data: null,
    currentView: 'titles',
    currentTitleId: null,
    currentCardId: null,
    currentSort: 'manual',
    theme: 'dark',
    
    init() {
        this.data = Storage.init();
        this.loadTheme();
        this.bindEvents();
        this.render();
    },
    
    loadTheme() {
        const saved = localStorage.getItem('qn.theme');
        this.theme = saved || 'dark';
        document.body.classList.toggle('light', this.theme === 'light');
    },
    
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.body.classList.toggle('light', this.theme === 'light');
        localStorage.setItem('qn.theme', this.theme);
    },
    
    bindEvents() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Menu
        const menuBtn = document.getElementById('menu-toggle');
        const menu = document.getElementById('app-menu');
        menuBtn.addEventListener('click', () => {
            const expanded = menu.classList.toggle('show');
            menuBtn.setAttribute('aria-expanded', expanded);
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                menu.classList.remove('show');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Sort controls
        document.querySelectorAll('.segment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.segment-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                this.currentSort = btn.dataset.sort;
                this.renderTitles();
            });
        });
        
        // FAB
        document.getElementById('fab').addEventListener('click', () => {
            if (this.currentView === 'titles') {
                this.createTitle();
            } else if (this.currentView === 'cards') {
                this.createCard();
            }
        });
        
        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showView('titles');
        });
        
        // Navigation
        document.getElementById('prev-card').addEventListener('click', () => {
            this.navigateCard(-1);
        });
        
        document.getElementById('next-card').addEventListener('click', () => {
            this.navigateCard(1);
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.currentView === 'cards' && e.key === 'ArrowLeft') {
                this.navigateCard(-1);
            } else if (this.currentView === 'cards' && e.key === 'ArrowRight') {
                this.navigateCard(1);
            }
        });
        
        // Swipe gestures
        this.initSwipeGestures();
        
        // Editor
        document.getElementById('edit-card-btn').addEventListener('click', () => {
            this.openEditor();
        });
        
        document.getElementById('preview-toggle').addEventListener('click', () => {
            this.togglePreview();
        });
        
        document.getElementById('save-card').addEventListener('click', () => {
            this.saveCard();
        });
        
        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.closeEditor();
        });
        
        document.getElementById('delete-card-btn').addEventListener('click', () => {
            this.deleteCard();
        });
        
        // Version history
        document.getElementById('version-history').addEventListener('click', () => {
            this.showVersionHistory();
        });
        
        document.getElementById('close-vh-modal').addEventListener('click', () => {
            this.closeVersionHistory();
        });
        
        // Import/Export
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-input').click();
        });
        
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('import-input').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });
        
        // Confirmation modal
        document.getElementById('confirm-cancel').addEventListener('click', () => {
            this.closeConfirm();
        });
    },
    
    initSwipeGestures() {
        const container = document.getElementById('cards-container');
        let startX = 0;
        let startY = 0;
        let isSwipe = false;
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipe = true;
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!isSwipe) return;
            
            const deltaX = Math.abs(e.touches[0].clientX - startX);
            const deltaY = Math.abs(e.touches[0].clientY - startY);
            
            // If vertical movement > horizontal, not a swipe
            if (deltaY > deltaX) {
                isSwipe = false;
            }
        });
        
        container.addEventListener('touchend', (e) => {
            if (!isSwipe) return;
            
            const deltaX = e.changedTouches[0].clientX - startX;
            const threshold = 50;
            
            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    this.navigateCard(-1); // Swipe right = previous
                } else {
                    this.navigateCard(1); // Swipe left = next
                }
            }
            
            isSwipe = false;
        });
    },
    
    showView(view) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${view}-view`).classList.add('active');
        this.currentView = view;
        
        // Update FAB
        const fab = document.getElementById('fab');
        fab.style.display = view === 'editor' ? 'none' : 'flex';
    },
    
    render() {
        this.renderTitles();
        
        if (this.currentTitleId) {
            this.renderCards();
        }
    },
    
    renderTitles() {
        const container = document.getElementById('titles-list');
        const empty = document.getElementById('empty-state');
        
        if (this.data.titles.length === 0) {
            container.innerHTML = '';
            empty.style.display = 'flex';
            return;
        }
        
        empty.style.display = 'none';
        
        // Sort titles
        let titles = [...this.data.titles];
        switch (this.currentSort) {
            case 'alphabetical':
                titles.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'recent':
                titles.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case 'manual':
            default:
                titles.sort((a, b) => a.order - b.order);
                break;
        }
        
        container.innerHTML = titles.map(title => this.createTitleElement(title)).join('');
        
        // Enable drag and drop for manual sort
        if (this.currentSort === 'manual') {
            this.enableDragAndDrop();
        }
    },
    
    createTitleElement(title) {
        const cardCount = title.cards.length;
        const lastModified = new Date(title.updatedAt).toLocaleDateString();
        
        return `
            <div class="glass-card title-item" data-id="${title.id}" role="listitem" tabindex="0">
                <div class="drag-handle" aria-label="Drag to reorder">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12h18M3 6h18M3 18h18"></path>
                    </svg>
                </div>
                <div class="title-content">
                    <div class="title-main">
                        <div class="color-swatch" style="background-color: ${title.color}"></div>
                        <h3 class="title-text">${this.escapeHtml(title.title)}</h3>
                    </div>
                    <div class="title-meta">
                        ${cardCount} card${cardCount !== 1 ? 's' : ''} • Last modified ${lastModified}
                    </div>
                </div>
                <button class="btn-icon title-menu" aria-label="Title options" data-id="${title.id}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>
            </div>
        `;
    },
    
    enableDragAndDrop() {
        const container = document.getElementById('titles-list');
        const items = container.querySelectorAll('.title-item');
        let dragged = null;
        
        items.forEach(item => {
            const handle = item.querySelector('.drag-handle');
            
            handle.addEventListener('dragstart', (e) => {
                dragged = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                dragged = null;
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                const after = this.getDragAfterElement(container, e.clientY);
                if (after == null) {
                    container.appendChild(dragged);
                } else {
                    container.insertBefore(dragged, after);
                }
            });
            
            // Make draggable
            handle.draggable = true;
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            this.updateTitleOrder();
        });
    },
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.title-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },
    
    updateTitleOrder() {
        const items = document.querySelectorAll('.title-item');
        const idOrder = Array.from(items).map(item => item.dataset.id);
        
        // Update order in data
        idOrder.forEach((id, index) => {
            const title = this.data.titles.find(t => t.id === id);
            if (title) title.order = index;
        });
        
        Storage.save(this.data);
    },
    
    createTitle() {
        const title = prompt('Enter title name:');
        if (!title) return;
        
        const color = this.getRandomColor();
        const newTitle = {
            id: generateId('title'),
            title: title.trim(),
            color,
            createdAt: nowISO(),
            updatedAt: nowISO(),
            order: this.data.titles.length,
            cards: []
        };
        
        this.data.titles.push(newTitle);
        Storage.save(this.data);
        this.renderTitles();
    },
    
    getRandomColor() {
        const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    showTitle(titleId) {
        this.currentTitleId = titleId;
        this.renderCards();
        this.showView('cards');
    },
    
    renderCards() {
        const title = this.data.titles.find(t => t.id === this.currentTitleId);
        if (!title) return;
        
        // Update header
        document.getElementById('current-title').textContent = title.title;
        document.getElementById('title-color-swatch').style.backgroundColor = title.color;
        
        // Show first card or empty state
        if (title.cards.length === 0) {
            document.getElementById('cards-container').style.display = 'none';
            document.getElementById('empty-cards-state').style.display = 'flex';
            return;
        }
        
        document.getElementById('cards-container').style.display = 'block';
        document.getElementById('empty-cards-state').style.display = 'none';
        
        // Show first card
        this.currentCardId = title.cards[0].id;
        this.renderCard();
    },
    
    renderCard() {
        const title = this.data.titles.find(t => t.id === this.currentTitleId);
        const card = title.cards.find(c => c.id === this.currentCardId);
        if (!card) return;
        
        const content = document.getElementById('card-content');
        content.innerHTML = sanitizeHTML(marked.parse(card.markdown));
        
        // Update progress
        const cardIndex = title.cards.findIndex(c => c.id === this.currentCardId);
        document.getElementById('card-progress').textContent = `${cardIndex + 1} / ${title.cards.length}`;
        
        // Update nav buttons
        document.getElementById('prev-card').disabled = cardIndex === 0;
        document.getElementById('next-card').disabled = cardIndex === title.cards.length - 1;
    },
    
    navigateCard(direction) {
        const title = this.data.titles.find(t => t.id === this.currentTitleId);
        const currentIndex = title.cards.findIndex(c => c.id === this.currentCardId);
        const newIndex = currentIndex + direction;
        
        if (newIndex >= 0 && newIndex < title.cards.length) {
            this.currentCardId = title.cards[newIndex].id;
            this.renderCard();
        }
    },
    
    createCard() {
        const markdown = prompt('Enter card content (Markdown):');
        if (markdown === null) return;
        
        const newCard = {
            id: generateId('card'),
            markdown: markdown,
            createdAt: nowISO(),
            updatedAt: nowISO(),
            version: 1,
            versions: []
        };
        
        const title = this.data.titles.find(t => t.id === this.currentTitleId);
        title.cards.push(newCard);
        title.updatedAt = nowISO();
        
        Storage.save(this.data);
        this.renderCards();
    },
    
    openEditor() {
        const title = this.data.titles.find(t => t.id === this.currentTitleId);
        const card = title.cards.find(c => c.id === this.currentCardId);
        
        document.getElementById('markdown-input').value = card.markdown;
        document.getElementById('editor-title').textContent = 'Edit Card';
        document.getElementById('version-indicator').textContent = `Version ${card.version}`;
        
        this.showView('editor');
    },
    
    togglePreview() {
        const preview = document.getElementById('preview-pane');
        const isVisible = preview.style.display !== 'none';
        
        if (!isVisible) {
            const markdown = document.getElementById('markdown-input').value;
            document.getElementById('preview-content').innerHTML = sanitizeHTML(marked.parse(markdown));
            preview.style.display = 'block';
            document.getElementById('preview-toggle').textContent = 'Edit';
        } else {
            preview.style.display = 'none';
            document.getElementById('preview-toggle').textContent = 'Preview';
        }
    },
    
    saveCard() {
        const title = this.data.titles.find(t => t.id === this.currentTitleId);
        const card = title.cards.find(c => c.id === this.currentCardId);
        const newMarkdown = document.getElementById('markdown-input').value;
        
        if (newMarkdown === card.markdown) {
            this.closeEditor();
            return;
        }
        
        // Save to version history
        card.versions.unshift({
            timestamp: card.updatedAt,
            markdown: card.markdown
        });
        
        // Limit history
        if (card.versions.length > VERSION_HISTORY_LIMIT) {
            card.versions = card.versions.slice(0, VERSION_HISTORY_LIMIT);
        }
        
        // Update card
        card.markdown = newMarkdown;
        card.updatedAt = nowISO();
        card.version += 1;
        
        title.updatedAt = nowISO();
        
        Storage.save(this.data);
        this.closeEditor();
        this.renderCard();
    },
    
    closeEditor() {
        this.showView('cards');
        document.getElementById('preview-pane').style.display = 'none';
        document.getElementById('preview-toggle').textContent = 'Preview';
    },
    
    deleteCard() {
        this.showConfirm(
            'Delete Card',
            'Are you sure you want to delete this card? This action cannot be undone.',
            () => {
                const title = this.data.titles.find(t => t.id === this.currentTitleId);
                const cardIndex = title.cards.findIndex(c => c.id === this.currentCardId);
                
                if (cardIndex > -1) {
                    title.cards.splice(cardIndex, 1);
                    title.updatedAt = nowISO();
                    
                    Storage.save(this.data);
                    
                    if (title.cards.length === 0) {
                        this.renderCards();
                    } else {
                        const newIndex = Math.min(cardIndex, title.cards.length - 1);
                        this.currentCardId = title.cards[newIndex].id;
                        this.renderCard();
                    }
                }
            }
        );
    },
    
    showVersionHistory() {
        const title = this.data.titles.find(t => t.id === this.currentTitleId);
        const card = title.cards.find(c => c.id === this.currentCardId);
        
        const modal = document.getElementById('version-history-modal');
        const list = document.getElementById('vh-list');
        
        let html = `
            <div class="vh-item active" data-version="current">
                <div class="vh-timestamp">Current • ${new Date(card.updatedAt).toLocaleString()}</div>
                <div class="vh-preview">${this.escapeHtml(card.markdown.substring(0, 100))}...</div>
            </div>
        `;
        
        card.versions.forEach((version, index) => {
            html += `
                <div class="vh-item" data-version="${index}">
                    <div class="vh-timestamp">Version ${card.version - index - 1} • ${new Date(version.timestamp).toLocaleString()}</div>
                    <div class="vh-preview">${this.escapeHtml(version.markdown.substring(0, 100))}...</div>
                </div>
            `;
        });
        
        list.innerHTML = html;
        modal.classList.add('show');
        
        // Bind restore events
        list.querySelectorAll('.vh-item').forEach(item => {
            item.addEventListener('click', () => {
                const version = item.dataset.version;
                this.restoreVersion(version);
            });
        });
    },
    
    closeVersionHistory() {
        document.getElementById('version-history-modal').classList.remove('show');
    },
    
    restoreVersion(version) {
        const title = this.data.titles.find(t => t.id === this.currentTitleId);
        const card = title.cards.find(c => c.id === this.currentCardId);
        
        if (version === 'current') {
            this.closeVersionHistory();
            return;
        }
        
        const versionIndex = parseInt(version);
        const versionData = card.versions[versionIndex];
        
        if (!versionData) return;
        
        // Save current to history
        card.versions.unshift({
            timestamp: card.updatedAt,
            markdown: card.markdown
        });
        
        // Limit history
        if (card.versions.length > VERSION_HISTORY_LIMIT) {
            card.versions = card.versions.slice(0, VERSION_HISTORY_LIMIT);
        }
        
        // Restore version
        card.markdown = versionData.markdown;
        card.updatedAt = nowISO();
        card.version += 1;
        
        title.updatedAt = nowISO();
        
        Storage.save(this.data);
        this.closeVersionHistory();
        this.closeEditor();
        this.renderCard();
    },
    
    showConfirm(title, message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        
        modal.classList.add('show');
        
        const okBtn = document.getElementById('confirm-ok');
        const handler = () => {
            onConfirm();
            this.closeConfirm();
            okBtn.removeEventListener('click', handler);
        };
        okBtn.addEventListener('click', handler);
    },
    
    closeConfirm() {
        document.getElementById('confirm-modal').classList.remove('show');
    },
    
    deleteTitle(titleId) {
        this.showConfirm(
            'Delete Title',
            'Delete this title and all its cards? This action cannot be undone.',
            () => {
                const index = this.data.titles.findIndex(t => t.id === titleId);
                if (index > -1) {
                    this.data.titles.splice(index, 1);
                    
                    // Reorder remaining titles
                    this.data.titles.forEach((t, i) => t.order = i);
                    
                    Storage.save(this.data);
                    this.renderTitles();
                }
            }
        );
    },
    
    renameTitle(titleId) {
        const title = this.data.titles.find(t => t.id === titleId);
        const newTitle = prompt('New title:', title.title);
        if (newTitle && newTitle !== title.title) {
            title.title = newTitle.trim();
            title.updatedAt = nowISO();
            Storage.save(this.data);
            this.renderTitles();
        }
    },
    
    editTitleColor(titleId) {
        const title = this.data.titles.find(t => t.id === titleId);
        const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
        
        const html = `
            <div class="color-picker">
                ${colors.map(color => `
                    <div class="color-option${color === title.color ? ' selected' : ''}" 
                         style="background-color: ${color}" 
                         data-color="${color}"></div>
                `).join('')}
            </div>
        `;
        
        this.showConfirm('Choose Color', '', () => {}); // Custom modal content
        
        const modal = document.getElementById('confirm-modal');
        const body = modal.querySelector('.modal-body');
        body.innerHTML = html;
        
        // Override buttons
        const okBtn = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');
        
        okBtn.textContent = 'Save';
        cancelBtn.textContent = 'Cancel';
        
        const clickHandler = (e) => {
            if (e.target.classList.contains('color-option')) {
                body.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        };
        
        body.addEventListener('click', clickHandler);
        
        okBtn.onclick = () => {
            const selected = body.querySelector('.color-option.selected');
            if (selected) {
                title.color = selected.dataset.color;
                title.updatedAt = nowISO();
                Storage.save(this.data);
                this.renderTitles();
            }
            this.closeConfirm();
            body.removeEventListener('click', clickHandler);
        };
        
        cancelBtn.onclick = () => {
            this.closeConfirm();
            body.removeEventListener('click', clickHandler);
        };
    },
    
    exportData() {
        const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '');
        a.href = url;
        a.download = `qn-export-${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    async importData(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Basic validation
            if (!data.meta || data.meta.app !== 'qn' || !Array.isArray(data.titles)) {
                throw new Error('Invalid file format');
            }
            
            this.showConfirm(
                'Import Library',
                'This will replace your current library. Are you sure?',
                () => {
                    this.data = data;
                    Storage.save(this.data);
                    this.render();
                    alert('Import successful!');
                }
            );
        } catch (e) {
            alert('Failed to import: Invalid file format');
        }
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Event Delegation for Dynamic Elements
document.addEventListener('click', (e) => {
    // Title item click
    const titleItem = e.target.closest('.title-item');
    if (titleItem && !e.target.closest('.title-menu') && !e.target.closest('.drag-handle')) {
        AppState.showTitle(titleItem.dataset.id);
    }
    
    // Title menu actions
    const menuBtn = e.target.closest('.title-menu');
    if (menuBtn) {
        e.stopPropagation();
        const titleId = menuBtn.dataset.id;
        
        const actions = [
            { label: 'Rename', action: () => AppState.renameTitle(titleId) },
            { label: 'Edit Color', action: () => AppState.editTitleColor(titleId) },
            { label: 'Delete', action: () => AppState.deleteTitle(titleId) }
        ];
        
        const rect = menuBtn.getBoundingClientRect();
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu show';
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;
        menu.style.zIndex = '1000';
        
        actions.forEach(({ label, action }) => {
            const item = document.createElement('button');
            item.className = 'dropdown-item';
            item.textContent = label;
            item.addEventListener('click', () => {
                action();
                menu.remove();
            });
            menu.appendChild(item);
        });
        
        document.body.appendChild(menu);
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    AppState.init();
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}