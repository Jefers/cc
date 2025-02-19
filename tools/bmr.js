document.getElementById('bmr-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const age = parseFloat(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const sex = document.getElementById('sex').value;
    
    let bmr = 0;
    if (sex === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    const activityLevels = {
        sedentary: 1.2,
        lightlyActive: 1.375,
        moderatelyActive: 1.55,
        veryActive: 1.725,
        extraActive: 1.9
    };
    
    let resultHTML = `Your BMR is ${bmr.toFixed(1)} kcal/day.<br>`;
    resultHTML += `<label for="activity">Select Activity Level:</label>`;
    resultHTML += `<select id="activity">`;
    resultHTML += `<option value="sedentary">Sedentary</option>`;
    resultHTML += `<option value="lightlyActive">Lightly Active</option>`;
    resultHTML += `<option value="moderatelyActive">Moderately Active</option>`;
    resultHTML += `<option value="veryActive">Very Active</option>`;
    resultHTML += `<option value="extraActive">Extra Active</option>`;
    resultHTML += `</select>`;
    resultHTML += `<button id="calcTotal">Calculate Total Calories</button>`;
    document.getElementById('bmr-result').innerHTML = resultHTML;
    
    document.getElementById('calcTotal').addEventListener('click', function() {
        const activity = document.getElementById('activity').value;
        const totalCalories = bmr * activityLevels[activity];
        alert(`Your estimated daily calorie needs are ${totalCalories.toFixed(1)} kcal.`);
    });
});
