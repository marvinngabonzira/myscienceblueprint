/* ============================================================
   THE SCIENCE BLUEPRINT — main.js
   myscienceblueprint.com | v1.0
   ============================================================ */

'use strict';

/* ── 1. THEME ─────────────────────────────────────────────── */
(function initTheme() {
  const stored = localStorage.getItem('tsb-theme');
  const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', stored || preferred);
})();

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('tsb-theme', next);
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = next === 'dark' ? '☀' : '◑';
    btn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

/* ── 2. NAV SCROLL + MOBILE MENU ──────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('main-nav');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  // Init theme icon
  const currentTheme = document.documentElement.getAttribute('data-theme');
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = currentTheme === 'dark' ? '☀' : '◑';
  });

  // Nav scroll state
  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 20) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Mobile menu
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('nav-links--open');
      menuToggle.classList.toggle('menu-toggle--open', open);
      menuToggle.setAttribute('aria-expanded', open);
    });

    // Close on nav link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-links--open');
        menuToggle.classList.remove('menu-toggle--open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('nav-link--active');
    }
  });

  // ── 3. SCROLL REVEAL ──────────────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // ── 4. ABSTRACT TOGGLES ───────────────────────────────── */
  document.querySelectorAll('.abstract-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      if (!body) return;
      const open = body.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.querySelector('.toggle-text').textContent = open ? 'Hide abstract' : 'Read abstract';
    });
  });

  // ── 5. LATEST SUBSTACK POST (via RSS2JSON) ────────────── */
  const postEl = document.getElementById('latest-post');
  if (postEl) {
    const feed = 'https://myscienceblueprint.substack.com/feed';
    const api  = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}&count=1`;

    fetch(api)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'ok' && data.items?.length) {
          const item = data.items[0];
          const date = new Date(item.pubDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          const stripped = item.description?.replace(/<[^>]*>/g, '').slice(0, 180) + '…' || '';
          postEl.innerHTML = `
            <div class="signal-post-date">${date}</div>
            <div class="signal-post-title">${item.title}</div>
            <p class="signal-post-teaser">${stripped}</p>
            <a href="${item.link}" target="_blank" rel="noopener" class="btn btn-outline">
              Read on Substack &nbsp;↗
            </a>
          `;
        } else {
          postEl.innerHTML = renderNoPost();
        }
      })
      .catch(() => {
        postEl.innerHTML = renderNoPost();
      });
  }

  // ── 6. SIGNAL PAGE: VIDEO GRID ────────────────────────── */
  const videoGrid = document.getElementById('video-grid');
  if (videoGrid) {
    loadVideos(videoGrid);
  }

  // ── 7. STATS: LOAD FROM JSON ──────────────────────────── */
  loadStats();
});

function renderNoPost() {
  return `
    <div class="signal-post-date">Coming soon</div>
    <div class="signal-post-title">The first dispatch is being prepared</div>
    <p class="signal-post-teaser">Subscribe to The Blueprint on Substack to receive the first research note when it drops.</p>
    <a href="https://myscienceblueprint.substack.com" target="_blank" rel="noopener" class="btn btn-outline">
      Follow on Substack &nbsp;↗
    </a>
  `;
}

function loadStats() {
  const els = document.querySelectorAll('[data-stat]');
  if (!els.length) return;

  fetch('./data/stats.json')
    .then(r => r.json())
    .then(data => {
      els.forEach(el => {
        const key = el.getAttribute('data-stat');
        if (data[key] !== undefined) {
          el.textContent = formatStat(data[key]);
        }
      });
    })
    .catch(() => {});
}

function formatStat(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

async function loadVideos(container) {
  try {
    const res  = await fetch('./data/videos.json');
    const data = await res.json();
    container.innerHTML = data.videos.map(v => `
      <div class="glass-card video-card fade-in">
        <div class="video-container">
          <iframe
            src="https://www.youtube.com/embed/${v.id}"
            title="${v.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy">
          </iframe>
        </div>
        <div class="video-card-date">${v.date}</div>
        <div class="video-card-title">${v.title}</div>
      </div>
    `).join('');

    // Re-observe new elements
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.08 });
      obs.observe(el);
    });
  } catch (e) {
    container.innerHTML = `<p class="text-3" style="text-align:center;grid-column:1/-1;">Could not load videos.</p>`;
  }
}
