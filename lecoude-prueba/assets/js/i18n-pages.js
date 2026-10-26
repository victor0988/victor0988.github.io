/* Lecoude — Spanish for inner pages.
   English stays in the HTML. This map replaces visible text when lang=es.
   Decorative mockups marked aria-hidden stay as drawn examples. */
(() => {
  'use strict';
  const MAP = window.LECOUDE_ES || {};
  const META = {
    about: {
      title: 'Sobre Lecoude — Empresa de tecnología',
      desc: 'Lecoude es una empresa de tecnología que construye productos digitales, software a la medida, soluciones de IA y plataformas empresariales para operaciones reales.'
    },
    contact: {
      title: 'Contacto Lecoude — Inicia un proyecto',
      desc: 'Contacta a Lecoude sobre productos digitales, software a la medida, implementación de IA o soluciones empresariales.'
    },
    products: {
      title: 'Catálogo — Productos y soluciones | Lecoude',
      desc: 'Catálogo de Lecoude: AI Geo, AI Visibility, AI Engage, AI Health, Kiosco IA y Posicionamiento en IA.'
    },
    digital: {
      title: 'Productos digitales — AI Geo, AI Visibility, AI Engage, AI Health | Lecoude',
      desc: 'Software por suscripción para inteligencia geográfica, visibilidad en buscadores e IA, atención conversacional y gestión clínica.'
    },
    ai: {
      title: 'IA y automatización — AI Engage y Kiosco IA | Lecoude',
      desc: 'Implementación práctica de IA: AI Engage, Kiosco IA, automatización de procesos y agentes empresariales.'
    },
    apps: {
      title: 'Apps y software — Móvil, web y empresarial | Lecoude',
      desc: 'Apps móviles, plataformas web, software empresarial e integraciones diseñadas alrededor de la operación real.'
    },
    enterprise: {
      title: 'Soluciones empresariales — Aviación, salud, retail y operaciones | Lecoude',
      desc: 'Plataformas integradas para aviación, salud, retail y distribución, y operaciones corporativas.'
    },
    geo: {
      title: 'Posicionamiento en IA | Lecoude',
      desc: 'Posicionamiento en IA es el servicio de Lecoude para mejorar cómo los asistentes describen tu marca. AI Visibility solo mide esa presencia. Paquetes publicados desde USD 450.'
    }
  };
  const textOrig = new WeakMap();
  const attrOrig = new WeakMap();

  const collapsed = (s) => s.replace(/\s+/g, ' ').trim();

  const apply = (lang) => {
    const es = lang === 'es';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const el = n.parentElement;
        if (!el) return NodeFilter.FILTER_REJECT;
        const tag = el.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
        if (el.closest('[aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      if (!textOrig.has(n)) textOrig.set(n, n.nodeValue);
      const orig = textOrig.get(n);
      if (!es) { n.nodeValue = orig; return; }
      const hit = MAP[collapsed(orig)];
      if (hit == null) return;
      const lead = orig.match(/^\s*/)[0];
      const trail = orig.match(/\s*$/)[0];
      n.nodeValue = lead + hit + trail;
    });

    document.querySelectorAll('[alt], [aria-label], [title]').forEach((el) => {
      if (el.closest('[aria-hidden="true"]')) return;
      ['alt', 'aria-label', 'title'].forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        if (!attrOrig.has(el)) attrOrig.set(el, {});
        const store = attrOrig.get(el);
        if (store[attr] == null) store[attr] = el.getAttribute(attr);
        const base = store[attr];
        if (!es) { el.setAttribute(attr, base); return; }
        const hit = MAP[collapsed(base)];
        if (hit != null) el.setAttribute(attr, hit);
      });
    });

    const root = document.documentElement;
    if (!root.dataset.titleEn) {
      root.dataset.titleEn = document.title;
      const m = document.querySelector('meta[name="description"]');
      if (m) root.dataset.descEn = m.getAttribute('content') || '';
    }
    const meta = document.querySelector('meta[name="description"]');
    const page = document.body.dataset.page;
    if (es && META[page]) {
      document.title = META[page].title;
      if (meta) meta.setAttribute('content', META[page].desc);
    } else {
      document.title = root.dataset.titleEn || document.title;
      if (meta && root.dataset.descEn != null) meta.setAttribute('content', root.dataset.descEn);
    }
  };

  window.LecoudePages = { apply };
})();
