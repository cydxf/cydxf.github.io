document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll("nav ul li a");

    links.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);
            window.scrollTo({
                top: targetSection.offsetTop,
                behavior: "smooth"
            });
        });
    });
});

function toggleMenu() {
    const menuIcon = document.querySelector('.menu-icon');
    const sideNav = document.getElementById('sideNav');
    const body = document.body;

    menuIcon.classList.toggle('open');
    sideNav.classList.toggle('open');
    body.classList.toggle('no-scroll');
}





