document.getElementById('bmi-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const weight = parseFloat(document.getElementById('weight').value);
  const weightUnit = document.getElementById('weight-unit').value;
  const height = parseFloat(document.getElementById('height').value);
  const heightUnit = document.getElementById('height-unit').value;
  
  let weightKg = weight;
  if (weightUnit === 'lbs') {
    weightKg = weight * 0.453592;
  }
  
  let heightCm = height;
  if (heightUnit === 'ft') {
    heightCm = height * 30.48;
  }
  
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  
  let category = "";
  let boxClass = "";
  if (bmi < 18.5) { category = "Underweight"; boxClass = "underweight"; }
  else if (bmi < 25) { category = "Healthy"; boxClass = "healthy"; }
  else if (bmi < 30) { category = "Overweight"; boxClass = "overweight"; }
  else { category = "Obese"; boxClass = "obese"; }
  
  document.getElementById('bmi-result').innerHTML = `Your BMI is ${bmi.toFixed(1)} (${category})`;
  document.getElementById('bmi-result').className = `result-box ${boxClass}`;
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
