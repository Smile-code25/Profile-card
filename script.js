/**
 * script.js — Sakshi Mile Profile Card (Enhanced v2)
 * ============================================================
 */

// ── EmailJS Credentials ──────────────────────────────────────
const EJ_PUBLIC_KEY  = "I3VWVhYf7jJjyqAQg";
const EJ_SERVICE_ID  = "service_dhajvvn";
const EJ_TEMPLATE_ID = "template_4qx1jgq";

// ── App Entry Point ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (EJ_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") emailjs.init(EJ_PUBLIC_KEY);

  initializeLoader();
  initializeParticles();
  initializeTabs();
  initializeTypedText();
  initializeCounters();
  initializeCircularSkills();
  initializeScrollReveal();
  initializeForm();
  initializeUtilities();
  consoleGreeting();
});


/* ============================================================
   1. LOADER
============================================================ */
function initializeLoader() {
  const loader = document.getElementById('loader');

  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      document.querySelectorAll('.reveal').forEach(el => {
        setTimeout(() => el.classList.add('visible'), 100);
      });
    }, 400);
  });

  setTimeout(() => { if (loader) loader.classList.add('hidden'); }, 2000);
}


/* ============================================================
   2. PARTICLE SYSTEM — subtle floating stars
============================================================ */
function initializeParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, particles;
  const PARTICLE_COUNT = 80;

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x:     Math.random() * w,
      y:     Math.random() * h,
      r:     Math.random() * 1.5 + 0.3,
      vx:    (Math.random() - 0.5) * 0.18,
      vy:    (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.5 + 0.1,
      color: ['#6366f1','#a855f7','#06b6d4','#8b5cf6','#ec4899'][Math.floor(Math.random()*5)],
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      p.x += p.vx; p.y += p.vy;
      if (p.x < -2) p.x = w + 2;
      if (p.x > w + 2) p.x = -2;
      if (p.y < -2) p.y = h + 2;
      if (p.y > h + 2) p.y = -2;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', debounce(resize, 250));
  init();
  draw();
}


/* ============================================================
   3. TAB SYSTEM
============================================================ */
function initializeTabs() {
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const indicator = document.querySelector('.tab-indicator');
  const tabNav    = document.getElementById('tabNav');

  function moveIndicator(btn) {
    if (!indicator || !tabNav) return;
    const navRect = tabNav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    indicator.style.left  = (btnRect.left - navRect.left) + 'px';
    indicator.style.width = btnRect.width + 'px';
  }

  function switchTab(tabName) {
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
      if (btn.dataset.tab === tabName) moveIndicator(btn);
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === 'tab-' + tabName);
    });
    if (tabName === 'skills') setTimeout(animateCircles, 100);
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  const activeBtn = document.querySelector('.tab-btn.active');
  if (activeBtn) setTimeout(() => moveIndicator(activeBtn), 50);

  window.addEventListener('resize', debounce(() => {
    const cur = document.querySelector('.tab-btn.active');
    if (cur) moveIndicator(cur);
  }, 200));

  window.switchTab = switchTab;
}


/* ============================================================
   4. TYPED TEXT EFFECT
============================================================ */
function initializeTypedText() {
  const el = document.querySelector('.typed-text');
  if (!el) return;

  const roles = [
    'CS Student & Developer',
    'Python Developer',
    'Web Developer',
    'Problem Solver & Analyst',
  ];

  let roleIndex = 0, charIndex = 0, isDeleting = false;
  const TYPING_SPEED = 80, DELETING_SPEED = 40, PAUSE_AFTER = 1800, PAUSE_BEFORE = 400;

  function type() {
    const current = roles[roleIndex];
    el.textContent = isDeleting
      ? current.slice(0, charIndex - 1)
      : current.slice(0, charIndex + 1);
    isDeleting ? charIndex-- : charIndex++;

    let delay = isDeleting ? DELETING_SPEED : TYPING_SPEED;
    if (!isDeleting && charIndex === current.length) { delay = PAUSE_AFTER; isDeleting = true; }
    else if (isDeleting && charIndex === 0) { isDeleting = false; roleIndex = (roleIndex + 1) % roles.length; delay = PAUSE_BEFORE; }

    setTimeout(type, delay);
  }
  type();
}


