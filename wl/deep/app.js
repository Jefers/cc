// Weight Loss Tracker App
// Main Application JavaScript

// App State
const APP_STATE = {
    program: null,
    currentWeek: 1,
    theme: 'dark',
    pendingAction: null
};

// Unique storage key to prevent conflicts
const STORAGE_KEY = 'fitTrack_weightProgram_v1';

// DOM Elements
const DOM = {
    // Screens
    setupScreen: document.getElementById('setupScreen'),
    dashboardScreen: document.getElementById('dashboardScreen'),
    
    // Setup Form
    setupForm: document.getElementById('setupForm'),
    startDateInput: document.getElementById('startDate'),
    startWeightInput: document.getElementById('startWeight'),
    targetWeightInput: document.getElementById('targetWeight'),
    
    // Dashboard Elements
    startDateDisplay: document.getElementById('startDateDisplay'),
    startWeightDisplay: document.getElementById('startWeightDisplay'),
    targetWeightDisplay: document.getElementById('targetWeightDisplay'),
    weekSelect: document.getElementById('weekSelect'),
    currentWeekDisplay: document.getElementById('currentWeek'),
    weeklyWeightInput: document.getElementById('weeklyWeight'),
    weekTargetWeightDisplay: document.getElementById('weekTargetWeight'),
    weekExpectedLossDisplay: document.getElementById('weekExpectedLoss'),
    saveWeightBtn: document.getElementById('saveWeightBtn'),
    
    // Stats Elements
    totalLostStat: document.getElementById('totalLostStat'),
    avgWeeklyLossStat: document.getElementById('avgWeeklyLossStat'),
    progressPercentStat: document.getElementById('progressPercentStat'),
    currentWeekStat: document.getElementById('currentWeekStat'),
    progressBarFill: document.getElementById('progressBarFill'),
    progressBarPercent: document.getElementById('progressBarPercent'),
    
    // Notes
    journeyNotes: document.getElementById('journeyNotes'),
    saveNotesBtn: document.getElementById('saveNotesBtn'),
    
    // Chart
    progressChart: document.getElementById('progressChart'),
    chartTooltip: document.getElementById('chartTooltip'),
    
    // Sidebar & Theme
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebarClose: document.getElementById('sidebarClose'),
    themeToggle: document.getElementById('themeToggle'),
    
    // Modals
    modalOverlay: document.getElementById('modalOverlay'),
    importModal: document.getElementById('importModal'),
    importModalClose: document.getElementById('importModalClose'),
    importDataTextarea: document.getElementById('importDataTextarea'),
    cancelImportBtn: document.getElementById('cancelImportBtn'),
    confirmImportBtn: document.getElementById('confirmImportBtn'),
    
    shareModal: document.getElementById('shareModal'),
    shareModalClose: document.getElementById('shareModalClose'),
    shareSummaryContent: document.getElementById('shareSummaryContent'),
    copySummaryBtn: document.getElementById('copySummaryBtn'),
    closeShareBtn: document.getElementById('closeShareBtn'),
    
    confirmationModal: document.getElementById('confirmationModal'),
    confirmationModalClose: document.getElementById('confirmationModalClose'),
    confirmationMessage: document.getElementById('confirmationMessage'),
    cancelConfirmBtn: document.getElementById('cancelConfirmBtn'),
    confirmActionBtn: document.getElementById('confirmActionBtn'),
    
    // Buttons
    exportDataBtn: document.getElementById('exportDataBtn'),
    importDataBtn: document.getElementById('importDataBtn'),
    shareSummaryBtn: document.getElementById('shareSummaryBtn'),
    resetProgramBtn: document.getElementById('resetProgramBtn'),
    
    // Toast & Confetti
    toastContainer: document.getElementById('toastContainer'),
    confettiContainer: document.getElementById('confettiContainer')
};

// Initialize the application
function init() {
    // Set today's date as default start date
    const today = new Date().toISOString().split('T')[0];
    DOM.startDateInput.value = today;
    DOM.startDateInput.min = today;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('fitTrack_theme') || 'dark';
    setTheme(savedTheme);
    
    // Load program from localStorage
    loadProgram();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize chart
    initChart();
}

