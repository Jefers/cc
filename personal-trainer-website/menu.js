document.addEventListener('DOMContentLoaded', () => {
    const menuTitles = document.querySelectorAll('.menu-title');
    
    menuTitles.forEach(title => {
        title.addEventListener('click', () => {
            const menuContent = title.nextElementSibling;
            menuContent.classList.toggle('active');
        });
    });
});