document.getElementById('body-fat-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const waist = parseFloat(document.getElementById('waist').value);
    const neck = parseFloat(document.getElementById('neck').value);
    const height = parseFloat(document.getElementById('height').value);
    const sex = document.getElementById('sex').value;
    
    if (isNaN(waist) || isNaN(neck) || isNaN(height)) {
        document.getElementById('body-fat-result').textContent = 'Please enter valid measurements.';
        return;
    }
    
    let bodyFat = 0;
    if (sex === 'male') {
        bodyFat = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
    } else {
        bodyFat = 163.205 * Math.log10(waist + neck - height) - 97.684 * Math.log10(height) - 78.387;
    }
    document.getElementById('body-fat-result').textContent = `Estimated Body Fat Percentage: ${bodyFat.toFixed(1)}%`;
    
    // Draw a simple gauge visualization
    const gauge = document.getElementById('body-fat-gauge');
    gauge.innerHTML = '';
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '300');
    svg.setAttribute('height', '150');
    
    // Background arc for healthy range (10% to 30%)
    const arc = document.createElementNS(svgNS, 'path');
    arc.setAttribute('d', 'M50,130 A100,100 0 0,1 250,130');
    arc.setAttribute('fill', 'none');
    arc.setAttribute('stroke', '#ddd');
    arc.setAttribute('stroke-width', '20');
    svg.appendChild(arc);
    
    // Foreground arc based on bodyFat value
    let percentage = Math.min(Math.max((bodyFat - 10) / 20, 0), 1);
    let endAngle = Math.PI + (Math.PI * percentage);
    const x2 = 50 + 100 * Math.cos(endAngle);
    const y2 = 130 + 100 * Math.sin(endAngle);
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    const pathData = `M50,130 A100,100 0 ${largeArcFlag},1 ${x2},${y2}`;
    const arcFg = document.createElementNS(svgNS, 'path');
    arcFg.setAttribute('d', pathData);
    arcFg.setAttribute('fill', 'none');
    arcFg.setAttribute('stroke', 'blue');
    arcFg.setAttribute('stroke-width', '20');
    svg.appendChild(arcFg);
    
    gauge.appendChild(svg);
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
