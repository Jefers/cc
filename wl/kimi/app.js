// --- app.js ---

const app = {
    // Constants
    STORAGE_KEY: 'weightProgram_v1',
    DEFAULT_A: 0.35,
    WEEKS: 12,
    
    // State
    program: null,
    currentWeek: 1,
    chart: null,
    chartCtx: null,
    
    // Initialize
    init() {
        this.setupTheme();
        this.bindEvents();
        this.loadProgram();
        this.initializeChart();
    },
    
    // Theme management
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    },
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    },
    
    // Event bindings
    bindEvents() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Menu toggle
        document.getElementById('menuToggle').addEventListener('click', () => this.openSidebar());
        document.getElementById('closeSidebar').addEventListener('click', () => this.closeSidebar());
        document.getElementById('overlay').addEventListener('click', () => this.closeSidebar());
        
        // Setup form
        document.getElementById('setupForm').addEventListener('submit', (e) => this.handleSetup(e));
        
        // Weekly form
        document.getElementById('weeklyForm').addEventListener('submit', (e) => this.handleWeeklyEntry(e));
        
        // Week slider
        const weekSlider = document.getElementById('weekSlider');
        weekSlider.addEventListener('input', (e) => this.updateCurrentWeek(parseInt(e.target.value)));
        
        // Modal buttons
        document.getElementById('modalCancel').addEventListener('click', () => this.closeModal());
        
        // File import
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.id = 'fileInput';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        document.body.appendChild(fileInput);
    },
    
    // Program management
    loadProgram() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                this.program = JSON.parse(saved);
                this.showDashboard();
            } catch (e) {
                this.showToast('Error loading saved data', 'error');
                this.showSetup();
            }
        } else {
            this.showSetup();
        }
    },
    
    saveProgram() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.program));
    },
    
    // Exponential curve calculator
    calculateExponentialCurve(startWeight, targetWeight, a = this.DEFAULT_A) {
        const E = (t) => Math.exp(-a * t);
        const E12 = E(12);
        const curve = [];
        
        for (let t = 1; t <= 12; t++) {
            const Et = E(t);
            const value = targetWeight + (startWeight - targetWeight) * (Et - E12) / (1 - E12);
            curve.push(Math.round(value * 100) / 100);
        }
        
        return curve;
    },
    
    // Setup
    handleSetup(e) {
        e.preventDefault();
        
        const startDate = document.getElementById('startDate').value;
        const startWeight = parseFloat(document.getElementById('startWeight').value);
        const targetWeight = parseFloat(document.getElementById('targetWeight').value);
        
        // Validation
        if (!startDate || !startWeight || !targetWeight) {
            this.showToast('Please fill all fields', 'error');
            return;
        }
        
        if (startWeight < 20 || startWeight > 500 || targetWeight < 20 || targetWeight > 500) {
            this.showToast('Weight must be between 20-500 kg', 'error');
            return;
        }
        
        if (targetWeight >= startWeight) {
            const confirmed = confirm('Target weight should be less than start weight. Proceed anyway?');
            if (!confirmed) return;
        }
        
        // Create program
        const actualWeights = {};
        for (let i = 1; i <= 12; i++) {
            actualWeights[i] = null;
        }
        
        this.program = {
            startDate,
            startWeight,
            targetWeight,
            generatedAt: new Date().toISOString(),
            curveParams: {
                type: 'exponential',
                a: this.DEFAULT_A
            },
            targetCurve: this.calculateExponentialCurve(startWeight, targetWeight),
            actualWeights,
            notes: ''
        };
        
        this.saveProgram();
        this.showDashboard();
        this.showToast('Program created successfully!', 'success');
        this.triggerConfetti();
    },
    
    // Dashboard
    showDashboard() {
        if (!this.program) return;
        
        document.getElementById('setupScreen').classList.add('hidden');
        document.getElementById('dashboardScreen').classList.remove('hidden');
        
        this.updateWeekSlider();
        this.updateStats();
        this.updateChart();
    },
    
    showSetup() {
        document.getElementById('dashboardScreen').classList.add('hidden');
        document.getElementById('setupScreen').classList.remove('hidden');
        
        // Set today's date as default
        document.getElementById('startDate').value = new Date().toISOString().split('T')[0];
    },
    
    updateWeekSlider() {
        const slider = document.getElementById('weekSlider');
        const currentWeekDisplay = document.getElementById('currentWeekDisplay');
        const entryWeekNumber = document.getElementById('entryWeekNumber');
        
        // Determine current week based on start date
        const startDate = new Date(this.program.startDate);
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
        
        this.currentWeek = Math.min(Math.max(diffWeeks, 1), 12);
        slider.value = this.currentWeek;
        currentWeekDisplay.textContent = `Week ${this.currentWeek}`;
        entryWeekNumber.textContent = this.currentWeek;
        
        // Check if this week has data
        const weeklyWeightInput = document.getElementById('weeklyWeight');
        if (this.program.actualWeights[this.currentWeek]) {
            weeklyWeightInput.value = this.program.actualWeights[this.currentWeek];
        } else {
            weeklyWeightInput.value = '';
        }
    },
    
    updateCurrentWeek(week) {
        this.currentWeek = week;
        document.getElementById('currentWeekDisplay').textContent = `Week ${week}`;
        document.getElementById('entryWeekNumber').textContent = week;
        
        const weeklyWeightInput = document.getElementById('weeklyWeight');
        if (this.program.actualWeights[week]) {
            weeklyWeightInput.value = this.program.actualWeights[week];
        } else {
            weeklyWeightInput.value = '';
        }
        
        this.updateStats();
    },
    
    // Weekly entry
    handleWeeklyEntry(e) {
        e.preventDefault();
        
        const weight = parseFloat(document.getElementById('weeklyWeight').value);
        
        if (!weight || weight < 20 || weight > 500) {
            this.showToast('Please enter a valid weight (20-500 kg)', 'error');
            return;
        }
        
        this.program.actualWeights[this.currentWeek] = weight;
        this.program.notes = `Updated week ${this.currentWeek} at ${new Date().toISOString()}`;
        this.saveProgram();
        
        this.updateStats();
        this.updateChart();
        
        const statusEl = document.getElementById('weeklyStatus');
        statusEl.textContent = `Week ${this.currentWeek} weight saved successfully!`;
        statusEl.className = 'status-message success show';
        
        setTimeout(() => {
            statusEl.classList.remove('show');
        }, 3000);
        
        this.showToast('Weight saved!', 'success');
        this.triggerConfetti();
    },
    
    // Statistics
    updateStats() {
        const startWeight = this.program.startWeight;
        const currentWeight = this.program.actualWeights[this.currentWeek];
        const targetThisWeek = this.program.targetCurve[this.currentWeek - 1];
        
        // Weekly target
        document.getElementById('weeklyTarget').textContent = 
            targetThisWeek ? `${targetThisWeek.toFixed(2)} kg` : '--';
        
        // Total lost
        if (currentWeight && currentWeight < startWeight) {
            const totalLost = startWeight - currentWeight;
            document.getElementById('totalLost').textContent = 
                `${totalLost.toFixed(2)} kg`;
        } else {
            document.getElementById('totalLost').textContent = '--';
        }
        
        // Average weekly loss
        const entries = Object.entries(this.program.actualWeights)
            .filter(([_, weight]) => weight !== null);
        
        if (entries.length > 1) {
            const totalLost = startWeight - entries[entries.length - 1][1];
            const avgWeekly = totalLost / (entries.length - 1);
            document.getElementById('avgWeekly').textContent = 
                `${avgWeekly.toFixed(2)} kg`;
        } else {
            document.getElementById('avgWeekly').textContent = '--';
        }
        
        // Progress percentage
        const totalTarget = startWeight - this.program.targetWeight;
        if (currentWeight && currentWeight < startWeight) {
            const currentLost = startWeight - currentWeight;
            const progress = (currentLost / totalTarget) * 100;
            document.getElementById('progressPercent').textContent = 
                `${Math.min(progress, 100).toFixed(1)}%`;
        } else {
            document.getElementById('progressPercent').textContent = '--';
        }
    },
    
    // Chart
    initializeChart() {
        const canvas = document.getElementById('progressChart');
        this.chartCtx = canvas.getContext('2d');
        
        // Set canvas size
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            this.updateChart();
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    },
    
    updateChart() {
        if (!this.chartCtx || !this.program) return;
        
        const ctx = this.chartCtx;
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate dimensions
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // Get weight range
        const allWeights = [...this.program.targetCurve, ...Object.values(this.program.actualWeights).filter(w => w !== null)];
        const minWeight = Math.min(...allWeights) - 2;
        const maxWeight = Math.max(...allWeights) + 2;
        
        // Helper functions
        const xForWeek = (week) => padding + (week - 1) * (chartWidth / 11);
        const yForWeight = (weight) => padding + (maxWeight - weight) * (chartHeight / (maxWeight - minWeight));
        
        // Draw grid
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let week = 1; week <= 12; week++) {
            const x = xForWeek(week);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + i * (chartHeight / 5);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }
        
        // Draw target curve
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(0.33, '#8b5cf6');
        gradient.addColorStop(0.66, '#ec4899');
        gradient.addColorStop(1, '#06b6d4');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        
        this.program.targetCurve.forEach((weight, index) => {
            const x = xForWeek(index + 1);
            const y = yForWeight(weight);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Draw actual weights
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        
        const actualEntries = Object.entries(this.program.actualWeights)
            .filter(([_, weight]) => weight !== null)
            .map(([week, weight]) => ({ week: parseInt(week), weight }));
        
        // Draw polyline for actual weights
        if (actualEntries.length > 0) {
            ctx.beginPath();
            actualEntries.forEach((entry, index) => {
                const x = xForWeek(entry.week);
                const y = yForWeight(entry.weight);
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            
            // Draw points
            actualEntries.forEach(entry => {
                const x = xForWeek(entry.week);
                const y = yForWeight(entry.weight);
                
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fill();
                
                // Add glow effect
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        }
        
        // Draw labels
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        
        // Week labels
        for (let week = 1; week <= 12; week++) {
            const x = xForWeek(week);
            ctx.fillText(`W${week}`, x, height - 10);
        }
        
        // Weight labels
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const weight = maxWeight - i * (maxWeight - minWeight) / 5;
            const y = padding + i * (chartHeight / 5);
            ctx.fillText(weight.toFixed(1), padding - 10, y + 4);
        }
        
        // Legend
        const legendY = 20;
        ctx.textAlign = 'left';
        ctx.font = '14px system-ui';
        
        // Target curve legend
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(padding, legendY);
        ctx.lineTo(padding + 30, legendY);
        ctx.stroke();
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        ctx.fillText('Target', padding + 40, legendY + 5);
        
        // Actual weights legend
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(padding + 120, legendY, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
        ctx.fillText('Actual', padding + 135, legendY + 5);
    },
    
    // Export/Import
    exportData() {
        if (!this.program) {
            this.showToast('No program to export', 'error');
            return;
        }
        
        const dataStr = JSON.stringify(this.program, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weight-loss-program-${this.program.startDate}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully!', 'success');
    },
    
    importData() {
        document.getElementById('fileInput').click();
    },
    
    handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                
                // Validate
                if (!this.validateProgram(imported)) {
                    this.showToast('Invalid program file', 'error');
                    return;
                }
                
                this.openModal(
                    'Import Program',
                    'This will replace your current program. Are you sure?',
                    () => {
                        this.program = imported;
                        this.saveProgram();
                        this.showDashboard();
                        this.showToast('Program imported successfully!', 'success');
                    }
                );
                
            } catch (err) {
                this.showToast('Error reading file', 'error');
            }
        };
        reader.readAsText(file);
    },
    
    validateProgram(program) {
        const required = ['startDate', 'startWeight', 'targetWeight', 'curveParams', 'targetCurve', 'actualWeights'];
        return required.every(field => field in program) &&
               Array.isArray(program.targetCurve) &&
               program.targetCurve.length === 12 &&
               typeof program.actualWeights === 'object';
    },
    
    // Sharing
    showShareSummary() {
        if (!this.program) {
            this.showToast('No program to share', 'error');
            return;
        }
        
        const entries = Object.entries(this.program.actualWeights)
            .filter(([_, weight]) => weight !== null);
        
        if (entries.length === 0) {
            this.showToast('No data to share yet', 'info');
            return;
        }
        
        const totalLost = this.program.startWeight - entries[entries.length - 1][1];
        const progress = (totalLost / (this.program.startWeight - this.program.targetWeight)) * 100;
        
        const summary = `🏆 My 12-Week Weight Loss Progress\n\n` +
                       `Started: ${new Date(this.program.startDate).toLocaleDateString()}\n` +
                       `Starting Weight: ${this.program.startWeight.toFixed(2)} kg\n` +
                       `Current Weight: ${entries[entries.length - 1][1].toFixed(2)} kg\n` +
                       `Total Lost: ${totalLost.toFixed(2)} kg\n` +
                       `Progress: ${Math.min(progress, 100).toFixed(1)}%\n` +
                       `Weeks Completed: ${entries.length}/12\n\n` +
                       `Generated by FitTrack Pro`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Weight Loss Progress',
                text: summary
            }).catch(() => {
                this.copyToClipboard(summary);
            });
        } else {
            this.copyToClipboard(summary);
        }
    },
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Summary copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy summary', 'error');
        });
    },
    
    // UI Helpers
    openModal(title, message, onConfirm) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        
        const confirmBtn = document.getElementById('modalConfirm');
        confirmBtn.onclick = () => {
            onConfirm();
            this.closeModal();
        };
        
        document.getElementById('confirmModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    },
    
    closeModal() {
        document.getElementById('confirmModal').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    },
    
    openSidebar() {
        document.getElementById('sidebar').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    },
    
    closeSidebar() {
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    },
    
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    triggerConfetti() {
        // Simple confetti effect
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '500';
            
            document.body.appendChild(confetti);
            
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 2000 + 1000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            animation.onfinish = () => confetti.remove();
        }
    },
    
    showWeeklyEntry() {
        this.closeSidebar();
        document.getElementById('weekSlider').scrollIntoView({ behavior: 'smooth' });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});