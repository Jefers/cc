document.getElementById('mhr-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const age = parseInt(document.getElementById('age').value, 10);
  if (age && age > 0) {
    const mhr = 220 - age;
    document.getElementById('result').textContent = `Your estimated Maximum Heart Rate is ${mhr} bpm. Note: This formula can vary in accuracy.`;
  } else {
    document.getElementById('result').textContent = 'Please enter a valid age.';
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
