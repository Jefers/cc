// script.js

// Export all localStorage data to a JSON file
function exportAllData() {
    const data = {};
    const keys = [
        'manilaHotel', 'boholHotel', 'cebuHotel', 'elNidoHotel', 'coronHotel', 'manilaFinalHotel', // Hotels
        'dublinManila', 'manilaBohol', 'boholCebu', 'cebuElNido', 'coronManila', // Flights
        'budget' // Budget (add more keys if needed)
    ];
    keys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) data[key] = JSON.parse(item);
    });
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'travel-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Import data from a JSON file
function importAllData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            for (const key in data) {
                localStorage.setItem(key, JSON.stringify(data[key]));
            }
            alert('Data imported successfully!');
            location.reload(); // Refresh the page to show the imported data
        } catch (error) {
            alert('Invalid JSON file.');
        }
    };
    reader.readAsText(file);
}