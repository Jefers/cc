document.getElementById('vo2-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const walkTime = parseFloat(document.getElementById('walkTime').value);
    const heartRate = parseFloat(document.getElementById('heartRate').value);
    if (isNaN(walkTime) || isNaN(heartRate)) {
        document.getElementById('vo2-result').textContent = 'Please enter valid numbers.';
        return;
    }
    // Simplified calculation for demo purposes
    const vo2max = 132.853 - (0.0769 * walkTime * 60) - (0.3877 * heartRate) + 6.315 - (3.2649 * walkTime) - (0.1565 * walkTime);
    let category = "";
    if (vo2max < 20) { category = "Poor"; }
    else if (vo2max < 35) { category = "Average"; }
    else { category = "Excellent"; }
    document.getElementById('vo2-result').innerHTML = `<div class="badge">VO₂ Max: ${vo2max.toFixed(1)} ml/kg/min (${category})</div>`;
});

document.getElementById('toggle-citation').addEventListener('click', function() {
    const citation = document.getElementById('citation');
    if (citation.style.display === 'none' || citation.style.display === '') {
        citation.style.display = 'block';
        this.textContent = 'Hide Citation';
    } else {
        citation.style.display = 'none';
        this.textContent = 'Show Citation';
    }
});
