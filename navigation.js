(() => {
    const navbar = document.querySelector('.logo-nav');
    const overlay = document.getElementById('myNav');
    if (!navbar) return;

    const menuButton = navbar.querySelector('.menu-icon');
    const setMenuOpen = (open) => {
        overlay.style.height = open ? '100%' : '0%';
        overlay.inert = !open;
        menuButton.classList.toggle('is-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        navbar.classList.remove('nav-hidden');
    };

    if (menuButton && overlay) {
        setMenuOpen(false);
        menuButton.addEventListener('click', () => {
            setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
                setMenuOpen(false);
                menuButton.focus();
            }
        });
    }

    let previousY = Math.max(0, window.scrollY);
    let direction = 0;
    let distance = 0;

    window.addEventListener('scroll', () => {
        // Clamp overscroll so bouncing at the page edges does not hide the bar.
        const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const currentY = Math.min(maxY, Math.max(0, window.scrollY));
        const delta = currentY - previousY;
        previousY = currentY;

        if (currentY <= navbar.offsetHeight || overlay?.style.height === '100%') {
            navbar.classList.remove('nav-hidden');
            distance = 0;
            direction = 0;
            return;
        }

        if (!delta) return;
        const nextDirection = Math.sign(delta);
        distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
        direction = nextDirection;

        // Ignore tiny scroll movements to keep the bar from flickering.
        if (distance >= 8) {
            navbar.classList.toggle('nav-hidden', direction > 0);
        }
    }, { passive: true });
})();

// Reveal content once as it enters the viewport on any page.
(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll([
        '.elemContentImageContainer',
        '.elemContentTextContainer',
        '.celebration-divider',
        '#timeline-heading',
        '.timeline-image',
        '.timeline-details',
        '.accordion-item',
        '.elemMainContainer > p',
        '.footerImageContainer',
        '.footer-navigation'
    ].join(', '));

    const reveal = (element) => {
        element.classList.remove('scroll-reveal-pending');
        observer.unobserve(element);
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) reveal(entry.target);
        });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

    const pending = [];
    targets.forEach((element) => {
        // Leave content already on screen visible on load or restored scroll.
        if (element.getBoundingClientRect().top < window.innerHeight) return;
        element.classList.add('scroll-reveal');
        element.classList.add('scroll-reveal-pending');
        pending.push(element);
    });

    // Paint the initial state before observing, including on mobile browsers.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => pending.forEach((element) => observer.observe(element)));
    });

    // Keyboard navigation must reveal focused controls immediately.
    document.addEventListener('focusin', (event) => {
        const element = event.target.closest('.scroll-reveal-pending');
        if (element) reveal(element);
    });

    const onMotionChange = (event) => {
        if (!event.matches) return;
        targets.forEach(reveal);
        observer.disconnect();
    };
    if (reducedMotion.addEventListener) {
        reducedMotion.addEventListener('change', onMotionChange);
    } else if (reducedMotion.addListener) {
        reducedMotion.addListener(onMotionChange);
    }
})();
