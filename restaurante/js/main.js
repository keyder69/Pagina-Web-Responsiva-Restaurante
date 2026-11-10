/* =====================================================
   La Fogata Andina — Interactividad
   ===================================================== */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  document.documentElement.classList.add('js');

  /* ---------- Año del pie de página ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menú adaptable (hamburguesa) ---------- */
  var header = $('.site-header');
  var nav = $('#nav');
  var navToggle = $('#navToggle');

  function setNav(open) {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  navToggle.addEventListener('click', function () {
    setNav(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  // Cerrar al elegir un enlace
  $$('a', nav).forEach(function (link) {
    link.addEventListener('click', function () { setNav(false); });
  });

  // Cerrar con Escape o al pasar a escritorio
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });
  window.matchMedia('(min-width: 960px)').addEventListener('change', function (e) {
    if (e.matches) setNav(false);
  });

  /* ---------- Sombra del encabezado y botón "volver arriba" ---------- */
  var toTop = $('#toTop');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle('is-scrolled', y > 10);
    toTop.hidden = y < 500;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Enlace activo según la sección visible ---------- */
  var navLinks = $$('.nav__list a');
  var sections = navLinks
    .map(function (a) { return $(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Filtro del menú ---------- */
  var tabs = $$('.tab');
  var dishes = $$('.dish');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var filter = tab.getAttribute('data-filter');
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-pressed', String(active));
      });
      dishes.forEach(function (d) {
        var show = filter === 'todos' || d.getAttribute('data-category') === filter;
        d.hidden = !show;
      });
    });
  });

  /* ---------- Tarjetas: ver ingredientes ---------- */
  $$('.dish__more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var details = btn.parentElement.querySelector('.dish__details');
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.textContent = open ? 'Ver ingredientes' : 'Ocultar ingredientes';
      details.hidden = open;
    });
  });

  /* ---------- Preguntas frecuentes (acordeón) ---------- */
  var faqButtons = $$('.faq__q');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      faqButtons.forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        document.getElementById(b.getAttribute('aria-controls')).hidden = true;
      });
      if (!open) {
        btn.setAttribute('aria-expanded', 'true');
        document.getElementById(btn.getAttribute('aria-controls')).hidden = false;
      }
    });
  });

  /* ---------- Galería con lightbox ---------- */
  var lightbox = $('#lightbox');
  var lbImg = $('#lightboxImg');
  var lbCaption = $('#lightboxCaption');

  $$('.gallery__item').forEach(function (item) {
    item.addEventListener('click', function () {
      var img = $('img', item);
      lbImg.src = item.getAttribute('data-full');
      lbImg.alt = img ? img.alt : '';
      lbCaption.textContent = item.getAttribute('data-caption') || '';
      if (typeof lightbox.showModal === 'function') {
        lightbox.showModal();
      } else {
        lightbox.setAttribute('open', '');
      }
    });
  });

  $('#lightboxClose').addEventListener('click', function () { lightbox.close(); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) lightbox.close(); // clic en el fondo
  });

  /* ---------- Formulario de reservas ---------- */
  var form = $('#bookingForm');
  var success = $('#formSuccess');
  var dateInput = $('#fecha');

  function pad(n) { return String(n).padStart(2, '0'); }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  dateInput.min = todayISO();

  function setError(input, message) {
    var field = input.closest('.field');
    var out = document.getElementById(input.id + '-error');
    field.classList.toggle('has-error', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (out) out.textContent = message || '';
    return !message;
  }

  var validators = {
    nombre: function (el) {
      var v = el.value.trim();
      if (v.length < 3) return setError(el, 'Escribe tu nombre completo (mínimo 3 letras).');
      return setError(el, '');
    },
    correo: function (el) {
      var v = el.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return setError(el, 'Ingresa un correo válido, por ejemplo nombre@correo.com.');
      return setError(el, '');
    },
    telefono: function (el) {
      var digits = el.value.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 13) return setError(el, 'Ingresa un teléfono válido (7 a 13 dígitos).');
      return setError(el, '');
    },
    fecha: function (el) {
      if (!el.value) return setError(el, 'Selecciona la fecha de tu reserva.');
      if (el.value < todayISO()) return setError(el, 'La fecha no puede estar en el pasado.');
      // getDay() en horario local: 1 = lunes (cerrado)
      var parts = el.value.split('-');
      var day = new Date(+parts[0], +parts[1] - 1, +parts[2]).getDay();
      if (day === 1) return setError(el, 'Los lunes permanecemos cerrados. Elige otro día.');
      return setError(el, '');
    }
  };

  Object.keys(validators).forEach(function (name) {
    var el = form.elements[name];
    el.addEventListener('blur', function () { validators[name](el); });
    el.addEventListener('input', function () {
      if (el.closest('.field').classList.contains('has-error')) validators[name](el);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    success.hidden = true;

    var firstInvalid = null;
    Object.keys(validators).forEach(function (name) {
      var el = form.elements[name];
      if (!validators[name](el) && !firstInvalid) firstInvalid = el;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var parts = form.elements.fecha.value.split('-');
    var fecha = new Date(+parts[0], +parts[1] - 1, +parts[2]).toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    var personas = form.elements.personas.selectedOptions[0].textContent;
    var hora = form.elements.hora.selectedOptions[0].textContent;

    success.textContent = '¡Gracias, ' + form.elements.nombre.value.trim().split(' ')[0] +
      '! Recibimos tu solicitud para ' + personas + ' el ' + fecha + ' a las ' + hora +
      '. Te confirmaremos muy pronto.';
    success.hidden = false;
    form.reset();
    form.elements.personas.value = '2';
    form.elements.hora.value = '13:00';
    $$('.field', form).forEach(function (f) { f.classList.remove('has-error'); });
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  /* ---------- Animación de aparición al hacer scroll ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
