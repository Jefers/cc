document.getElementById('wthr-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const waist = parseFloat(document.getElementById('waist').value);
    const waistUnit = document.getElementById('waist-unit').value;
    const height = parseFloat(document.getElementById('height').value);
    const heightUnit = document.getElementById('height-unit').value;
    
    let waistCm = waist;
    if (waistUnit === 'in') {
        waistCm = waist * 2.54;
    }
    let heightCm = height;
    if (heightUnit === 'in') {
        heightCm = height * 2.54;
    }
    
    const ratio = waistCm / heightCm;
    document.getElementById('wthr-result').textContent = `Your Waist-to-Height Ratio is ${ratio.toFixed(2)}`;
    
    // Update progress bar toward 0.5 threshold
    const percentage = Math.min((ratio / 0.5) * 100, 100);
    document.getElementById('progress').style.width = `${percentage}%`;
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
