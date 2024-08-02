document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const sideNav = document.getElementById('side-nav');
    const menuIconWrapper = document.getElementById('menu-icon-wrapper');
    const heroSection = document.querySelector('.hero');

    menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('open');
        sideNav.classList.toggle('open');
        document.body.classList.toggle('no-scroll');
    });

    window.addEventListener('scroll', () => {
        const heroRect = heroSection.getBoundingClientRect();
        const isHeroInView = heroRect.top <= 0 && heroRect.bottom >= 0;

        if (isHeroInView) {
            menuIconWrapper.classList.remove('fixed');
            menuIconWrapper.style.top = `${heroRect.top + window.scrollY + 20}px`;
            menuIconWrapper.style.left = `${heroRect.left + window.scrollX + 20}px`;
        } else {
            menuIconWrapper.classList.add('fixed');
        }
    });
});
