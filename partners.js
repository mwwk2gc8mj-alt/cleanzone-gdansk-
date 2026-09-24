(() => {
'use strict';
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const form=$('#bookingForm'),select=$('#serviceSelect');
  const menu = $('.menu-toggle');
  const nav = $('#navigation');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Otwórz menu'); nav.classList.remove('open'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu'); nav.classList.toggle('open', open); });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.site-header')) closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

document.querySelectorAll('[data-tier]').forEach(a=>a.addEventListener('click',()=>{select.value=a.dataset.tier;}));
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
      button.disabled = false; button.firstElementChild.textContent = 'Zapytaj o współpracę';
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    data.service = select.selectedOptions[0].textContent;
    data.startedAt = startedAt;
    if (ticket) data.ticket = ticket;
    button.disabled = true; button.firstElementChild.textContent = 'Wysyłanie…';
    try {
      if (ticket && Date.now() - ticketFetchedAt < 1100) await new Promise(resolve => setTimeout(resolve, 1100 - (Date.now() - ticketFetchedAt)));
      const response = await fetch(apiBase + '/api/booking', { method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'omit', body: JSON.stringify(data), signal: AbortSignal.timeout(16000) });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || 'delivery');
      status.className = 'success'; status.textContent = 'Dziękujemy! Zapytanie o współpracę dotarło. Skontaktujemy się, aby ustalić szczegóły.';
      form.reset();
      if (ticket) { ticket = null; ticketFetchedAt = 0; }
      // Conversion fires only after server-confirmed delivery and only if consented analytics was configured separately.
      // Analytics is optional: its failure must never change a confirmed delivery into an error.
      if (typeof window.cleanzoneConfirmedConversion === 'function') {
        try { await window.cleanzoneConfirmedConversion(); } catch (_) { /* Delivery already confirmed. */ }
      }
      try { window.cleanzoneMarkConfirmedLead?.(); } catch (_) { /* Delivery already confirmed. */ }
      try { window.location.assign('/dziekujemy/'); } catch (_) { /* Keep the confirmed-success message. */ }
    } catch (_) {
      if (production) { ticket = null; ticketFetchedAt = 0; }
      status.className = 'error'; status.textContent = 'Nie udało się potwierdzić wysłania. Twoje dane pozostały w formularzu. Zadzwoń: 730 135 133, aby ustalić termin.';
    } finally { button.disabled = false; button.firstElementChild.textContent = 'Zapytaj o współpracę'; }
  });
  form.elements.namedItem('phone').addEventListener('input', e => e.target.setCustomValidity(''));
})();
