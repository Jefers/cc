document.getElementById('resting-hr-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const hr = parseInt(document.getElementById('resting-hr').value, 10);
    let category = "";
    if (hr < 60) { category = "Athlete"; }
    else if (hr <= 100) { category = "Healthy"; }
    else { category = "Elevated"; }
    document.getElementById('hr-result').textContent = `Your resting heart rate is ${hr} bpm, which is considered: ${category}.`;
    
    const heartIcon = document.getElementById('heart-icon');
    const pulseRate = Math.max(0.5, (hr / 100));
    heartIcon.style.transform = `scale(${pulseRate})`;
    
    document.getElementById('hr-scale').textContent = "Normal range: 60-100 bpm";
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
