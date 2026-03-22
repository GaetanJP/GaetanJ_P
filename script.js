// ==================== SVG ICONS ====================
const ICONS = {
    externalLink: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    github: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    email: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    location: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    chevronRight: `<svg class="modal-link-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
    education: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
};

// ==================== RENDERERS ====================

function renderHero(data) {
    const el = document.getElementById('hero-text');
    if (!el) return;
    el.innerHTML = `
        <p class="hero-greeting">Hi, I'm</p>
        <h1 class="hero-name">${data.name.replace(' ', '<br>')}</h1>
        <p class="hero-title">${data.title}</p>
        <p class="hero-location">${ICONS.location} ${data.location}</p>
        <p class="hero-bio">${data.bio}</p>
        <div class="hero-cta">
            <a href="#projects" class="btn-primary">View Projects</a>
            <button class="btn-secondary" id="open-modal-btn-hero">Connect with me</button>
        </div>
    `;
    document.getElementById('open-modal-btn-hero')
        .addEventListener('click', openModal);

    document.getElementById('profile-pic').alt = data.name;

    const initials = data.name.split(' ').map(w => w[0]).join('');
    document.getElementById('nav-logo').textContent = initials;
    document.title = `${data.name} — ${data.title}`;
}

function renderExperience(experience) {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;
    timeline.innerHTML = experience.map(job => `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
                <div class="timeline-meta">
                    <span class="timeline-date">${job.date}</span>
                    ${job.current ? '<span class="timeline-badge current">Current</span>' : ''}
                </div>
                <h3 class="timeline-role">${job.role}</h3>
                <p class="timeline-company">${job.company} <span>· ${job.location}</span></p>
                <ul class="timeline-bullets">
                    ${job.bullets.map(b => `<li>${b}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

function renderEducation(education) {
    const grid = document.getElementById('education-grid');
    if (!grid) return;
    grid.innerHTML = education.map(edu => `
        <div class="edu-card">
            <div class="edu-icon">${ICONS.education}</div>
            <div class="edu-info">
                <h3>${edu.school}</h3>
                <p class="edu-degree">${edu.degree}</p>
                <p class="edu-date">${edu.date}${edu.gpa ? ` · GPA ${edu.gpa}` : ''}</p>
            </div>
        </div>
    `).join('');
}

function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = projects.map(p => `
        <div class="project-card">
            <div class="project-header">
                <div class="project-icon">${p.icon || '💻'}</div>
                <div class="project-links">
                    <a href="${p.link || '#'}" target="_blank" rel="noopener"
                       class="project-link-btn" aria-label="View project">
                        ${ICONS.externalLink}
                    </a>
                    <a href="${p.github || '#'}" target="_blank" rel="noopener"
                       class="project-link-btn" aria-label="View on GitHub">
                        ${ICONS.github}
                    </a>
                </div>
            </div>
            <h3 class="project-title">${p.name}</h3>
            <p class="project-date">${p.date} · ${p.role}</p>
            <p class="project-desc">${p.description}</p>
            <div class="project-tags">
                ${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function renderSkills(skills) {
    const grid = document.getElementById('skills-grid');
    if (!grid) return;
    grid.innerHTML = skills.map(group => `
        <div class="skill-group">
            <h4 class="skill-group-title">${group.category}</h4>
            <div class="skill-tags">
                ${(group.items || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function renderModal(socials) {
    const container = document.getElementById('modal-links');
    if (!container) return;

    const iconMap = {
        github: { icon: ICONS.github, cls: 'github-icon' },
        linkedin: { icon: ICONS.linkedin, cls: 'linkedin-icon' },
        email: { icon: ICONS.email, cls: 'email-icon' },
    };

    container.innerHTML = socials.map(s => {
        const { icon, cls } = iconMap[s.type] || { icon: ICONS.externalLink, cls: 'email-icon' };
        const target = s.type === 'email' ? '' : 'target="_blank" rel="noopener"';
        return `
            <a href="${s.url}" ${target} class="modal-link">
                <div class="modal-link-icon ${cls}">${icon}</div>
                <div class="modal-link-info">
                    <span class="modal-link-label">${s.label}</span>
                    <span class="modal-link-value">${s.value}</span>
                </div>
                ${ICONS.chevronRight}
            </a>
        `;
    }).join('');
}

function renderFooter(data) {
    const footer = document.getElementById('footer');
    if (!footer) return;
    footer.innerHTML = `
        <p>Designed & built by <strong>${data.name}</strong> · 2026</p>
        <button class="footer-connect" id="open-modal-btn-footer">Get in touch →</button>
    `;
    document.getElementById('open-modal-btn-footer')
        .addEventListener('click', openModal);
}

// ==================== SCROLL REVEAL ====================

function applyScrollReveal() {
    const els = document.querySelectorAll(
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

    els.forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.transform = el.classList.contains('timeline-card')
            ? 'translateX(-20px)' : 'translateY(24px)';
        observer.observe(el);
    });
}

// ==================== MODAL ====================

const overlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');

function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

document.getElementById('open-modal-btn').addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ==================== NAVBAR ====================

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ==================== BOOTSTRAP ====================

async function loadResume() {
    const res = await fetch('resume.yaml');
    if (!res.ok) throw new Error(`Could not load resume.yaml (${res.status})`);
    const text = await res.text();
    return jsyaml.load(text);
}

async function init() {
    try {
        const data = await loadResume();
        renderHero(data);
        renderExperience(data.experience || []);
        renderEducation(data.education || []);
        renderProjects(data.projects || []);
        renderSkills(data.skills || []);
        renderModal(data.socials || []);
        renderFooter(data);
        applyScrollReveal();
    } catch (err) {
        console.error('Failed to load resume.yaml:', err);
        document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100vh;
                        font-family:monospace;color:#ff6b6b;background:#0a0d14;padding:40px;text-align:center;">
                <div>
                    <p style="font-size:1.2rem;margin-bottom:12px;">⚠ Could not load resume.yaml</p>
                    <p style="color:#8892aa;font-size:0.875rem;">
                        Make sure you're running a local server.<br>
                        Run <code style="color:#6c8fff">npm start</code> in the project folder.
                    </p>
                </div>
            </div>
        `;
    }
}

init();
