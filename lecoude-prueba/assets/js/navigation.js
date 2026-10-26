/* Lecoude — Navigation: fixed header state, scroll progress, mobile menu, scene dots */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const nav = $('#nav'), toggle = $('.nav-toggle'), links = $('#navLinks');
  if (!nav) return;

  /* Mobile menu */
  const focusables = () => $$('a[href], button:not([disabled])', links).concat(toggle);
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('lock', open);
    if (open) { const f = focusables(); if (f.length) f[0].focus(); }
  };
  if (toggle && links) {
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (!nav.classList.contains('open')) return;
      if (e.key === 'Escape') { setMenu(false); toggle.focus(); return; }
      if (e.key === 'Tab') {
        const f = focusables(), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1180 && nav.classList.contains('open')) setMenu(false); });
  }

  /* Scroll progress + nav background */
  const bar = $('#progressBar');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      nav.classList.toggle('scrolled', window.scrollY > 24);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Scene dots (home): highlight the scene in the middle of the viewport */
  const dots = $$('.scene-dots [data-section]');
  if (dots.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        dots.forEach((a) => {
          const on = a.dataset.section === en.target.id;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    dots.forEach((a) => { const el = document.getElementById(a.dataset.section); if (el) io.observe(el); });
  }
})();
