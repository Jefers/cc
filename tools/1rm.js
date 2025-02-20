document.getElementById('1rm-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const weight = parseFloat(document.getElementById('weight').value);
  const reps = parseFloat(document.getElementById('reps').value);
  if (isNaN(weight) || isNaN(reps) || reps < 1) {
    document.getElementById('1rm-result').textContent = 'Please enter valid numbers.';
    return;
  }
  const oneRM = weight * (1 + reps / 30);
  document.getElementById('1rm-result').textContent = `Your estimated One-Rep Max is ${oneRM.toFixed(1)}.`;
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

document.getElementById('toggle-tip').addEventListener('click', function() {
  const tipContent = document.getElementById('tip-content');
  if (tipContent.style.display === 'none' || tipContent.style.display === '') {
    tipContent.style.display = 'block';
    this.textContent = 'Hide Training Tip';
  } else {
    tipContent.style.display = 'none';
    this.textContent = 'Show Training Tip';
  }
});