// Load program from localStorage
function loadProgram() {
    const programData = localStorage.getItem(STORAGE_KEY);
    
    if (programData) {
        try {
            APP_STATE.program = JSON.parse(programData);
            // Calculate current week based on start date
            APP_STATE.currentWeek = calculateCurrentWeek();
            showDashboard();
        } catch (error) {
            console.error('Error parsing program data:', error);
            showToast('Error loading saved data. Starting fresh.', 'error');
            showSetup();
        }
    } else {
        showSetup();
    }
}

// Save program to localStorage
function saveProgram() {
    if (APP_STATE.program) {
        APP_STATE.program.generatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(APP_STATE.program));
    }
}

// Generate exponential decay weight curve
function generateTargetCurve(startWeight, targetWeight, a = 0.35) {
    const curve = [];
    const S = startWeight;
    const T = targetWeight;
    
    // Pre-calculate E(12) for normalization
    const E12 = Math.exp(-a * 12);
    
    for (let t = 1; t <= 12; t++) {
        const Et = Math.exp(-a * t);
        // Normalized formula so week 12 equals target weight
        const weight = T + (S - T) * (Et - E12) / (1 - E12);
        curve.push(roundKg(weight));
    }
    
    return curve;
}

// Setup event listeners
function setupEventListeners() {
    // Setup form
    DOM.setupForm.addEventListener('submit', handleSetupSubmit);
    
    // Weight input validation
    DOM.startWeightInput.addEventListener('change', validateWeightInputs);
    DOM.targetWeightInput.addEventListener('change', validateWeightInputs);
    
    // Dashboard interactions
    DOM.weekSelect.addEventListener('change', handleWeekSelectChange);
    DOM.saveWeightBtn.addEventListener('click', handleSaveWeight);
    DOM.saveNotesBtn.addEventListener('click', handleSaveNotes);
    
    // Sidebar & theme
    DOM.sidebarToggle.addEventListener('click', () => toggleSidebar(true));
    DOM.sidebarClose.addEventListener('click', () => toggleSidebar(false));
    DOM.themeToggle.addEventListener('click', toggleTheme);
    
    // Modal controls
    DOM.importDataBtn.addEventListener('click', () => showModal('import'));
    DOM.importModalClose.addEventListener('click', () => hideModal('import'));
    DOM.cancelImportBtn.addEventListener('click', () => hideModal('import'));
    DOM.confirmImportBtn.addEventListener('click', handleImportData);
    
    DOM.exportDataBtn.addEventListener('click', handleExportData);
    DOM.shareSummaryBtn.addEventListener('click', () => showModal('share'));
    DOM.shareModalClose.addEventListener('click', () => hideModal('share'));
    DOM.closeShareBtn.addEventListener('click', () => hideModal('share'));
    DOM.copySummaryBtn.addEventListener('click', handleCopySummary);
    
    // Reset program button - SIMPLE AND RELIABLE
    DOM.resetProgramBtn.addEventListener('click', handleResetProgram);
    
    // Confirmation modal
    DOM.confirmationModalClose.addEventListener('click', () => hideModal('confirmation'));
    DOM.cancelConfirmBtn.addEventListener('click', () => hideModal('confirmation'));
    DOM.confirmActionBtn.addEventListener('click', handleConfirmAction);
    
    // Close modals on overlay click
    DOM.modalOverlay.addEventListener('click', () => {
        hideModal('import');
        hideModal('share');
        hideModal('confirmation');
    });
    
    // Handle keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal('import');
            hideModal('share');
            hideModal('confirmation');
            toggleSidebar(false);
        }
    });
}

// Show setup screen
function showSetup() {
    DOM.setupScreen.classList.remove('hidden');
    DOM.dashboardScreen.classList.add('hidden');
    toggleSidebar(false);
}

// Show dashboard screen
function showDashboard() {
    DOM.setupScreen.classList.add('hidden');
    DOM.dashboardScreen.classList.remove('hidden');
    
    // Update dashboard with program data
    updateDashboard();
    
    // Update chart
    updateChart();
    
    // Update stats
    updateStats();
}

