(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (window.initCleaningScene) window.initCleaningScene($('#cleaning-story'));

  const menu = $('.menu-toggle');
  const nav = $('#navigation');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Otwórz menu'); nav.classList.remove('open'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu'); nav.classList.toggle('open', open); });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.site-header')) closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

  const hero = $('.hero'); const ribbon = $('.ribbon-track');
  let raf = 0;
  function paintScroll() {
    raf = 0; if (reduced.matches) return;
    const y = window.scrollY; const height = hero.offsetHeight;
    if (y < height + 100) {
      const progress = Math.min(y / height, 1);
      hero.style.setProperty('--hero-y', `${progress * 75}px`);
      hero.style.setProperty('--hero-rotate', `${progress * -5}deg`);
      hero.style.setProperty('--hero-scale', String(1 + progress * .08));
      hero.style.setProperty('--badge-y', `${progress * -55}px`);
    }
    const rect = $('.service-ribbon').getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight) ribbon.style.setProperty('--ribbon-x', `${-y * .22}px`);
  }
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paintScroll); }, { passive: true });
  reduced.addEventListener('change', paintScroll); paintScroll();

  $$('.price-filters button').forEach(button => button.addEventListener('click', () => {
    $$('.price-filters button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $$('.price-card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
  }));

  const chosen = new Map(); const form = $('#bookingForm'); const select = $('#serviceSelect');
  const summary = $('#selectionSummary'); const toast = $('.selection-toast'); let toastTimer;
  function renderSelection() {
    summary.replaceChildren(); summary.hidden = chosen.size === 0;
    if (chosen.size) {
      const heading = document.createElement('strong'); heading.textContent = 'Wybrane meble: '; summary.append(heading, [...chosen.values()].join(', '));
      summary.append(document.createElement('br'));
      const clear = document.createElement('button'); clear.type = 'button'; clear.textContent = 'Wyczyść wybór';
      clear.addEventListener('click', () => { chosen.clear(); select.value = ''; renderSelection(); }); summary.append(clear);
    }
    $$('.choose-service').forEach(b => { const active = chosen.has(b.dataset.service); b.setAttribute('aria-pressed', String(active)); b.closest('.price-card').classList.toggle('selected', active); b.querySelector('span:last-child').textContent = active ? '✓' : '↗'; });
    if (chosen.size === 1) select.value = [...chosen.keys()][0];
    if (chosen.size > 1) select.value = 'multiple';
    if (!chosen.size) { toast.hidden = true; }
  }
  $$('.choose-service').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.service;
    if (chosen.has(id)) { chosen.delete(id); if (!chosen.size) select.value = ''; }
    else chosen.set(id, button.closest('.price-card').querySelector('h3').textContent);
    renderSelection();
    if (chosen.size) { $('#toastText').textContent = `Wybrano: ${[...chosen.values()].join(', ')}`; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 6500); }
  }));
  select.addEventListener('change', () => {
    // A manual selection replaces the earlier set, including the generic "several items" option.
    chosen.clear();
    const card = document.getElementById('price-' + select.value);
    if (card) chosen.set(select.value, card.querySelector('h3').textContent);
    renderSelection();
  });
  $('.selection-toast a').addEventListener('click', () => { toast.hidden = true; });

  $$('.compare-images input').forEach(range => { range.addEventListener('input', () => range.closest('.compare-images').style.setProperty('--split', `${range.value}%`)); });
  const dock = $('.mobile-dock');
  const dockObserver = new IntersectionObserver(entries => { dock.classList.toggle('dock-hidden', entries[0].isIntersecting); }, { threshold: .1 }); dockObserver.observe(form);

  const dialog = $('#privacyDialog');
  $$('.privacy-open').forEach(button => button.addEventListener('click', () => dialog.showModal()));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); });

  const apiBase = document.querySelector('meta[name="cleanzone-api"]')?.content || '';
  const production = document.body.dataset.release === 'production';
  let bookingEnabled = false, ticket = null, ticketFetchedAt = 0;
  async function loadBookingConfig() {
    if (location.protocol === 'file:') return;
    try {
      const response = await fetch(apiBase + '/api/config', { headers: {Accept: 'application/json'}, credentials: 'omit', signal: AbortSignal.timeout(10000) });
      const config = response.ok ? await response.json() : {};
      bookingEnabled = config.bookingEnabled === true;
      ticket = config.ticket || null; ticketFetchedAt = Date.now();
    } catch (_) { bookingEnabled = false; ticket = null; }
    $('#previewNotice').hidden = bookingEnabled;
    if (production && !bookingEnabled) $('#previewNotice').textContent = 'Formularz jest chwilowo niedostępny. Zadzwoń: 730 135 133.';
  }
  const configReady = loadBookingConfig();
  const startedAt = Date.now();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const phoneInput = form.elements.namedItem('phone'); const digits = phoneInput.value.replace(/\D/g, '');
    phoneInput.setCustomValidity(/^[+\d\s()\-]+$/.test(phoneInput.value.trim()) && digits.length >= 9 && digits.length <= 15 ? '' : 'Wpisz poprawny numer telefonu (9–15 cyfr).');
    if (!form.reportValidity()) return;
    const status = $('#bookingStatus'); const button = $('.submit-button');
    if (button.disabled) return;
    button.disabled = true; button.firstElementChild.textContent = 'Wysyłanie…';
    status.className = ''; status.textContent = '';
    await configReady;
    if (production && (!bookingEnabled || Date.now() - ticketFetchedAt > 12 * 60 * 1000)) await loadBookingConfig();
    if (!bookingEnabled) {
      status.className = 'error';
      status.textContent = production ? 'Formularz jest chwilowo niedostępny. Zapytanie nie zostało wysłane. Zadzwoń: 730 135 133.' : 'To podgląd nowej strony — zapytanie nie zostało wysłane. Aby zamówić usługę teraz, zadzwoń: 730 135 133.';
      button.disabled = false; button.firstElementChild.textContent = 'Wyślij zapytanie';
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const selectedDescription = [...chosen.values()].join(', ');
    data.service = selectedDescription || select.selectedOptions[0].textContent;
    data.startedAt = startedAt;
    if (ticket) data.ticket = ticket;
    button.disabled = true; button.firstElementChild.textContent = 'Wysyłanie…';
    try {
      if (ticket && Date.now() - ticketFetchedAt < 1100) await new Promise(resolve => setTimeout(resolve, 1100 - (Date.now() - ticketFetchedAt)));
      const response = await fetch(apiBase + '/api/booking', { method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'omit', body: JSON.stringify(data), signal: AbortSignal.timeout(16000) });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'delivery');
      status.className = 'success'; status.textContent = 'Dziękujemy! Zapytanie dotarło. Skontaktujemy się, aby potwierdzić cenę i termin.';
      form.reset(); chosen.clear(); renderSelection();
      if (ticket) { ticket = null; ticketFetchedAt = 0; }
      // Conversion fires only after server-confirmed delivery and only if consented analytics was configured separately.
      // Analytics is optional: its failure must never change a confirmed delivery into an error.
      if (typeof window.cleanzoneConfirmedConversion === 'function') {
        try { await window.cleanzoneConfirmedConversion(); } catch (_) { /* Delivery already confirmed. */ }
      }
    } catch (_) {
      if (production) { ticket = null; ticketFetchedAt = 0; }
      status.className = 'error'; status.textContent = 'Nie udało się potwierdzić wysłania. Twoje dane pozostały w formularzu. Zadzwoń: 730 135 133, aby ustalić termin.';
    } finally { button.disabled = false; button.firstElementChild.textContent = 'Wyślij zapytanie'; }
  });
  form.elements.namedItem('phone').addEventListener('input', e => e.target.setCustomValidity(''));
})();
