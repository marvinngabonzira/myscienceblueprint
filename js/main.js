/* ============================================================
   THE SCIENCE BLUEPRINT — main.js v2.0
   myscienceblueprint.com
   ============================================================ */
'use strict';

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
  document.querySelectorAll('.theme-toggle').forEach(b => { b.textContent = next === 'dark' ? '☀' : '◑'; });
}

document.addEventListener('DOMContentLoaded', () => {

  const theme = document.documentElement.getAttribute('data-theme');
  document.querySelectorAll('.theme-toggle').forEach(b => { b.textContent = theme === 'dark' ? '☀' : '◑'; });

  // Nav scroll
  const nav = document.getElementById('main-nav');
  const onScroll = () => nav && nav.classList.toggle('nav--scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.getElementById('menu-toggle');
  const links  = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('nav-links--open');
      toggle.classList.toggle('menu-toggle--open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
      links.classList.remove('nav-links--open');
      toggle.classList.remove('menu-toggle--open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Active nav
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(l => {
    if (l.getAttribute('href') === page || (page === '' && l.getAttribute('href') === 'index.html'))
      l.classList.add('nav-link--active');
  });

  // Scroll reveal
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-in').forEach(el => revObs.observe(el));

  // Back to top
  initBackToTop();

  // Abstract toggles
  document.querySelectorAll('.abstract-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      if (!body) return;
      const open = body.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.querySelector('.toggle-text').textContent = open ? 'Collapse' : 'Read abstract';
      btn.setAttribute('aria-expanded', open);
    });
  });

  // Citation copy
  document.querySelectorAll('.cite-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-citation');
      if (!text) return;
      const copy = () => {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span style="color:var(--cyan)">✓ Copied</span>';
        setTimeout(() => { btn.innerHTML = orig; }, 2200);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(copy);
      } else {
        const ta = Object.assign(document.createElement('textarea'), { value: text });
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.append(ta); ta.select(); document.execCommand('copy');
        ta.remove(); copy();
      }
    });
  });

  // Substack latest (homepage widget)
  const postEl = document.getElementById('latest-post');
  if (postEl) fetchSubstackLatest(postEl);

  // Signal page video grid
  const vGrid = document.getElementById('video-grid');
  if (vGrid) loadVideos(vGrid);

  // Signal page substack full list
  if (document.getElementById('substack-list')) {
    loadSubstackList();
    window._substackLoaded = true;
  }
});

// ── BACK TO TOP ───────────────────────────────────────────
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
  document.body.appendChild(btn);

  const onScroll = () => btn.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── SUBSTACK (single latest post for homepage) ─────────────────
function fetchSubstackLatest(container) {
  const feed = 'https://myscienceblueprint.substack.com/feed';
  const url  = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}&count=1`;
  container.innerHTML = '<div class="signal-post-date" style="color:var(--text-3)">Loading…</div>';
  fetch(url).then(r => r.json()).then(d => {
    if (d.status === 'ok' && d.items?.length) {
      const item = d.items[0];
      const date = new Date(item.pubDate).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
      const teaser = (item.description || '').replace(/<[^>]*>/g,'').slice(0, 200).trim() + '…';
      container.innerHTML = `
        <div class="signal-post-date">${date}</div>
        <div class="signal-post-title">${item.title}</div>
        <p class="signal-post-teaser">${teaser}</p>
        <a href="${item.link}" target="_blank" rel="noopener" class="btn btn-outline" style="font-size:.78rem">Read on Substack ↗</a>`;
    } else {
      container.innerHTML = substackWidget();
    }
  }).catch(() => { container.innerHTML = substackWidget(); });
}

function substackWidget() {
  return `
    <div class="signal-sub-label" style="margin-bottom:.75rem">Substack · The Blueprint</div>
    <div class="signal-post-title" style="margin-bottom:.75rem">Research notes. No algorithm. Just signal.</div>
    <p class="signal-post-teaser">
      Long-form breakdowns of neuro research — the kind that takes ideas seriously
      and treats you like you can handle the complexity.
    </p>
    <a href="https://myscienceblueprint.substack.com" target="_blank" rel="noopener"
       class="btn btn-outline" style="font-size:.78rem">Subscribe on Substack ↗</a>`;
}

// ── SUBSTACK LIST (signal page) ─────────────────────────────
function loadSubstackList() {
  const list = document.getElementById('substack-list');
  const feed = 'https://myscienceblueprint.substack.com/feed';
  const url  = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}&count=10`;
  fetch(url).then(r => r.json()).then(d => {
    if (d.status === 'ok' && d.items?.length) {
      list.innerHTML = d.items.map(item => {
        const date = new Date(item.pubDate).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
        const teaser = (item.description||'').replace(/<[^>]*>/g,'').slice(0,240).trim()+'…';
        return `<div class="substack-post-card">
          <div class="sp-date">${date}</div>
          <div class="sp-title">${item.title}</div>
          <p class="sp-teaser">${teaser}</p>
          <a href="${item.link}" target="_blank" rel="noopener" class="btn btn-outline" style="font-size:.72rem">Read on Substack ↗</a>
        </div>`;
      }).join('');
    } else { list.innerHTML = substackListPlaceholder(); }
  }).catch(() => { list.innerHTML = substackListPlaceholder(); });
}

function substackListPlaceholder() {
  return `<div class="substack-post-card">
    <div class="sp-title" style="margin-bottom:.65rem">No posts yet — but the first one is close.</div>
    <p class="sp-teaser">
      Subscribe now so you don't miss the first dispatch. When it drops, it goes to
      subscribers first — no feed, no algorithm.
    </p>
    <a href="https://myscienceblueprint.substack.com" target="_blank" rel="noopener"
       class="btn btn-outline" style="font-size:.72rem">Subscribe ↗</a>
  </div>`;
}

// ── VIDEO GRID ──────────────────────────────────────────────
async function loadVideos(container) {
  try {
    const data = await fetch('./data/videos.json').then(r => r.json());
    container.innerHTML = data.videos.map(v => `
      <div class="glass-card video-card fade-in">
        <div class="video-container">
          <iframe src="https://www.youtube.com/embed/${v.id}"
            title="${v.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>
        <div class="video-card-date">${v.date}</div>
        <div class="video-card-title">${v.title}</div>
      </div>`).join('');

    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
      const o = new IntersectionObserver(entries => {
        entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); o.unobserve(e.target); } });
      }, { threshold: 0.08 });
      o.observe(el);
    });
  } catch {
    container.innerHTML = `<p class="text-3" style="text-align:center;grid-column:1/-1;padding:2rem">Could not load videos.</p>`;
  }
}