/* ============================================================
   5. COUNTER ANIMATION
============================================================ */
function initializeCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = true;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800, stepTime = 16, steps = duration / stepTime;
  const increment = target / steps;
  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) { el.textContent = target; clearInterval(timer); }
    else { el.textContent = Math.ceil(current); }
  }, stepTime);
}


/* ============================================================
   6. CIRCULAR SKILL PROGRESS BARS
============================================================ */
const CIRCUMFERENCE = 2 * Math.PI * 52;
let circlesAnimated = false;

function initializeCircularSkills() {
  document.querySelectorAll('.progress[data-pct]').forEach(c => {
    c.style.strokeDashoffset = CIRCUMFERENCE;
  });
  const skillsSection = document.getElementById('tab-skills');
  if (!skillsSection) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !circlesAnimated) { animateCircles(); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.2 });
  observer.observe(skillsSection);
}

function animateCircles() {
  if (circlesAnimated) return;
  circlesAnimated = true;
  document.querySelectorAll('.progress[data-pct]').forEach((circle, i) => {
    const pct = parseInt(circle.dataset.pct);
    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
    setTimeout(() => { circle.style.strokeDashoffset = offset; }, i * 80);
  });
}


/* ============================================================
   7. SCROLL REVEAL
============================================================ */
function initializeScrollReveal() {
  const targets = document.querySelectorAll('.sr-item, .glass-card, .project-card, .skill-circle-wrap');
  targets.forEach(el => { if (!el.classList.contains('reveal')) el.classList.add('sr-item'); });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.sr-item').forEach(el => observer.observe(el));
}


/* ============================================================
   8. CONTACT FORM
============================================================ */
function initializeForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => { if (field.classList.contains('error-field')) validateField(field); });
  });
  form.addEventListener('submit', handleSubmit);
}

function validateField(field) {
  const val = field.value.trim(), name = field.getAttribute('name');
  let msg = '';
  switch (name) {
    case 'name':    if (val.length < 2) msg = 'At least 2 characters.'; else if (!/^[a-zA-Z\s]+$/.test(val)) msg = 'Only letters and spaces.'; break;
    case 'email':   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'Enter a valid email.'; break;
    case 'subject': if (val.length < 3) msg = 'At least 3 characters.'; break;
    case 'message': if (val.length < 10) msg = 'At least 10 characters.'; break;
  }
  const errSpan = document.getElementById(field.id + 'Err');
  if (errSpan) errSpan.textContent = msg;
  field.classList.toggle('error-field', !!msg);
  return !msg;
}

function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => { if (!validateField(field)) valid = false; });
  if (!valid) { showFormToast('Please fix the errors above.', 'error'); return; }

  const btn = document.getElementById('submitBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
  btn.disabled = true;

  if (EJ_PUBLIC_KEY === "YOUR_PUBLIC_KEY" || EJ_SERVICE_ID === "YOUR_SERVICE_ID" || EJ_TEMPLATE_ID === "YOUR_TEMPLATE_ID") {
    setTimeout(() => {
      showFormToast('✅ Thank you! Your message has been sent successfully.', 'success');
      form.reset(); btn.innerHTML = originalText; btn.disabled = false;
    }, 1500);
    return;
  }

  const params = {
    name: form.fname.value.trim(), email: form.femail.value.trim(),
    subject: form.fsubject.value.trim(), message: form.fmessage.value.trim(),
    time: new Date().toLocaleString(),
  };

  emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_ID, params)
    .then(() => { showFormToast(`✅ Thanks, ${params.name}! Your message has been sent.`, 'success'); form.reset(); })
    .catch(err => { console.error('EmailJS error:', err); showFormToast('❌ Failed to send. Please try again later.', 'error'); })
    .finally(() => { btn.innerHTML = originalText; btn.disabled = false; });
}

