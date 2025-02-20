document.getElementById('thr-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const age = parseInt(document.getElementById('age').value, 10);
  if (age && age > 0) {
    const mhr = 220 - age;
    const zones = [
      { range: "50-60%", lower: 0.50, upper: 0.60, description: "Very Light" },
      { range: "60-70%", lower: 0.60, upper: 0.70, description: "Light" },
      { range: "70-80%", lower: 0.70, upper: 0.80, description: "Moderate" },
      { range: "80-90%", lower: 0.80, upper: 0.90, description: "Hard" },
      { range: "90-100%", lower: 0.90, upper: 1.00, description: "Maximum" }
    ];
    let resultHTML = "<table><tr><th>Zone</th><th>Heart Rate Range (bpm)</th><th>Description</th></tr>";
    zones.forEach((zone, index) => {
      const lowerHR = Math.round(mhr * zone.lower);
      const upperHR = Math.round(mhr * zone.upper);
      resultHTML += `<tr class="zone zone-${index+1}"><td>${zone.range}</td><td>${lowerHR} - ${upperHR}</td><td>${zone.description}</td></tr>`;
    });
    resultHTML += "</table>";
    document.getElementById('zones-result').innerHTML = resultHTML;
  } else {
    document.getElementById('zones-result').textContent = 'Please enter a valid age.';
  }
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
