/**
 * script.js — Sakshi Mile Profile Card
 * Modular, well-commented, production-ready JavaScript
 * ============================================================
 */

// ── EmailJS Credentials (UPDATE THESE WITH YOUR ACTUAL KEYS) ──────
const EJ_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";  // Get from https://dashboard.emailjs.com
const EJ_SERVICE_ID  = "YOUR_SERVICE_ID";  // Create a service in EmailJS dashboard
const EJ_TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // Create an email template

// ── App Entry Point ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS if keys are provided
  if (EJ_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    emailjs.init(EJ_PUBLIC_KEY);
  }
  
  initializeLoader();
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
   Hides the full-page loading spinner after page load
============================================================ */
function initializeLoader() {
  const loader = document.getElementById('loader');

  window.addEventListener('load', () => {
    setTimeout(() => {
      if (loader) loader.classList.add('hidden');
      // Trigger initial reveals after load
      document.querySelectorAll('.reveal').forEach(el => {
        setTimeout(() => el.classList.add('visible'), 100);
      });
    }, 400);
  });

  // Fallback: always hide after 2s
  setTimeout(() => {
    if (loader) loader.classList.add('hidden');
  }, 2000);
}


/* ============================================================
   2. TAB SYSTEM
   Handles tab switching with animated indicator
============================================================ */
function initializeTabs() {
  const tabBtns      = document.querySelectorAll('.tab-btn');
  const tabPanels    = document.querySelectorAll('.tab-panel');
  const indicator    = document.querySelector('.tab-indicator');
  const tabNav       = document.getElementById('tabNav');

  /**
   * Move the sliding indicator to match active tab button
   */
  function moveIndicator(btn) {
    if (!indicator || !tabNav) return;
    const navRect = tabNav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    indicator.style.left  = (btnRect.left - navRect.left) + 'px';
    indicator.style.width = btnRect.width + 'px';
  }

  /**
   * Switch to a given tab by name
   */
  function switchTab(tabName) {
    // Update buttons
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
      if (btn.dataset.tab === tabName) moveIndicator(btn);
    });

    // Update panels
    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === 'tab-' + tabName);
    });

    // If switching to skills, animate circles
    if (tabName === 'skills') {
      setTimeout(animateCircles, 100);
    }
  }

  // Click handlers
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Set initial indicator position
  const activeBtn = document.querySelector('.tab-btn.active');
  if (activeBtn) {
    setTimeout(() => moveIndicator(activeBtn), 50);
  }

  // Re-position on resize
  window.addEventListener('resize', debounce(() => {
    const cur = document.querySelector('.tab-btn.active');
    if (cur) moveIndicator(cur);
  }, 200));

  // Expose for external use (hero "Contact Me" etc.)
  window.switchTab = switchTab;
}


/* ============================================================
   3. TYPED TEXT EFFECT
   Cycles through role titles in the hero
============================================================ */
function initializeTypedText() {
  const el     = document.querySelector('.typed-text');
  if (!el) return;

  const roles  = [
    'CS Student & Developer',
    'Python Developer',
    'Web Developer',
    'Problem Solver & Analyst',
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const TYPING_SPEED   = 80;
  const DELETING_SPEED = 40;
  const PAUSE_AFTER    = 1800;
  const PAUSE_BEFORE   = 400;

  function type() {
    const current = roles[roleIndex];

    if (isDeleting) {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? DELETING_SPEED : TYPING_SPEED;

    if (!isDeleting && charIndex === current.length) {
      // Full word typed — pause then delete
      delay = PAUSE_AFTER;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Fully deleted — move to next role
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = PAUSE_BEFORE;
    }

    setTimeout(type, delay);
  }

  type();
}


/* ============================================================
   4. COUNTER ANIMATION
   Counts up from 0 to target value for stat numbers
============================================================ */
function initializeCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');

  const observer = new IntersectionObserver((entries) => {
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

/**
 * Smoothly counts an element from 0 → target
 * @param {HTMLElement} el
 */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target);
  const duration = 1800; // ms
  const stepTime = 16;   // ~60fps
  const steps    = duration / stepTime;
  const increment = target / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.ceil(current);
    }
  }, stepTime);
}


/* ============================================================
   5. CIRCULAR SKILL PROGRESS BARS
   SVG stroke-dashoffset animation triggered by IntersectionObserver
   Circumference = 2 * Math.PI * 52 ≈ 326.73
============================================================ */
const CIRCUMFERENCE = 2 * Math.PI * 52; // ≈ 326.73
let circlesAnimated = false;

