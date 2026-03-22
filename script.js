// ==================== MODAL ====================
const overlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');

const openBtns = [
    document.getElementById('open-modal-btn'),
    document.getElementById('open-modal-btn-hero'),
    document.getElementById('open-modal-btn-footer'),
];

function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

openBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', openModal);
});

modalClose.addEventListener('click', closeModal);

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ==================== NAVBAR SCROLL ====================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, { passive: true });

// ==================== HAMBURGER MENU ====================
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// ==================== SCROLL REVEAL ====================
const revealElements = document.querySelectorAll(
    '.timeline-card, .project-card, .edu-card, .skill-group'
);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = entry.target.classList.contains('timeline-card')
                ? 'translateX(0)' : 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    if (el.classList.contains('timeline-card')) {
        el.style.transform = 'translateX(-20px)';
    } else {
        el.style.transform = 'translateY(24px)';
    }
    observer.observe(el);
});
