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

document.addEventListener('DOMContentLoaded', function () {
    const menuIcon = document.getElementById('menu-icon');
    const sideNav = document.getElementById('side-nav');

    menuIcon.addEventListener('click', function () {
        menuIcon.classList.toggle('open');
        sideNav.classList.toggle('open');
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

window.addEventListener('scroll', () => {
    const menuIcon = document.getElementById('menuIcon');
    const heroSection = document.querySelector('.hero');
    const heroBottom = heroSection.getBoundingClientRect().bottom;

    if (heroBottom <= 0) {
        menuIcon.classList.add('fixed');
    } else {
        menuIcon.classList.remove('fixed');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.getElementById('side-nav');
    const heroSection = document.querySelector('.hero');

    function updateNavbarPosition() {
        const heroHeight = heroSection.offsetHeight;
        const scrollPosition = window.scrollY;

        if (scrollPosition >= heroHeight) {
            navbar.classList.add('navbar-sticky');
            navbar.classList.remove('navbar-fixed');
        } else {
            navbar.classList.add('navbar-fixed');
            navbar.classList.remove('navbar-sticky');
        }
    }

    window.addEventListener('scroll', updateNavbarPosition);
    updateNavbarPosition(); // 初始化检查
});