// Handle setup form submission
function handleSetupSubmit(e) {
    e.preventDefault();
    
    const startDate = DOM.startDateInput.value;
    const startWeight = parseFloat(DOM.startWeightInput.value);
    const targetWeight = parseFloat(DOM.targetWeightInput.value);
    
    // Validate inputs
    if (!validateWeightInputs()) {
        return; // Stop if validation fails
    }
    
    // Create program object
    APP_STATE.program = {
        startDate,
        startWeight: roundKg(startWeight),
        targetWeight: roundKg(targetWeight),
        generatedAt: new Date().toISOString(),
        curveParams: {
            type: 'exponential',
            a: 0.35
        },
        targetCurve: [],
        actualWeights: {},
        notes: ''
    };
    
    // Generate target curve
    APP_STATE.program.targetCurve = generateTargetCurve(
        APP_STATE.program.startWeight,
        APP_STATE.program.targetWeight,
        APP_STATE.program.curveParams.a
    );
    
    // Initialize actual weights object
    for (let i = 1; i <= 12; i++) {
        APP_STATE.program.actualWeights[i] = null;
    }
    
    // Calculate current week based on start date
    APP_STATE.currentWeek = calculateCurrentWeek();
    
    // Save and show dashboard
    saveProgram();
    showDashboard();
    showToast('Weight loss program created successfully!', 'success');
    triggerConfetti();
}

// Calculate current week based on start date
function calculateCurrentWeek() {
    if (!APP_STATE.program) return 1;
    
    const startDate = new Date(APP_STATE.program.startDate);
    const today = new Date();
    
    // Calculate days difference
    const diffTime = today - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If start date is in the future, return week 1
    if (diffDays < 0) return 1;
    
    const weeks = Math.floor(diffDays / 7) + 1; // Week 1 starts immediately
    
    // Clamp between 1 and 12
    return Math.max(1, Math.min(12, weeks));
}

// Validate weight inputs
function validateWeightInputs() {
    const startWeight = parseFloat(DOM.startWeightInput.value);
    const targetWeight = parseFloat(DOM.targetWeightInput.value);
    
    let isValid = true;
    
    // Validate start weight
    if (isNaN(startWeight) || startWeight < 20 || startWeight > 500) {
        DOM.startWeightInput.style.borderColor = '#ef4444';
        showToast('Start weight must be between 20-500 kg', 'error');
        isValid = false;
    } else {
        DOM.startWeightInput.style.borderColor = '';
    }
    
    // Validate target weight
    if (isNaN(targetWeight) || targetWeight < 20 || targetWeight > 500) {
        DOM.targetWeightInput.style.borderColor = '#ef4444';
        showToast('Target weight must be between 20-500 kg', 'error');
        isValid = false;
    } else {
        DOM.targetWeightInput.style.borderColor = '';
    }
    
    // Validate that target weight is less than start weight
    if (isValid && targetWeight >= startWeight) {
        DOM.targetWeightInput.style.borderColor = '#ef4444';
        const confirmMsg = 'Target weight is not less than start weight. Are you sure you want to continue?';
        
        // Use our confirmation modal instead of native confirm
        APP_STATE.pendingAction = {
            type: 'overrideWeightValidation'
        };
        
        showConfirmation(confirmMsg, 'overrideWeightValidation');
        return false; // Wait for user confirmation
    }
    
    return isValid;
}

// Update dashboard with program data
function updateDashboard() {
    if (!APP_STATE.program) return;
    
    // Format date for display
    const startDate = new Date(APP_STATE.program.startDate);
    const formattedDate = startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update program info
    DOM.startDateDisplay.textContent = formattedDate;
    DOM.startWeightDisplay.textContent = APP_STATE.program.startWeight;
    DOM.targetWeightDisplay.textContent = APP_STATE.program.targetWeight;
    
    // Update week selector
    updateWeekSelector();
    
    // Update current week display
    updateCurrentWeekDisplay();
    
    // Update notes
    DOM.journeyNotes.value = APP_STATE.program.notes || '';
}