function initializeCircularSkills() {
  // Set initial stroke-dashoffset for all progress circles
  document.querySelectorAll('.progress[data-pct]').forEach((circle) => {
    circle.style.strokeDashoffset = CIRCUMFERENCE;
  });

  // Observe the skills section; animate when it first becomes visible
  const skillsSection = document.getElementById('tab-skills');
  if (!skillsSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !circlesAnimated) {
        animateCircles();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(skillsSection);
}

/**
 * Animates all .progress circles from 0 to their data-pct value
 */
function animateCircles() {
  if (circlesAnimated) return;
  circlesAnimated = true;

  document.querySelectorAll('.progress[data-pct]').forEach((circle, i) => {
    const pct    = parseInt(circle.dataset.pct);
    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

    // Stagger each circle by 80ms
    setTimeout(() => {
      circle.style.strokeDashoffset = offset;
    }, i * 80);
  });
}


/* ============================================================
   6. SCROLL REVEAL (IntersectionObserver)
   Adds .visible class to .sr-item and .reveal elements
============================================================ */
function initializeScrollReveal() {
  const targets = document.querySelectorAll('.sr-item, .glass-card, .project-card, .skill-circle-wrap');

  // Add sr-item class if not already reveal/visible
  targets.forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('sr-item');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.sr-item').forEach(el => observer.observe(el));
}


/* ============================================================
   7. CONTACT FORM
   Validation + EmailJS submission + inline toast notification
============================================================ */
function initializeForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Real-time field validation on blur
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error-field')) validateField(field);
    });
  });

  form.addEventListener('submit', handleSubmit);
}

/**
 * Validates a single field and shows/clears inline error
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @returns {boolean}
 */
function validateField(field) {
  const val  = field.value.trim();
  const name = field.getAttribute('name');
  let msg    = '';

  switch (name) {
    case 'name':
      if (val.length < 2)          msg = 'Name must be at least 2 characters.';
      else if (!/^[a-zA-Z\s]+$/.test(val)) msg = 'Only letters and spaces allowed.';
      break;
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'Enter a valid email address.';
      break;
    case 'subject':
      if (val.length < 3) msg = 'Subject must be at least 3 characters.';
      break;
    case 'message':
      if (val.length < 10) msg = 'Message must be at least 10 characters.';
      break;
  }

  // Map field id → error span id
  const errSpan = document.getElementById(field.id + 'Err');
  if (errSpan) errSpan.textContent = msg;

  field.classList.toggle('error-field', !!msg);
  return !msg;
}

/**
 * Handles form submit: validates → EmailJS → shows toast
 */
