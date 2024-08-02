document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const sideNav = document.getElementById('side-nav');
    const menuIconWrapper = document.getElementById('menu-icon-wrapper');

    menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('open');
        sideNav.classList.toggle('open');
        document.body.classList.toggle('no-scroll');
    });

    window.addEventListener('scroll', () => {
        const heroSection = document.querySelector('.hero');
        const heroBottom = heroSection.getBoundingClientRect().bottom;

        if (heroBottom <= 0) {
            menuIconWrapper.classList.add('fixed');
        } else {
            menuIconWrapper.classList.remove('fixed');
        }
    });
});