// Update week selector dropdown
function updateWeekSelector() {
    DOM.weekSelect.innerHTML = '';
    
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Week ${i}`;
        if (i === APP_STATE.currentWeek) {
            option.selected = true;
        }
        DOM.weekSelect.appendChild(option);
    }
}

// Update current week display
function updateCurrentWeekDisplay() {
    DOM.currentWeekDisplay.textContent = APP_STATE.currentWeek;
    DOM.currentWeekStat.textContent = `${APP_STATE.currentWeek} / 12`;
    
    // Update weekly weight input
    const currentWeight = APP_STATE.program.actualWeights[APP_STATE.currentWeek];
    DOM.weeklyWeightInput.value = currentWeight || '';
    
    // Update week target and expected loss
    const weekTarget = APP_STATE.program.targetCurve[APP_STATE.currentWeek - 1];
    DOM.weekTargetWeightDisplay.textContent = weekTarget;
    
    // Calculate expected loss
    let expectedLoss = 0;
    if (APP_STATE.currentWeek === 1) {
        expectedLoss = APP_STATE.program.startWeight - weekTarget;
    } else {
        const prevWeekTarget = APP_STATE.program.targetCurve[APP_STATE.currentWeek - 2];
        expectedLoss = prevWeekTarget - weekTarget;
    }
    
    DOM.weekExpectedLossDisplay.textContent = roundKg(expectedLoss);
}

// Handle week selection change
function handleWeekSelectChange() {
    APP_STATE.currentWeek = parseInt(DOM.weekSelect.value);
    updateCurrentWeekDisplay();
}

// Handle saving weekly weight
function handleSaveWeight() {
    if (!APP_STATE.program) return;
    
    const weightInput = DOM.weeklyWeightInput.value.trim();
    
    if (!weightInput) {
        showToast('Please enter a weight value', 'error');
        return;
    }
    
    const weight = parseFloat(weightInput);
    
    if (isNaN(weight) || weight < 20 || weight > 500) {
        showToast('Weight must be between 20-500 kg', 'error');
        return;
    }
    
    // Save weight
    APP_STATE.program.actualWeights[APP_STATE.currentWeek] = roundKg(weight);
    
    // Save program
    saveProgram();
    
    // Update UI
    updateChart();
    updateStats();
    
    // Show success message
    showToast(`Week ${APP_STATE.currentWeek} weight saved successfully!`, 'success');
    
    // Trigger confetti if this is a milestone
    if (APP_STATE.currentWeek === 12 || 
        (APP_STATE.currentWeek > 1 && !APP_STATE.program.actualWeights[APP_STATE.currentWeek - 1])) {
        triggerConfetti();
    }
    
    // Move to next week if available
    if (APP_STATE.currentWeek < 12) {
        APP_STATE.currentWeek++;
        DOM.weekSelect.value = APP_STATE.currentWeek;
        updateCurrentWeekDisplay();
    }
}

// Handle saving notes
function handleSaveNotes() {
    if (!APP_STATE.program) return;
    
    APP_STATE.program.notes = DOM.journeyNotes.value;
    saveProgram();
    showToast('Notes saved successfully!', 'success');
}

// Update statistics
function updateStats() {
    if (!APP_STATE.program) return;
    
    const startWeight = APP_STATE.program.startWeight;
    const targetWeight = APP_STATE.program.targetWeight;
    
    // Calculate total lost based on actual weights
    let latestActualWeight = startWeight;
    let weeksWithData = 0;
    let totalLost = 0;
    
    // Find the latest week with actual weight data
    for (let week = 12; week >= 1; week--) {
        if (APP_STATE.program.actualWeights[week] !== null) {
            latestActualWeight = APP_STATE.program.actualWeights[week];
            weeksWithData = week;
            break;
        }
    }
    
    // Calculate total lost
    totalLost = startWeight - latestActualWeight;
    
    // Calculate average weekly loss
    let avgWeeklyLoss = 0;
    if (weeksWithData > 0) {
        avgWeeklyLoss = totalLost / weeksWithData;
    }
    
    // Calculate progress percentage (based on target weight)
    const totalToLose = startWeight - targetWeight;
    const progressPercent = totalToLose > 0 ? Math.min(100, (totalLost / totalToLose) * 100) : 0;
    
    // Update stats display
    DOM.totalLostStat.textContent = `${roundKg(totalLost)} kg`;
    DOM.avgWeeklyLossStat.textContent = `${roundKg(avgWeeklyLoss)} kg`;
    DOM.progressPercentStat.textContent = `${roundKg(progressPercent)}%`;
    
    // Update progress bar
    DOM.progressBarFill.style.width = `${progressPercent}%`;
    DOM.progressBarPercent.textContent = `${roundKg(progressPercent)}%`;
}

// Initialize chart
function initChart() {
    // Canvas is initialized in updateChart
    if (APP_STATE.program) {
        updateChart();
    }
}

// Update chart with data
function updateChart() {
    if (!APP_STATE.program) return;
    
    const ctx = DOM.progressChart.getContext('2d');
    const width = DOM.progressChart.width;
    const height = DOM.progressChart.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart dimensions with padding
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Get data
    const targetData = APP_STATE.program.targetCurve;
    const actualData = [];
    
    for (let i = 1; i <= 12; i++) {
        actualData.push(APP_STATE.program.actualWeights[i]);
    }
    
    // Find min and max values for Y-axis
    const allValues = [APP_STATE.program.startWeight, ...targetData, ...actualData.filter(w => w !== null)];
    const minWeight = Math.min(...allValues);
    const maxWeight = Math.max(...allValues);
    
    // Add some padding to Y-axis
    const yMin = minWeight - 2;
    const yMax = maxWeight + 2;
    const yRange = yMax - yMin;
    
    // Helper function to convert data point to chart coordinates
    const toChartX = (weekIndex) => {
        return padding.left + (weekIndex / 11) * chartWidth;
    };
    
    const toChartY = (weight) => {
        return padding.top + chartHeight - ((weight - yMin) / yRange) * chartHeight;
    };
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Horizontal grid lines
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const y = padding.top + (i / ySteps) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        
        // Y-axis labels
        const weight = yMax - (i / ySteps) * yRange;
        ctx.fillStyle = 'var(--secondary-text)';
        ctx.font = '12px var(--font-family)';
        ctx.textAlign = 'right';
        ctx.fillText(roundKg(weight) + ' kg', padding.left - 10, y + 4);
    }
    
    // Vertical grid lines
    for (let i = 0; i < 12; i++) {
        const x = padding.left + (i / 11) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
        
        // X-axis labels (week numbers)
        ctx.fillStyle = 'var(--secondary-text)';
        ctx.font = '12px var(--font-family)';
        ctx.textAlign = 'center';
        ctx.fillText(`Week ${i + 1}`, x, height - padding.bottom + 20);
    }
    
    ctx.setLineDash([]);
    
    // Draw target curve with gradient
    ctx.beginPath();
    ctx.moveTo(toChartX(0), toChartY(APP_STATE.program.startWeight));
    
    for (let i = 0; i < targetData.length; i++) {
        const x = toChartX(i + 1);
        const y = toChartY(targetData[i]);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    // Create gradient for target curve
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Add glow effect to target curve
    ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Draw actual data points and line
    ctx.beginPath();
    let hasActualData = false;
    
    for (let i = 0; i < actualData.length; i++) {
        if (actualData[i] !== null) {
            const x = toChartX(i + 1);
            const y = toChartY(actualData[i]);
            
            if (!hasActualData) {
                ctx.moveTo(x, y);
                hasActualData = true;
            } else {
                ctx.lineTo(x, y);
            }
        }
    }
    
    if (hasActualData) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw actual data points
        for (let i = 0; i < actualData.length; i++) {
            if (actualData[i] !== null) {
                const x = toChartX(i + 1);
                const y = toChartY(actualData[i]);
                
                // Draw point
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#06b6d4';
                ctx.fill();
                
                // Draw white border
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }
    
    // Draw starting point
    ctx.beginPath();
    ctx.arc(toChartX(0), toChartY(APP_STATE.program.startWeight), 8, 0, Math.PI * 2);
    ctx.fillStyle = '#6366f1';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add chart title
    ctx.fillStyle = 'var(--primary-text)';
    ctx.font = 'bold 16px var(--font-family)';
    ctx.textAlign = 'center';
    ctx.fillText('Weight Loss Progress', width / 2, padding.top - 10);
    
    // Setup chart interaction
    setupChartInteractions(ctx, toChartX, toChartY, targetData, actualData, padding);
}

// Setup chart interactions (tooltip)
function setupChartInteractions(ctx, toChartX, toChartY, targetData, actualData, padding) {
    const canvas = DOM.progressChart;
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find closest week
        let closestWeek = -1;
        let minDistance = Infinity;
        
        for (let week = 0; week <= 12; week++) {
            const chartX = toChartX(week);
            const distance = Math.abs(x - chartX);
            
            if (distance < minDistance && distance < 30) {
                minDistance = distance;
                closestWeek = week;
            }
        }
        
        if (closestWeek >= 0) {
            // Get weight values for this week
            let targetWeight = null;
            let actualWeight = null;
            
            if (closestWeek === 0) {
                targetWeight = APP_STATE.program.startWeight;
            } else {
                targetWeight = targetData[closestWeek - 1];
                actualWeight = actualData[closestWeek - 1];
            }
            
            // Show tooltip
            showChartTooltip(x, y, closestWeek, targetWeight, actualWeight);
        } else {
            // Hide tooltip
            DOM.chartTooltip.style.opacity = '0';
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        DOM.chartTooltip.style.opacity = '0';
    });
}

// Show chart tooltip
function showChartTooltip(x, y, week, targetWeight, actualWeight) {
    const tooltip = DOM.chartTooltip;
    const canvas = DOM.progressChart;
    const rect = canvas.getBoundingClientRect();
    
    let tooltipHTML = '';
    
    if (week === 0) {
        tooltipHTML = `
            <div class="tooltip-week">Starting Weight</div>
            <div class="tooltip-weight"><strong>${targetWeight} kg</strong></div>
        `;
    } else {
        tooltipHTML = `
            <div class="tooltip-week">Week ${week}</div>
            <div class="tooltip-target">Target: <strong>${targetWeight} kg</strong></div>
        `;
        
        if (actualWeight !== null) {
            tooltipHTML += `
                <div class="tooltip-actual">Actual: <strong>${actualWeight} kg</strong></div>
            `;
            
            const difference = targetWeight - actualWeight;
            if (difference > 0) {
                tooltipHTML += `
                    <div class="tooltip-difference positive">Ahead by ${roundKg(Math.abs(difference))} kg</div>
                `;
            } else if (difference < 0) {
                tooltipHTML += `
                    <div class="tooltip-difference negative">Behind by ${roundKg(Math.abs(difference))} kg</div>
                `;
            } else {
                tooltipHTML += `
                    <div class="tooltip-difference">On target!</div>
                `;
            }
        } else {
            tooltipHTML += `
                <div class="tooltip-actual">Actual: <em>Not recorded</em></div>
            `;
        }
    }
    
    tooltip.innerHTML = tooltipHTML;
    tooltip.style.opacity = '1';
    
    // Position tooltip (avoid going off screen)
    let tooltipX = x + 10;
    let tooltipY = y + 10;
    
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    
    if (tooltipX + tooltipWidth > rect.width) {
        tooltipX = x - tooltipWidth - 10;
    }
    
    if (tooltipY + tooltipHeight > rect.height) {
        tooltipY = y - tooltipHeight - 10;
    }
    
    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${tooltipY}px`;
}