function showFormToast(msg, type) {
  const toast = document.getElementById('formToast');
  if (!toast) return;
  toast.className = `form-toast ${type}`;
  const icon = document.createElement('i');
  icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  toast.innerHTML = '';
  toast.appendChild(icon);
  const span = document.createElement('span');
  span.textContent = ' ' + msg;
  toast.appendChild(span);
  setTimeout(() => { toast.className = 'form-toast'; }, 7000);
}


/* ============================================================
   9. UTILITIES
============================================================ */
function initializeUtilities() {
  // Copy email
  const copyBtn = document.getElementById('copyEmailBtn');
  const emailDisplay = document.getElementById('emailDisplay');
  if (copyBtn && emailDisplay) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(emailDisplay.textContent.trim())
        .then(() => showGlobalToast('📋 Email copied!', 'success'))
        .catch(() => showGlobalToast('Failed to copy.', 'error'));
    });
  }

  // Easter egg
  let clickCount = 0;
  const avatarWrap = document.querySelector('.avatar-wrap');
  if (avatarWrap) {
    avatarWrap.addEventListener('click', () => {
      clickCount++;
      if (clickCount === 5) {
        showGlobalToast('🎉 You found the easter egg! You\'re awesome!', 'success');
        const avatarImg = avatarWrap.querySelector('.avatar-img');
        if (avatarImg) {
          avatarImg.style.transform = 'scale(1.12) rotate(8deg)';
          setTimeout(() => { avatarImg.style.transform = ''; clickCount = 0; }, 800);
        }
      }
    });
  }

  // Button ripple effect
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      Object.assign(ripple.style, {
        width: size + 'px', height: size + 'px',
        left: (e.clientX - rect.left - size / 2) + 'px',
        top: (e.clientY - rect.top - size / 2) + 'px',
        position: 'absolute', borderRadius: '50%',
        background: 'rgba(255,255,255,.25)',
        transform: 'scale(0)', animation: 'rippleAnim .6s linear',
        pointerEvents: 'none',
      });
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  if (!document.getElementById('rippleStyle')) {
    const s = document.createElement('style');
    s.id = 'rippleStyle';
    s.textContent = `@keyframes rippleAnim { to { transform: scale(4); opacity: 0; } }`;
    document.head.appendChild(s);
  }
}

function showGlobalToast(msg, type = 'success') {
  const existing = document.querySelector('.global-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'global-toast';
  Object.assign(toast.style, {
    position: 'fixed', top: '20px', right: '20px',
    padding: '14px 22px', borderRadius: '12px',
    background: type === 'success' ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#dc2626,#ef4444)',
    color: '#fff', fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: '600',
    boxShadow: '0 8px 32px rgba(0,0,0,.4)', zIndex: '99999',
    display: 'flex', alignItems: 'center', gap: '10px',
    animation: 'slideInRight .3s ease', maxWidth: '340px', cursor: 'pointer',
  });
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'times-circle'}"></i>${msg}`;
  document.body.appendChild(toast);
  if (!document.getElementById('toastStyle')) {
    const s = document.createElement('style');
    s.id = 'toastStyle';
    s.textContent = `@keyframes slideInRight  { from{opacity:0;transform:translateX(80px)} to{opacity:1;transform:translateX(0)} } @keyframes slideOutRight { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(80px)} }`;
    document.head.appendChild(s);
  }
  const dismiss = () => {
    toast.style.animation = 'slideOutRight .3s ease';
    setTimeout(() => toast.remove(), 310);
  };
  setTimeout(dismiss, 4500);
  toast.addEventListener('click', dismiss);
}


/* ============================================================
   10. UTILITY HELPERS
============================================================ */
function debounce(fn, wait) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}


/* ============================================================
   11. CONSOLE GREETING
============================================================ */
function consoleGreeting() {
  console.log('%c👋 Hey Developer!', 'font-size:20px;font-weight:bold;color:#6366f1;');
  console.log('%cLike the card? Check out my GitHub →', 'font-size:13px;color:#9db4d4;');
  console.log('%chttps://github.com/Smile-code25', 'font-size:13px;color:#a855f7;');
}
