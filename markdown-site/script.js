document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("nav ul");
    const navLinks = document.querySelectorAll("nav a");

    // ✅ Mobile Menu Toggle
    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("open");
    });

    // ✅ Highlight Active Page in Navigation
    function setActivePage() {
        let currentPage = window.location.pathname.split("/").pop();
        if (currentPage === "") currentPage = "index.html"; // Default to home page

        navLinks.forEach(link => {
            if (link.getAttribute("href") === currentPage) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }
    setActivePage();

    // ✅ Smooth Page Transitions
    navLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault(); // Stop instant navigation
            let href = link.getAttribute("href");

            // Fade Out Effect
            document.body.style.opacity = 0;
            setTimeout(() => {
                window.location.href = href; // Navigate after fade out
            }, 300); // Wait 300ms before navigating
        });
    });

    // ✅ Fade In Effect When Page Loads
    document.body.style.opacity = 0;
    setTimeout(() => {
        document.body.style.transition = "opacity 0.6s ease-in-out";
        document.body.style.opacity = 1;
    }, 100);
});
