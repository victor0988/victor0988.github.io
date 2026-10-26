/* Lecoude — Motion system
   - Particle field (canvas.particles)
   - Device ecosystem fit (.eco)
   - GSAP ScrollTrigger scenes, declared in markup with data-scene="…"
       hero   : floating interfaces converge into one ecosystem (home)
       dash   : wireframe dashboard becomes a real product
       eco    : devices assemble into a connected ecosystem
       hub    : applications connect to an AI agent
       board  : enterprise operations board comes online
       track  : horizontal journey through industries
       globe  : everything connects into one ecosystem
     Add data-pin to a scene's <section> to pin it on desktop.
   - Scrubbed reveals: data-reveal (children as a group) / data-reveal="each"
   - Steps connector (.steps-line), product shots (.shot[data-tilt]), intro (data-intro)
   Respects prefers-reduced-motion: everything stays static and fully visible. */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Fit the device ecosystem to its container ---------- */
  const fitEco = () => {
    $$('.eco').forEach((eco) => {
      const byW = eco.clientWidth / 1000;
      const byH = window.innerWidth >= 960 ? Math.max(0.55, (window.innerHeight - 340) / 520) : 1;
      const s = Math.max(0.3, Math.min(1, byW, byH));
      eco.style.setProperty('--s', s.toFixed(3));
      eco.style.height = Math.round(520 * s) + 'px';
    });
  };
  fitEco();
  window.addEventListener('resize', fitEco);

  /* ---------- Particle field ---------- */
  $$('canvas.particles').forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const density = parseFloat(canvas.dataset.density || '1');
    let w = 0, h = 0, pts = [], raf = 0, running = false, mx = 0.5, my = 0.5;
    const draw = (move) => {
      ctx.clearRect(0, 0, w, h);
      const ox = (mx - 0.5) * 24, oy = (my - 0.5) * 24;
      for (const p of pts) {
        if (move) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
        }
        p.px = p.x + ox * p.z; p.py = p.y + oy * p.z;
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = a.px - b.px, dy = a.py - b.py, d2 = dx * dx + dy * dy;
          if (d2 < 15000) {
            ctx.strokeStyle = 'rgba(' + skyRGB + ',' + (0.12 * (1 - d2 / 15000)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = 'rgba(' + (p.z > 0.7 ? '255,255,255' : skyRGB) + ',' + (0.35 + p.z * 0.55).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(p.px, p.py, p.r, 0, Math.PI * 2); ctx.fill();
      }
    };
    let skyRGB = '124,183,255';
    const resize = () => {
      skyRGB = (getComputedStyle(document.body).getPropertyValue('--sky-rgb') || skyRGB).trim() || skyRGB;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(window.innerWidth < 700 ? 45 : 110, (w * h) / 15000) * density);
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.4 + 0.4, z: Math.random()
      }));
      draw(false);
    };
    const loop = () => { draw(true); raf = requestAnimationFrame(loop); };
    const start = () => { if (running || reduceMQ.matches || document.hidden) return; running = true; raf = requestAnimationFrame(loop); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    new IntersectionObserver((e) => { e[0].isIntersecting ? start() : stop(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
    window.addEventListener('pointermove', (e) => { mx = e.clientX / window.innerWidth; my = e.clientY / window.innerHeight; }, { passive: true });
    if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', () => { reduceMQ.matches ? (stop(), draw(false)) : start(); });
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    resize();
  });

  /* ================= GSAP scroll storytelling ================= */
  if (!window.gsap || !window.ScrollTrigger) { document.documentElement.classList.remove('motion'); return; }
  gsap.registerPlugin(ScrollTrigger);

  const DRAW = { strokeDashoffset: 1 };
  const DRAWN = { strokeDashoffset: 0 };
  /* Scene timeline: scroll-scrubbed (optionally pinned), or autoplayed on load for page heroes (data-autoplay) */
  const sceneTL = (root, isDesktop, mobileTrigger, len) => {
    const auto = root.hasAttribute('data-autoplay');
    const tl = gsap.timeline({ defaults: { ease: 'none' }, delay: auto ? 0.3 : 0, scrollTrigger: auto ? undefined : sceneST(root, isDesktop, mobileTrigger, len) });
    root._tl = tl;
    return tl;
  };
  const sceneST = (root, isDesktop, mobileTrigger, len) => (isDesktop && root.hasAttribute('data-pin'))
    ? { trigger: root, start: 'top top', end: '+=' + (len || 130) + '%', scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true }
    : { trigger: mobileTrigger || root, start: 'top 85%', end: 'bottom 60%', scrub: 1 };

  /* Generic scrubbed reveals */
  function reveals() {
    $$('[data-reveal]').forEach((group) => {
      const kids = Array.from(group.children);
      if (group.dataset.reveal === 'each') {
        kids.forEach((el) => gsap.fromTo(el, { y: 48, opacity: 0 }, {
          y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 68%', scrub: 1 }
        }));
      } else {
        gsap.fromTo(kids, { y: 36, opacity: 0 }, {
          y: 0, opacity: 1, stagger: 0.08, ease: 'none',
          scrollTrigger: { trigger: group, start: 'top 88%', end: 'top 45%', scrub: 1 }
        });
      }
    });
    $$('.steps').forEach((s) => {
      const line = $('.steps-line i', s);
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: s, start: 'top 85%', end: 'bottom 60%', scrub: 1 } });
      if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
      tl.fromTo($$('.step', s), { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.3 }, 0);
    });
    $$('.shot[data-tilt]').forEach((el) => gsap.fromTo(el,
      { rotationX: 12, rotationY: el.dataset.tilt === 'r' ? 14 : -14, scale: 0.92, opacity: 0.4 },
      { rotationX: 0, rotationY: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 92%', end: 'center 55%', scrub: 1 } }));
  }

  /* Page intro (above-the-fold copy) */
  function intro() {
    const kids = $$('[data-intro] > *');
    if (kids.length) gsap.from(kids, { y: 28, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.1, clearProps: 'transform,opacity' });
  }

  const scenes = {
    /* Floating interfaces converge into one ecosystem */
    hero(root, isDesktop) {
      const stage = $('.hero-stage', root);
      const cards = $$('.fl', root).filter((el) => getComputedStyle(el).display !== 'none');
      cards.forEach((el) => gsap.set(el, { rotation: +el.dataset.r || 0 }));
      const target = (el) => {
        const cx = stage.clientWidth / 2, cy = stage.clientHeight / 2;
        const ex = el.offsetLeft + el.offsetWidth / 2, ey = el.offsetTop + el.offsetHeight / 2;
        const ang = Math.atan2(ey - cy, ex - cx);
        const rx = Math.min(stage.clientWidth * (isDesktop ? 0.31 : 0.42), 440);
        const ry = Math.min(stage.clientHeight * 0.31, 270);
        return { x: cx + Math.cos(ang) * rx - ex, y: cy + Math.sin(ang) * ry - ey };
      };
      const core = $('.hero-core', root);
      const isCore = core && core.classList.contains('core');
      if (isCore) gsap.set(core, { xPercent: -50, yPercent: -50 });
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root, start: 'top top', end: isDesktop ? '+=140%' : '+=110%', scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => { if (core) core.classList.toggle('is-on', self.progress > 0.42); }
        }
      })
        .to($('.hero-copy', root), { y: -70, opacity: 0, duration: 0.45 }, 0)
        .to($('.scroll-hint', root), { opacity: 0, duration: 0.15 }, 0)
        .to($('.hero-glow', root), { scale: 1.35, opacity: 1, duration: 1 }, 0)
        .to(cards, { x: (i, el) => target(el).x, y: (i, el) => target(el).y, rotation: 0, scale: isDesktop ? 0.8 : 0.7, opacity: isCore ? 0.28 : 1, duration: 1, ease: 'power1.inOut' }, 0);
      if (isCore) {
        tl.fromTo(core, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }, 0.3)
          .fromTo($$('.core-head > *', core), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.05 }, 0.4)
          .fromTo($$('.core-tile', core), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.07, ease: 'power2.out' }, 0.48)
          .fromTo($$('.core-foot', core), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.8)
          .to({}, { duration: 0.45 }); // hold: let the core rest on screen before moving on
        /* Keyboard: focusing a pillar scrolls the core into its visible state */
        core.addEventListener('focusin', () => {
          const st = tl.scrollTrigger;
          if (st && st.progress < 0.7) window.scrollTo(0, st.start + (st.end - st.start) * 0.78);
        });
        $$('[data-scroll-core]').forEach((a) => a.addEventListener('click', (e) => {
          const st = tl.scrollTrigger;
          if (!st) return;
          e.preventDefault();
          window.scrollTo({ top: st.start + (st.end - st.start) * 0.78, behavior: 'smooth' });
        }));
      } else if (core) {
        tl.fromTo(core, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.5 }, 0.4)
          .fromTo($$('.hero-core .tile', root), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 }, 0.55);
      }
    },

    /* Wireframe dashboard becomes a real product */
    dash(root, isDesktop, cleanups) {
      const dash = $('.dash', root);
      const tl = sceneTL(root, isDesktop, $('.visual', root));
      tl.fromTo(dash, { rotationX: 14, rotationY: -16, scale: 0.92 }, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.5, ease: 'power1.out' }, 0)
        .fromTo($('.dash-wire', root), { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0.22)
        .fromTo($('.dash-real', root), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.22)
        .fromTo($$('.kpi', root), { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.25 }, 0.32)
        .fromTo($$('.chart .line', root), DRAW, Object.assign({ duration: 0.45 }, DRAWN), 0.42)
        .fromTo($$('.chart .area', root), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.6)
        .fromTo($$('.row .bar i', root), { scaleX: 0 }, { scaleX: 1, stagger: 0.06, duration: 0.3 }, 0.55)
        .fromTo($$('.sc-a', root), { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, 0.7)
        .fromTo($$('.sc-b', root), { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, 0.76);
      $$('[data-count]', root).forEach((el) => {
        const orig = el.textContent, t = +el.dataset.count;
        const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
        const o = { v: 0 };
        const fmt = () => { el.textContent = pre + Math.round(o.v).toLocaleString('en-US') + suf; };
        fmt();
        tl.to(o, { v: t, duration: 0.4, onUpdate: fmt }, 0.36);
        cleanups.push(() => { el.textContent = orig; });
      });
    },

    /* Devices assemble into a connected ecosystem */
    eco(root, isDesktop) {
      const tl = sceneTL(root, isDesktop, $('.eco', root), 140);
      $$('.dev', root).forEach((el, i) => {
        const d = el.dataset;
        tl.fromTo(el,
          { x: +d.x || 0, y: +d.y || 0, z: +d.z || 0, rotationX: +d.rx || 0, rotationY: +d.ry || 0, rotation: +d.rz || 0, opacity: 0.2 },
          { x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotation: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, i * 0.06);
      });
      tl.fromTo($$('.br-hero, .br-card, .br-table > div', root), { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.03, duration: 0.2 }, 0.4)
        .fromTo($$('.eco-lines path', root), DRAW, Object.assign({ duration: 0.3, stagger: 0.05 }, DRAWN), 0.6)
        .fromTo($$('.eco-lines circle', root), { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.12, stagger: 0.03 }, 0.78);
    },

    /* Applications connect to intelligent agents */
    hub(root, isDesktop) {
      sceneTL(root, isDesktop, $('.ai-visual', root))
        .fromTo($('.hub-core', root), { scale: 0.6, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.3 }, 0)
        .fromTo($$('.hub .orbit', root), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
        .fromTo($$('.node-pill', root), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.05, duration: 0.2, ease: 'back.out(2)' }, 0.1)
        .fromTo($$('.hub .spoke', root), DRAW, Object.assign({ stagger: 0.05, duration: 0.25 }, DRAWN), 0.25)
        .fromTo($$('.hub .pulses', root), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.6)
        .fromTo($$('.human', root), { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, 0.5)
        .fromTo($$('.bubble', root), { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.2 }, 0.65);
    },

    /* Enterprise operations board comes online */
    board(root, isDesktop) {
      const card = $('.board', root);
      sceneTL(root, isDesktop, card)
        .fromTo(card, { rotationX: 12, rotationY: 16, scale: 0.92 }, { rotationX: 0, rotationY: 0, scale: 1, duration: 0.5, ease: 'power1.out' }, 0)
        .fromTo($$('.board-rings .ring-v', root), { strokeDasharray: '0 100' }, { strokeDasharray: (i, el) => getComputedStyle(el).getPropertyValue('--v').trim() + ' 100', stagger: 0.06, duration: 0.35 }, 0.15)
        .fromTo($$('.b-row:not(.b-head)', root), { x: 24, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.06, duration: 0.25 }, 0.3)
        .fromTo($$('.b-row .bar i', root), { scaleX: 0 }, { scaleX: 1, stagger: 0.06, duration: 0.3 }, 0.4)
        .fromTo($$('.alert', root), { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.2 }, 0.65);
    },

    /* Horizontal journey through industries */
    track(root, isDesktop, cleanups) {
      const track = $('.ind-track', root), vp = $('.ind-viewport', root);
      const panels = $$('.ind', root), count = $('[data-ind-count]', root), barEl = $('[data-ind-bar]', root);
      if (isDesktop) {
        track.classList.add('h');
        cleanups.push(() => track.classList.remove('h'));
        const dist = () => {
          const cs = getComputedStyle(vp);
          const visible = vp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
          return Math.max(0, track.scrollWidth - visible);
        };
        gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: {
            trigger: root, start: 'top top', end: () => '+=' + Math.max(dist(), window.innerHeight * 0.6),
            scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => {
              const i = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)));
              if (count) count.textContent = String(i + 1).padStart(2, '0');
              if (barEl) barEl.style.transform = 'scaleX(' + self.progress.toFixed(3) + ')';
              panels.forEach((p, j) => p.classList.toggle('is-active', j === i));
            }
          }
        });
      } else {
        panels.forEach((p) => gsap.fromTo(p, { y: 50, opacity: 0 }, {
          y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 92%', end: 'top 60%', scrub: 1 }
        }));
      }
    },

    /* Everything connects into one ecosystem */
    globe(root) {
      const g = $('.globe', root);
      (root.hasAttribute('data-autoplay') ? (root._tl = gsap.timeline({ defaults: { ease: 'none' }, delay: 0.3 })) : gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: g, start: 'top 90%', end: 'center 50%', scrub: 1 } }))
        .fromTo($$('.g-ring', g), DRAW, Object.assign({ stagger: 0.05, duration: 0.4 }, DRAWN), 0)
        .fromTo($$('.g-link', g), DRAW, Object.assign({ stagger: 0.03, duration: 0.3 }, DRAWN), 0.3)
        .fromTo($$('.g-node', g), { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, stagger: 0.05, duration: 0.2 }, 0.35)
        .fromTo($$('.g-core', g), { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.3 }, 0.5);
    }
  };

  const mm = gsap.matchMedia();
  mm.add({ isDesktop: '(min-width: 960px)', isMobile: '(max-width: 959px)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
    const { isDesktop, reduce } = ctx.conditions;
    if (reduce) { document.documentElement.classList.remove('motion'); return; } // static, fully visible layout
    document.documentElement.classList.add('motion');
    const cleanups = [];
    intro();
    $$('[data-scene]').forEach((root) => {
      const fn = scenes[root.dataset.scene];
      if (fn) fn(root, isDesktop, cleanups);
      if (root.hasAttribute('data-autoplay') && root._tl) {
        const tl = root._tl;
        tl.timeScale(tl.duration() / 2.4);
        /* gentle drift of the hero visual while scrolling away */
        const vis = root.querySelector('.visual, .eco, .globe');
        if (vis) gsap.to(vis, { y: -60, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: 1 } });
      }
    });
    reveals();
    ScrollTrigger.sort();
    return () => cleanups.forEach((fn) => fn());
  });

  const refresh = () => { fitEco(); ScrollTrigger.sort(); ScrollTrigger.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener('load', refresh);
})();
