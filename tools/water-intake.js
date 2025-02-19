document.getElementById('water-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const weight = parseFloat(document.getElementById('weight').value);
    const weightUnit = document.getElementById('weight-unit').value;
    
    let weightKg = weight;
    if (weightUnit === 'lbs') {
        weightKg = weight * 0.453592;
    }
    
    const waterLiters = weightKg * 0.033;
    
    document.getElementById('water-result').innerHTML = `<div class="water-icon"></div>Recommended daily water intake: ${waterLiters.toFixed(2)} L`;
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
