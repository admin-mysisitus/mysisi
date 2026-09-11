document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const mobilePanel = document.getElementById('mobilePanel');

    if (menuBtn && mobilePanel) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            mobilePanel.classList.toggle('show');

            if (!mobilePanel.classList.contains('show')) {
                document.querySelectorAll('.mobile-dropdown-btn.open').forEach(openBtn => {
                    openBtn.classList.remove('open');
                    const submenu = openBtn.nextElementSibling;

                    if (submenu) {
                        submenu.classList.remove('open');
                    }
                });
            }
        });

        document.querySelectorAll('.mobile-dropdown-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const submenu = btn.nextElementSibling;

                if (!submenu) {
                    return;
                }

                if (!submenu.classList.contains('open')) {
                    document.querySelectorAll('.mobile-submenu.open').forEach(openMenu => {
                        openMenu.classList.remove('open');
                        const openButton = openMenu.previousElementSibling;

                        if (openButton) {
                            openButton.classList.remove('open');
                        }
                    });

                    submenu.classList.add('open');
                    btn.classList.add('open');
                } else {
                    submenu.classList.remove('open');
                    btn.classList.remove('open');
                }
            });
        });
    }

    const navToggle = document.querySelector('[data-nav-toggle]');
    const navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }
});