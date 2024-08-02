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
    const menuIcon = document.getElementById('menuIcon');
    const sideNav = document.getElementById('sideNav');

    menuIcon.addEventListener('click', function () {
        menuIcon.classList.toggle('open');
        sideNav.classList.toggle('open');
        document.body.classList.toggle('no-scroll'); // 防止背景滚动
    });
});

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
