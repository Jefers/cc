document.getElementById('steps-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const steps = parseInt(document.getElementById('steps').value, 10);
    const weight = parseFloat(document.getElementById('weight').value);
    const weightUnit = document.getElementById('weight-unit').value;
    
    let weightKg = weight;
    if (weightUnit === 'lbs') {
        weightKg = weight * 0.453592;
    }
    
    const caloriesBurned = steps * weightKg * 0.00075; /* This is more realistic than before   */
    
    document.getElementById('steps-result').textContent = `Estimated calories burned: ${caloriesBurned.toFixed(1)} kcal.`;
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