// Theme functions
function setTheme(theme) {
    APP_STATE.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fitTrack_theme', theme);
    
    // Update theme toggle icon
    const icon = DOM.themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function toggleTheme() {
    const newTheme = APP_STATE.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Sidebar functions
function toggleSidebar(open) {
    if (open) {
        DOM.sidebar.classList.add('open');
        DOM.modalOverlay.classList.add('active');
    } else {
        DOM.sidebar.classList.remove('open');
        DOM.modalOverlay.classList.remove('active');
    }
}

// Modal functions
function showModal(modalType) {
    hideAllModals();
    
    switch (modalType) {
        case 'import':
            DOM.importModal.classList.add('active');
            DOM.importDataTextarea.value = '';
            break;
        case 'share':
            DOM.shareModal.classList.add('active');
            updateShareSummary();
            break;
        case 'confirmation':
            DOM.confirmationModal.classList.add('active');
            break;
    }
    
    DOM.modalOverlay.classList.add('active');
}

function hideModal(modalType) {
    switch (modalType) {
        case 'import':
            DOM.importModal.classList.remove('active');
            break;
        case 'share':
            DOM.shareModal.classList.remove('active');
            break;
        case 'confirmation':
            DOM.confirmationModal.classList.remove('active');
            break;
    }
    
    // Hide overlay if no modals are open
    if (!DOM.importModal.classList.contains('active') &&
        !DOM.shareModal.classList.contains('active') &&
        !DOM.confirmationModal.classList.contains('active')) {
        DOM.modalOverlay.classList.remove('active');
    }
}

function hideAllModals() {
    DOM.importModal.classList.remove('active');
    DOM.shareModal.classList.remove('active');
    DOM.confirmationModal.classList.remove('active');
    DOM.modalOverlay.classList.remove('active');
}

// Show confirmation dialog
function showConfirmation(message, actionType) {
    DOM.confirmationMessage.textContent = message;
    DOM.confirmActionBtn.dataset.action = actionType;
    showModal('confirmation');
}

// Handle export data
function handleExportData() {
    if (!APP_STATE.program) {
        showToast('No program data to export', 'error');
        return;
    }
    
    const exportData = {
        ...APP_STATE.program,
        exportDate: new Date().toISOString(),
        exportVersion: '1.0',
        storageKey: STORAGE_KEY
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fitTrack-program-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Program data exported successfully!', 'success');
    toggleSidebar(false);
}

// Handle import data
function handleImportData() {
    const importText = DOM.importDataTextarea.value.trim();
    
    if (!importText) {
        showToast('Please paste program data to import', 'error');
        return;
    }
    
    try {
        const importedData = JSON.parse(importText);
        
        // Validate imported data structure
        if (!isValidProgramData(importedData)) {
            showToast('Invalid program data format', 'error');
            return;
        }
        
        // Ask for confirmation before replacing existing data
        APP_STATE.pendingAction = {
            type: 'import',
            data: importedData
        };
        
        showConfirmation(
            'This will replace your current program. Are you sure you want to continue?',
            'import'
        );
        
    } catch (error) {
        showToast('Error parsing JSON data: ' + error.message, 'error');
    }
}

// Validate imported program data
function isValidProgramData(data) {
    const requiredFields = [
        'startDate', 'startWeight', 'targetWeight',
        'targetCurve', 'actualWeights'
    ];
    
    for (const field of requiredFields) {
        if (!data.hasOwnProperty(field)) {
            return false;
        }
    }
    
    // Check data types
    if (typeof data.startWeight !== 'number' || 
        typeof data.targetWeight !== 'number' ||
        !Array.isArray(data.targetCurve) ||
        data.targetCurve.length !== 12 ||
        typeof data.actualWeights !== 'object') {
        return false;
    }
    
    return true;
}

// Handle reset program - SIMPLE AND RELIABLE
function handleResetProgram() {
    // Show confirmation using browser's native confirm for reliability
    const userConfirmed = confirm('⚠️ WARNING: This will delete ALL your progress data.\n\nThis action cannot be undone.\n\nAre you absolutely sure you want to reset?');
    
    if (userConfirmed) {
        // Clear the program from localStorage
        localStorage.removeItem(STORAGE_KEY);
        
        // Also remove any old keys that might exist
        localStorage.removeItem('weightProgram_v1');
        
        // Show immediate feedback
        showToast('Program reset successfully! Refreshing...', 'success');
        
        // Force page reload after a short delay
        setTimeout(() => {
            location.reload();
        }, 1500);
    } else {
        showToast('Reset cancelled', 'info');
    }
    
    // Close sidebar if open
    toggleSidebar(false);
}

// Handle confirmed action
function handleConfirmAction() {
    const actionType = DOM.confirmActionBtn.dataset.action;
    
    switch (actionType) {
        case 'import':
            APP_STATE.program = APP_STATE.pendingAction.data;
            saveProgram();
            showDashboard();
            showToast('Program data imported successfully!', 'success');
            triggerConfetti();
            break;
            
        case 'overrideWeightValidation':
            // User confirmed they want target >= start weight
            if (DOM.targetWeightInput) {
                DOM.targetWeightInput.style.borderColor = '';
            }
            // Now submit the form programmatically
            if (DOM.setupForm) {
                DOM.setupForm.dispatchEvent(new Event('submit', { bubbles: true }));
            }
            break;
    }
    
    hideModal('confirmation');
    toggleSidebar(false);
}

// Update share summary
function updateShareSummary() {
    if (!APP_STATE.program) return;
    
    const startWeight = APP_STATE.program.startWeight;
    const targetWeight = APP_STATE.program.targetWeight;
    
    // Calculate stats for sharing
    let latestWeight = startWeight;
    let weeksCompleted = 0;
    let totalLost = 0;
    
    for (let week = 12; week >= 1; week--) {
        if (APP_STATE.program.actualWeights[week] !== null) {
            latestWeight = APP_STATE.program.actualWeights[week];
            weeksCompleted = week;
            break;
        }
    }
    
    totalLost = startWeight - latestWeight;
    const progressPercent = Math.round((totalLost / (startWeight - targetWeight)) * 100);
    
    // Format date
    const startDate = new Date(APP_STATE.program.startDate);
    const formattedDate = startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    // Create share summary HTML
    DOM.shareSummaryContent.innerHTML = `
        <div class="share-header">
            <h4>My Weight Loss Journey</h4>
            <p>Started on ${formattedDate}</p>
        </div>
        
        <div class="share-stats">
            <div class="share-stat">
                <span class="share-stat-label">Starting Weight</span>
                <span class="share-stat-value">${startWeight} kg</span>
            </div>
            <div class="share-stat">
                <span class="share-stat-label">Current Weight</span>
                <span class="share-stat-value">${latestWeight} kg</span>
            </div>
            <div class="share-stat">
                <span class="share-stat-label">Target Weight</span>
                <span class="share-stat-value">${targetWeight} kg</span>
            </div>
            <div class="share-stat highlight">
                <span class="share-stat-label">Total Lost</span>
                <span class="share-stat-value">${roundKg(totalLost)} kg</span>
            </div>
        </div>
        
        <div class="share-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="progress-text">${progressPercent}% to goal</div>
        </div>
        
        <div class="share-weeks">
            <p><strong>${weeksCompleted} of 12 weeks completed</strong></p>
            <p>Tracking with FitTrack - 12 Week Weight Loss Journey</p>
        </div>
    `;
}

// Handle copy summary to clipboard
function handleCopySummary() {
    if (!APP_STATE.program) return;
    
    const startWeight = APP_STATE.program.startWeight;
    const targetWeight = APP_STATE.program.targetWeight;
    
    // Calculate stats
    let latestWeight = startWeight;
    let weeksCompleted = 0;
    let totalLost = 0;
    
    for (let week = 12; week >= 1; week--) {
        if (APP_STATE.program.actualWeights[week] !== null) {
            latestWeight = APP_STATE.program.actualWeights[week];
            weeksCompleted = week;
            break;
        }
    }
    
    totalLost = startWeight - latestWeight;
    const progressPercent = Math.round((totalLost / (startWeight - targetWeight)) * 100);
    
    // Format date
    const startDate = new Date(APP_STATE.program.startDate);
    const formattedDate = startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    // Create share text
    const shareText = `My Weight Loss Journey with FitTrack 🏋️

Started: ${formattedDate}
Starting Weight: ${startWeight} kg
Current Weight: ${latestWeight} kg
Target Weight: ${targetWeight} kg
Total Lost: ${roundKg(totalLost)} kg
Progress: ${progressPercent}% to goal
Weeks Completed: ${weeksCompleted}/12

Tracked with FitTrack - 12 Week Weight Loss Journey`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareText)
        .then(() => {
            showToast('Summary copied to clipboard!', 'success');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            showToast('Failed to copy to clipboard', 'error');
        });
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Confetti effect
function triggerConfetti() {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981'];
    const container = DOM.confettiContainer;
    
    // Clear existing confetti
    container.innerHTML = '';
    
    // Create confetti particles
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random properties
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const startX = Math.random() * 100;
        const endX = startX + Math.random() * 40 - 20;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 0.5;
        
        // Apply styles
        confetti.style.left = `${startX}%`;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        
        // Animation
        confetti.style.animation = `
            confettiFall ${duration}s ease-in ${delay}s forwards
        `;
        
        // Create style element for keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confettiFall {
                0% {
                    opacity: 1;
                    transform: translateY(-100px) rotate(0deg);
                }
                100% {
                    opacity: 0;
                    transform: translateY(100vh) rotate(${Math.random() * 360}deg);
                    left: ${endX}%;
                }
            }
        `;
        
        container.appendChild(confetti);
        container.appendChild(style);
        
        // Remove confetti after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, (duration + delay) * 1000);
    }
}

// Utility functions
function roundKg(value) {
    return Math.round(value * 100) / 100;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);