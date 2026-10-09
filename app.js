(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (window.initCleaningScene) window.initCleaningScene($('#cleaning-story'));
  if (window.initDryingScene) window.initDryingScene($('#drying-story'));

  const menu = $('.menu-toggle');
  const nav = $('#navigation');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Otwórz menu'); nav.classList.remove('open'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu'); nav.classList.toggle('open', open); });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.site-header')) closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

  const hero = $('.hero'); const ribbon = $('.ribbon-track');
  const sofa = $('.hero-sofa'), badge = $('.floating-price'), note = $('.material-note');
  const ribbonHost = $('.service-ribbon');
  let raf = 0, heroHeight = hero.offsetHeight, lastHeroProgress = -1;
  function paintScroll() {
    raf = 0;
    if (reduced.matches) {
      sofa.style.transform = badge.style.transform = note.style.transform = ribbon.style.transform = '';
      lastHeroProgress = -1;
      return;
    }
    // Read geometry before writing styles; keep transforms on the moving layers.
    const y = window.scrollY, rect = ribbonHost.getBoundingClientRect();
    const progress = Math.min(Math.max(y / Math.max(1, heroHeight), 0), 1);
    if (progress !== lastHeroProgress) {
      sofa.style.transform = `translate3d(0,${progress * 75}px,0) rotateZ(${progress * -5}deg) scale(${1 + progress * .08})`;
      badge.style.transform = `translate3d(0,${progress * -55}px,0) rotate(-4deg)`;
      note.style.transform = `translate3d(0,${progress * -55}px,0)`;
      lastHeroProgress = progress;
    }
    if (rect.bottom > 0 && rect.top < innerHeight) ribbon.style.transform = `translate3d(${-y * .22}px,0,0)`;
  }
  const scheduleScroll = () => { if (!raf) raf = requestAnimationFrame(paintScroll); };
  addEventListener('scroll', scheduleScroll, { passive: true });
  const measureHero = () => { heroHeight = hero.offsetHeight; scheduleScroll(); };
  addEventListener('resize', measureHero, { passive: true });
  if (typeof ResizeObserver === 'function') new ResizeObserver(measureHero).observe(hero);
  reduced.addEventListener('change', scheduleScroll); paintScroll();

  $$('.price-filters button').forEach(button => button.addEventListener('click', () => {
    $$('.price-filters button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $$('.price-card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
  }));

  // The service ribbon uses the same filters, without selecting a service for the visitor.
  $$('[data-price-filter]').forEach(link => link.addEventListener('click', () => {
    const filter = $('.price-filters button[data-filter="' + link.dataset.priceFilter + '"]');
    filter?.click();
  }));

  const chosen = new Map(); const form = $('#bookingForm'); const select = $('#serviceSelect');
  const summary = $('#selectionSummary'); const toast = $('.selection-toast');
  const drying = $('#expressDrying');
  const firstOrder = $('#firstOrder');
  function dryingSubtotal() {
    return window.cleanzoneDryingPrice.selection(chosen.size ? [...chosen.keys()] : select.value ? [select.value] : []);
  }
  function renderDrying() {
    const subtotal = dryingSubtotal();
    const quote = subtotal === null ? null : window.cleanzoneDryingPrice.quote(subtotal, drying.checked, firstOrder.checked);
    const free = quote !== null && quote.cleaning >= 400;
    $('#firstOrderEstimate').textContent = firstOrder.checked
      ? quote ? `Pranie po rabacie od ${quote.cleaning} zł. Minimum po rabacie: 150 zł. Cenę i rabat potwierdzimy przed wizytą.`
        : '20% rabatu na pranie według aktualnego cennika; minimum po rabacie: 150 zł. Wycena i rabat do potwierdzenia przed wizytą.'
      : 'Zaznacz, jeśli zamawiasz w CleanZone po raz pierwszy. Rabat potwierdzimy przed wizytą.';
    $('#dryingOptionLabel').textContent = free ? 'Ekspresowe suszenie — GRATIS ✓' : 'Ekspresowe suszenie +50 zł';
    let copy = 'Ostateczną cenę prania i suszenia potwierdzimy przed wizytą.';
    if (drying.checked && subtotal !== null) {
      copy = `Wybrane meble: pranie ${firstOrder.checked ? 'po rabacie ' : ''}od ${quote.cleaning} zł. Suszenie: ${free ? 'GRATIS' : '+50 zł jednorazowo'}. `;
      // Range/from prices may cross the free-drying threshold: do not show a false minimum total.
      copy += free ? 'Próg 400 zł osiągnięty już przy cenach wyjściowych po uwzględnieniu wybranego rabatu.' : 'Jeśli potwierdzona cena samego prania po rabacie osiągnie 400 zł, suszenie będzie GRATIS.';
      copy += ' Kwotę końcową potwierdzimy po wycenie.';
    } else if (drying.checked) copy = 'Suszenie: +50 zł za całe zamówienie albo GRATIS przy potwierdzonej cenie samego prania po rabacie od 400 zł. Opisz liczbę i rodzaj mebli powyżej — potwierdzimy wycenę.';
    $('#dryingEstimate').textContent = copy;
    const ids = chosen.size ? [...chosen.keys()] : select.value ? [select.value] : [];
    const estimate = window.cleanzoneDryingPrice.estimate(ids,drying.checked,firstOrder.checked);
    const amount = value => new Intl.NumberFormat('pl-PL',{maximumFractionDigits:2}).format(value);
    const range = values => values[1] === null ? `od ${amount(values[0])} zł` : values[0] === values[1] ? `${amount(values[0])} zł` : `${amount(values[0])}–${amount(values[1])} zł`;
    const output = $('#bookingQuote');
    if (output) {
      output.replaceChildren();
      const line = (label,text) => { const p=document.createElement('p'); const strong=document.createElement('strong');strong.textContent=label+' ';p.append(strong,text);output.append(p); };
      if (estimate) {
        line(firstOrder.checked ? 'Pranie po rabacie:' : 'Pranie:',range(estimate.cleaning));
        line('Suszenie:',estimate.drying === 'none' ? 'nie wybrano' : estimate.drying === 'free' ? 'GRATIS' : estimate.drying === 'paid' ? '+50 zł za całe zamówienie' : '+50 zł lub GRATIS, jeśli samo pranie po rabacie wyniesie min. 400 zł');
        if (estimate.total) line('Razem orientacyjnie:',range(estimate.total));
        line('Minimum 150 zł uwzględnione.','Cenę, zakres i rabat potwierdzimy przed wizytą.');
      } else line('Wycena po zdjęciu lub rozmowie.','Minimum zamówienia po rabacie: 150 zł. Suszenie opcjonalnie +50 zł albo GRATIS przy praniu od 400 zł po rabacie.');
    }
    const toastQuote = $('#toastQuote');
    if (toastQuote) toastQuote.textContent = estimate ? `Pranie ${firstOrder.checked ? 'po rabacie ' : ''}${range(estimate.cleaning)} · cenę potwierdzimy` : 'Cenę potwierdzimy po zdjęciu lub rozmowie';
  }
  drying.addEventListener('change', renderDrying);
  firstOrder.addEventListener('change', renderDrying);
  $$('a[href="#pierwsze-zamowienie"]').forEach(link => link.addEventListener('click', () => { $('#pierwsze-zamowienie').open = true; }));
  if (location.hash === '#pierwsze-zamowienie') $('#pierwsze-zamowienie').open = true;
  $$('[data-add-drying]').forEach(link => link.addEventListener('click', () => { drying.checked = true; renderDrying(); }));
  renderDrying();
  function renderSelection() {
    summary.replaceChildren(); summary.hidden = chosen.size === 0;
    if (chosen.size) {
      const heading = document.createElement('strong'); heading.textContent = 'Wybrane meble: '; summary.append(heading, [...chosen.values()].join(', '));
      summary.append(document.createElement('br'));
      const clear = document.createElement('button'); clear.type = 'button'; clear.textContent = 'Wyczyść wybór';
      clear.addEventListener('click', () => { chosen.clear(); select.value = ''; renderSelection(); }); summary.append(clear);
    }
    $$('.choose-service').forEach(b => {
      const active = chosen.has(b.dataset.service), card = b.closest('.price-card');
      b.setAttribute('aria-pressed', String(active));
      b.setAttribute('aria-label', `${active ? 'Usuń z wyboru' : 'Wybierz'}: ${card.querySelector('h3').textContent}`);
      card.classList.toggle('selected', active);
      b.querySelector('span:first-child').textContent = active ? 'Wybrano' : 'Wybierz';
      b.querySelector('span:last-child').textContent = active ? '✓' : '↗';
    });
    if (chosen.size === 1) select.value = [...chosen.keys()][0];
    if (chosen.size > 1) select.value = 'multiple';
    if (!chosen.size) { toast.hidden = true; }
    renderDrying();
  }
  $$('.choose-service').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.service;
    if (chosen.has(id)) { chosen.delete(id); if (!chosen.size) select.value = ''; }
    else chosen.set(id, button.closest('.price-card').querySelector('h3').textContent);
    renderSelection();
    if (chosen.size) { $('#toastText').textContent = `Wybrano: ${[...chosen.values()].join(', ')}`; toast.hidden = false; }
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
    window.cleanzoneJourney?.submitAttempt();
    button.disabled = true; button.firstElementChild.textContent = 'Wysyłanie…';
    status.className = ''; status.textContent = '';
    await configReady;
    if (production && (!bookingEnabled || Date.now() - ticketFetchedAt > 12 * 60 * 1000)) await loadBookingConfig();
    if (!bookingEnabled) {
      window.cleanzoneJourney?.submitError('config_unavailable');
      status.className = 'error';
      status.textContent = production ? 'Formularz jest chwilowo niedostępny. Zapytanie nie zostało wysłane. Zadzwoń: 730 135 133.' : 'To podgląd nowej strony — zapytanie nie zostało wysłane. Aby zamówić usługę teraz, zadzwoń: 730 135 133.';
      button.disabled = false; button.firstElementChild.textContent = 'Wyślij zapytanie';
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const selectedDescription = [...chosen.values()].join(', ');
    data.service = selectedDescription || select.selectedOptions[0].textContent;
    if (drying.checked) {
      const subtotal = dryingSubtotal();
      const quote = subtotal === null ? null : window.cleanzoneDryingPrice.quote(subtotal, true, firstOrder.checked);
      data.service += quote !== null && quote.cleaning >= 400
        ? ' | Ekspresowe suszenie: GRATIS (pranie po rabacie od 400 zł)'
        : ' | Ekspresowe suszenie: +50 zł za całe zamówienie; GRATIS, jeśli wycena samego prania po rabacie wyniesie min. 400 zł';
    }
    if (firstOrder.checked) data.service += ' | Pierwsze zamówienie: rabat 20% na pranie; min. 150 zł po rabacie. Suszenie bez rabatu; bez łączenia rabatów. Do potwierdzenia.';
    data.startedAt = startedAt;
    if (ticket) data.ticket = ticket;
    button.disabled = true; button.firstElementChild.textContent = 'Wysyłanie…';
    let deliveryError = 'network', deliveryStatus;
    try {
      if (ticket && Date.now() - ticketFetchedAt < 1100) await new Promise(resolve => setTimeout(resolve, 1100 - (Date.now() - ticketFetchedAt)));
      const response = await fetch(apiBase + '/api/booking', { method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'omit', body: JSON.stringify(data), signal: AbortSignal.timeout(16000) });
      deliveryStatus = response.status;
      deliveryError = response.ok ? 'invalid_response' : 'http_error';
      const result = await response.json();
      if (!response.ok) throw new Error('delivery');
      deliveryError = 'delivery_unconfirmed';
      if (result.ok !== true) throw new Error('delivery');
      window.cleanzoneJourney?.submitSuccess();
      status.className = 'success'; status.textContent = 'Dziękujemy! Zapytanie dotarło. Skontaktujemy się, aby potwierdzić cenę i termin.';
      form.reset(); chosen.clear(); renderSelection();
      if (ticket) { ticket = null; ticketFetchedAt = 0; }
      // Conversion fires only after server-confirmed delivery and only if consented analytics was configured separately.
      // Analytics is optional: its failure must never change a confirmed delivery into an error.
      if (typeof window.cleanzoneConfirmedConversion === 'function') {
        try { await window.cleanzoneConfirmedConversion(); } catch (_) { /* Delivery already confirmed. */ }
      }
      try { window.cleanzoneMarkConfirmedLead?.(); } catch (_) { /* Delivery already confirmed. */ }
      try { window.location.assign('/dziekujemy/'); } catch (_) { /* Keep the confirmed-success message. */ }
    } catch (error) {
      window.cleanzoneJourney?.submitError(['TimeoutError','AbortError'].includes(error.name) ? 'timeout' : deliveryError, deliveryStatus);
      if (production) { ticket = null; ticketFetchedAt = 0; }
      status.className = 'error'; status.textContent = 'Nie udało się potwierdzić wysłania. Twoje dane pozostały w formularzu. Zadzwoń: 730 135 133, aby ustalić termin.';
    } finally { button.disabled = false; button.firstElementChild.textContent = 'Wyślij zapytanie'; }
  });
  form.elements.namedItem('phone').addEventListener('input', e => e.target.setCustomValidity(''));
})();