function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;

  // Validate all required fields
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    if (!validateField(field)) valid = false;
  });

  if (!valid) {
    showFormToast('Please fix the errors above.', 'error');
    return;
  }

  const btn = document.getElementById('submitBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
  btn.disabled  = true;

  // Check if EmailJS is configured
  if (EJ_PUBLIC_KEY === "YOUR_PUBLIC_KEY" || EJ_SERVICE_ID === "YOUR_SERVICE_ID" || EJ_TEMPLATE_ID === "YOUR_TEMPLATE_ID") {
    // Demo mode - simulate success
    setTimeout(() => {
    showFormToast('✅ Thank you! Your message has been sent successfully.', 'success');
      form.reset();
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 1500);
    return;
  }

  const params = {
    name:    form.fname.value.trim(),
    email:   form.femail.value.trim(),
    subject: form.fsubject.value.trim(),
    message: form.fmessage.value.trim(),
    time:    new Date().toLocaleString(),
  };

  emailjs.send(EJ_SERVICE_ID, EJ_TEMPLATE_ID, params)
    .then(() => {
      showFormToast(`✅ Thanks, ${params.name}! Your message has been sent.`, 'success');
      form.reset();
    })
    .catch(err => {
      console.error('EmailJS error:', err);
      showFormToast('❌ Failed to send. Please try again later.', 'error');
    })
    .finally(() => {
      btn.innerHTML = originalText;
      btn.disabled  = false;
    });
}

/**
 * Shows a slide-in toast inside the contact form
 * @param {string} msg
 * @param {'success'|'error'} type
 */
function showFormToast(msg, type) {
  const toast = document.getElementById('formToast');
  if (!toast) return;

  toast.textContent = msg;
  toast.className   = `form-toast ${type}`;

  // Add icon
  const icon = document.createElement('i');
  icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  const txt = toast.textContent;
  toast.innerHTML = '';
  toast.appendChild(icon);
  const span = document.createElement('span');
  span.textContent = ' ' + txt;
  toast.appendChild(span);

  // Auto-hide
  setTimeout(() => { toast.className = 'form-toast'; }, 7000);
}


/* ============================================================
   8. UTILITIES
   Email copy, Easter egg, ripple, keyboard nav
============================================================ */
function initializeUtilities() {

  // ── Copy email to clipboard ──
  const copyBtn  = document.getElementById('copyEmailBtn');
  const emailDisplay = document.getElementById('emailDisplay');

  if (copyBtn && emailDisplay) {
    copyBtn.addEventListener('click', () => {
      const email = emailDisplay.textContent.trim();
      navigator.clipboard.writeText(email)
        .then(() => showGlobalToast('📋 Email copied!', 'success'))
        .catch(() => showGlobalToast('Failed to copy.', 'error'));
    });
  }

  // ── Easter egg: 5 clicks on avatar ──
  let clickCount = 0;
  const avatarWrap = document.querySelector('.avatar-wrap');

  if (avatarWrap) {
    avatarWrap.addEventListener('click', () => {
      clickCount++;
      if (clickCount === 5) {
        showGlobalToast('🎉 You found the easter egg! You\'re awesome!', 'success');
        avatarWrap.style.animation = 'none';
        const avatarImg = avatarWrap.querySelector('.avatar-img');
        if (avatarImg) {
          avatarImg.style.transform = 'scale(1.1) rotate(10deg)';
          setTimeout(() => {
            avatarImg.style.transform = '';
            clickCount = 0;
          }, 800);
        }
      }
    });
  }

  // ── Button ripple effect ──
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);

      Object.assign(ripple.style, {
        width: size + 'px',
        height: size + 'px',
        left: (e.clientX - rect.left - size / 2) + 'px',
        top:  (e.clientY - rect.top  - size / 2) + 'px',
        position: 'absolute',
        borderRadius: '50%',
        background: 'rgba(255,255,255,.3)',
        transform: 'scale(0)',
        animation: 'rippleAnim .6s linear',
        pointerEvents: 'none',
      });

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  // Add ripple keyframe if not present
  if (!document.getElementById('rippleStyle')) {
    const s = document.createElement('style');
    s.id = 'rippleStyle';
    s.textContent = `@keyframes rippleAnim {
      to { transform: scale(4); opacity: 0; }
    }`;
    document.head.appendChild(s);
  }
}

/**
 * Shows a floating global toast (top-right corner)
 * @param {string} msg
 * @param {'success'|'error'} type
 */
function showGlobalToast(msg, type = 'success') {
  const existing = document.querySelector('.global-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'global-toast';

  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '14px 22px',
    borderRadius: '12px',
    background: type === 'success'
      ? 'linear-gradient(135deg,#059669,#10b981)'
      : 'linear-gradient(135deg,#dc2626,#ef4444)',
    color: '#fff',
    fontFamily: "'Inter',sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 8px 32px rgba(0,0,0,.4)',
    zIndex: '99999',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    animation: 'slideInRight .3s ease',
    maxWidth: '340px',
    cursor: 'pointer',
  });

  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'times-circle'}"></i>${msg}`;
  document.body.appendChild(toast);

  // Slide-in keyframe
  if (!document.getElementById('toastStyle')) {
    const s = document.createElement('style');
    s.id = 'toastStyle';
    s.textContent = `
      @keyframes slideInRight  { from{opacity:0;transform:translateX(80px)} to{opacity:1;transform:translateX(0)} }
      @keyframes slideOutRight { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(80px)} }
    `;
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
   9. UTILITY HELPERS
============================================================ */

/** Debounce: delays execution until after wait ms */
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}


/* ============================================================
   10. CONSOLE GREETING
============================================================ */
function consoleGreeting() {
  console.log(
    '%c👋 Hey Developer!',
    'font-size:20px;font-weight:bold;color:#6366f1;'
  );
  console.log(
    '%cLike the card? Check out my GitHub →',
    'font-size:13px;color:#9db4d4;'
  );
  console.log(
    '%chttps://linkedin.com/in/sakshi-mile-946b80382',
    'font-size:13px;color:#a855f7;'
  );
}
