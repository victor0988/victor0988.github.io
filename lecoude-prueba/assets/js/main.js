/* Lecoude — Site behaviors: FAQ accordion, catalog filters, contact form, year.
   The contact form does not deliver messages until Victor sets an official inbox
   and a backend. Do not point it at another brand. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------
     CONFIG — values Victor must replace. Anything containing
     TODO_VICTOR is shown as a placeholder and is not a live contact.
     --------------------------------------------------------------- */
  var SITE_CONFIG = {
    contactEmail: 'TODO_VICTOR',
    phone: 'TODO_VICTOR',
    whatsapp: 'TODO_VICTOR',
    address: 'TODO_VICTOR'
  };

  var COPY = {
    en: {
      errName: 'Please enter your name.',
      errEmail: 'Please enter a valid email address.',
      errMsg: 'Please tell us a little more (at least 10 characters).',
      notSent: 'TODO_VICTOR: this message was not sent. The official Lecoude inbox and a form backend are not connected. Nothing was stored and nothing was delivered.',
      blocked: 'This message could not be prepared.',
      shownOne: '1 item shown',
      shownMany: ' items shown'
    },
    es: {
      errName: 'Escribe tu nombre.',
      errEmail: 'Escribe un correo válido.',
      errMsg: 'Cuéntanos un poco más (al menos 10 caracteres).',
      notSent: 'TODO_VICTOR: este mensaje no se envió. Falta el correo oficial de Lecoude y un backend del formulario. No se guardó ni se entregó nada.',
      blocked: 'No se pudo preparar este mensaje.',
      shownOne: '1 elemento visible',
      shownMany: ' elementos visibles'
    }
  };

  var lang = function () {
    return document.documentElement.lang === 'es' ? 'es' : 'en';
  };
  var t = function (key) { return COPY[lang()][key]; };
  var ready = function (value) {
    return !!value && value.indexOf('TODO_VICTOR') === -1;
  };

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var paintContacts = function () {
    document.querySelectorAll('[data-contact-email]').forEach(function (el) {
      if (ready(SITE_CONFIG.contactEmail)) {
        el.textContent = SITE_CONFIG.contactEmail;
        el.setAttribute('href', 'mailto:' + SITE_CONFIG.contactEmail);
      } else {
        el.textContent = 'TODO_VICTOR';
        el.setAttribute('href', 'contact.html#correo');
        el.removeAttribute('target');
      }
    });
    document.querySelectorAll('[data-contact-phone]').forEach(function (el) {
      el.textContent = SITE_CONFIG.phone;
    });
    document.querySelectorAll('[data-contact-whatsapp]').forEach(function (el) {
      el.textContent = SITE_CONFIG.whatsapp;
    });
    document.querySelectorAll('[data-contact-address]').forEach(function (el) {
      el.textContent = SITE_CONFIG.address;
    });
  };
  paintContacts();
  document.addEventListener('aih:lang', paintContacts);

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll('.faq-item').forEach(function (item, i) {
    var btn = item.querySelector('.faq-q');
    var panel = item.querySelector('.faq-a');
    if (!btn || !panel) return;
    var id = panel.id || ('faq-panel-' + i + '-' + Math.random().toString(36).slice(2, 7));
    panel.id = id;
    btn.setAttribute('aria-controls', id);
    btn.setAttribute('aria-expanded', 'false');
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', btn.id || (btn.id = id + '-btn'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('open', !open);
    });
  });

  /* ---------------- Catalog filters ---------------- */
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var items = document.querySelectorAll('[data-category]');
    var refreshST = function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); };
    var status = document.querySelector('[data-filter-status]');
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      var f = btn.getAttribute('data-filter');
      filterBar.querySelectorAll('[data-filter]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      var shown = 0;
      items.forEach(function (it) {
        var cats = it.getAttribute('data-category').split(' ');
        var match = f === 'all' || cats.indexOf(f) !== -1;
        it.hidden = !match;
        if (match) { shown++; it.style.opacity = ''; it.style.transform = ''; }
      });
      refreshST();
      if (status) status.textContent = shown === 1 ? t('shownOne') : (shown + t('shownMany'));
    });
  }

  /* ---------------- Contact form ----------------
     No backend. Validate, then say clearly that nothing was sent.
     A honeypot is in place for when a backend is connected. */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var statusEl = form.querySelector('.form-status');
    var draftEl = form.querySelector('.form-draft');

    var setError = function (field, msg) {
      var input = form.querySelector('[name="' + field + '"]');
      var err = form.querySelector('[data-error-for="' + field + '"]');
      if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg || '';
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var company = (data.get('company') || '').toString().trim();
      var interest = (data.get('interest') || '').toString().trim();
      var message = (data.get('message') || '').toString().trim();
      var trap = (data.get('website') || '').toString().trim();

      if (trap) {
        if (statusEl) statusEl.textContent = t('blocked');
        if (draftEl) draftEl.textContent = '';
        return;
      }

      var ok = true;
      setError('name', name ? '' : t('errName'));
      if (!name) ok = false;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setError('email', emailOk ? '' : t('errEmail'));
      if (!emailOk) ok = false;
      setError('message', message.length >= 10 ? '' : t('errMsg'));
      if (message.length < 10) ok = false;

      if (!ok) {
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        if (draftEl) draftEl.textContent = '';
        return;
      }

      var draft =
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        (company ? 'Company: ' + company + '\n' : '') +
        (interest ? 'Interest: ' + interest + '\n' : '') +
        '\n' + message + '\n';

      if (statusEl) statusEl.textContent = t('notSent');
      if (draftEl) draftEl.textContent = draft;
    });
  }

  /* Pre-select interest from ?interest= query param (e.g. links from pillar pages) */
  var params = new URLSearchParams(location.search);
  var preset = params.get('interest');
  var sel = document.querySelector('select[name="interest"]');
  if (preset && sel) {
    Array.prototype.forEach.call(sel.options, function (o) {
      if (o.value === preset) sel.value = preset;
    });
  }
})();
