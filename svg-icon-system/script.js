document.addEventListener("DOMContentLoaded", function() {
    const iconContainer = document.getElementById("icon-container");

    // Icons to load
    const icons = ["home", "user", "profile", "menu", "settings", "dumbbell", "timer", "stopwatch", "calendar", "activity", "heart-rate", "running", "cycling", "food", "water", "chart", "progress", "target", "share", "notification", "message","plus", "minus", "chevron-down", "check", "close", "edit"];

    // Load icons dynamically
    icons.forEach(icon => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "icon");
        svg.innerHTML = `<use xlink:href="icons.svg#icon-${icon}"></use>`;
        svg.setAttribute("id", `${icon}-icon`);
        iconContainer.appendChild(svg);
    });

    // Function to change color of all icons
    function changeColor(color) {
        document.querySelectorAll('.icon').forEach(icon => {
            icon.style.color = color;
        });
    }

    // Event listener for color picker
    document.getElementById('color').addEventListener('input', function() {
        changeColor(this.value);
    });
});

// Function to change color (for button use)
function changeColor(color) {
    document.querySelectorAll('.icon').forEach(icon => {
        icon.style.color = color;
    });
}
