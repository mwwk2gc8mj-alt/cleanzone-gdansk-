/* Google Ads + GA4: load only after opt-in; count only server-confirmed leads. */
(() => {
  'use strict';
  if (window.cleanzoneGoogleTrackingReady) return;
  window.cleanzoneGoogleTrackingReady = true;
  // Renew consent when session recordings are added to measurement.
  const key = 'cleanzone-measurement-consent-v5';
  const measurementId = 'G-DD4EGC87V8';
  const pageType = /^\/partnerzy\/?$/.test(location.pathname) ? 'partner' : /^\/dziekujemy\/?$/.test(location.pathname) ? 'thank_you' : location.pathname === '/' ? 'home' : 'local';
  window['ga-disable-' + measurementId] = true;
  let allowed = false;
  let loaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  const phoneLinks = [...document.querySelectorAll('a[href="tel:+48730135133"]')].map(link => ({
    link, href:link.getAttribute('href'), label:link.getAttribute('aria-label'),
    text:[...function* walk(node) {
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE && child.nodeValue.includes('730 135 133')) yield {node:child, value:child.nodeValue};
        else if (child.nodeType === Node.ELEMENT_NODE) yield* walk(child);
      }
    }(link)]
  }));
  function restorePhones() {
    for (const item of phoneLinks) {
      item.link.setAttribute('href', item.href);
      if (item.label === null) item.link.removeAttribute('aria-label');
      else item.link.setAttribute('aria-label', item.label);
      for (const text of item.text) text.node.nodeValue = text.value;
    }
  }
  function configureCalls() {
    gtag('config', 'AW-17004498635/S5eWCNed3PMcEMudsKw_', {
      phone_conversion_number:'730 135 133',
      phone_conversion_options:{timeout:5000, cache:false},
      phone_conversion_callback(formatted, mobile) {
        if (!allowed || typeof formatted !== 'string' || !/^\+?\d{7,15}$/.test(String(mobile))) return;
        for (const item of phoneLinks) {
          item.link.setAttribute('href', 'tel:'+mobile);
          item.link.setAttribute('aria-label', 'Zadzwoń: '+formatted);
          for (const text of item.text) text.node.nodeValue = text.value.replaceAll('730 135 133', formatted);
        }
      }
    });
  }
  const denied = {ad_storage:'denied', analytics_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'};
  gtag('consent', 'default', denied);
  function enable() {
    if (allowed) return;
    allowed = true;
    window['ga-disable-' + measurementId] = false;
    gtag('consent', 'update', {...denied, ad_storage:'granted', analytics_storage:'granted', ad_user_data:'granted'});
    if (loaded) { configureCalls(); window.dispatchEvent(new CustomEvent('cleanzone:measurement-consent', {detail:{allowed:true}})); return; }
    loaded = true;
    gtag('js', new Date());
    gtag('config', 'AW-17004498635', {allow_ad_personalization_signals:false});
    gtag('config', measurementId, {allow_google_signals:false, allow_ad_personalization_signals:false, page_type:pageType});
    configureCalls();
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17004498635';
    document.head.append(script);
    window.dispatchEvent(new CustomEvent('cleanzone:measurement-consent', {detail:{allowed:true}}));
  }
  const panel = document.createElement('section');
  panel.className = 'ads-consent';
  panel.setAttribute('aria-label', 'Pliki cookies');
  panel.innerHTML = '<strong>Pliki cookies</strong><p>Za zgodą mierzymy reklamy i korzystanie ze strony oraz analizujemy nagrania wizyt w Microsoft Clarity. Pola formularza są maskowane. Odmowa nie wpływa na usługę.</p><details><summary>Szczegóły cookies i pomiaru</summary><p>Używamy Google Analytics 4, Google Ads i Meta Pixel do pomiaru źródeł ruchu, oglądanych sekcji i cen, wyboru mebli, kliknięć telefonu, kroków formularza, błędów i potwierdzonych zapytań. Google może wyświetlić numer przekierowujący do Cleanzone i zmierzyć czas oraz długość połączenia. Meta otrzymuje PageView i Lead, bez treści formularza. Google Ads nie otrzymuje sygnałów personalizacji reklam. Zdarzenia Meta służą pomiarowi i optymalizacji reklam. Microsoft Clarity tworzy mapy kliknięć i przewijania oraz nagrania działań na stronie. Treść formularzy jest maskowana. Zgodę możesz wycofać w stopce.</p></details><div><button type="button" data-choice="no">Odrzuć</button><button type="button" data-choice="yes">Akceptuję cookies</button></div>';
  document.body.append(panel);
  const privacy = document.querySelector('#privacyDialog');
  if (privacy) {
    const details = document.createElement('p');
    details.textContent = 'Po wyrażeniu zgody Google Ads może zastąpić numer telefonu numerem przekierowującym do Cleanzone. Google przetwarza dane połączenia (m.in. czas i długość), aby przypisać je do reklamy. Połączenie trwające co najmniej 60 sekund traktujemy jako kontakt, nie jako potwierdzone zamówienie. Ta funkcja nie włącza nagrywania rozmów. Odmowa zgody pozostawia zwykły numer Cleanzone.';
    privacy.append(details);
  }
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'ads-settings';
  settings.textContent = 'Ustawienia cookies';
  (document.querySelector('.footer-bottom') || document.querySelector('footer')).append(settings);
  settings.addEventListener('click', () => { panel.hidden = false; panel.querySelector('button').focus(); });
  panel.addEventListener('click', event => {
    const choice = event.target.closest('[data-choice]')?.dataset.choice;
    if (!choice) return;
    try { localStorage.setItem(key, JSON.stringify({choice, expires:Date.now()+180*86400000})); } catch (_) {}
    if (choice === 'yes') enable();
    else {
      allowed = false;
      window.dispatchEvent(new CustomEvent('cleanzone:measurement-consent', {detail:{allowed:false}}));
      window['ga-disable-' + measurementId] = true;
      restorePhones();
      if (loaded) gtag('consent', 'update', denied);
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0].trim();
        if (!/^(_ga(?:_|$)|_gid$|_gat|_gcl_|_gac_|gwcc$|_fbp$|_fbc$|_clck$|_clsk$)/.test(name)) continue;
        for (const domain of ['', location.hostname, '.'+location.hostname, '.cleanzone-uslugi.pl']) {
          document.cookie = name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'');
        }
      }
    }
    panel.hidden = true;
    settings.focus({preventScroll:true});
  });
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved?.expires > Date.now() && ['yes','no'].includes(saved.choice)) {
      panel.hidden = true;
      if (saved.choice === 'yes') enable();
    }
  } catch (_) {}
  const dispatchedLeads = new Map();
  window.cleanzoneConfirmedConversion = () => {
    if (!allowed) return;
    const leadId = window.cleanzoneJourney?.getConfirmedLeadId();
    if (!leadId) return; // A click, native form event or /dziekujemy visit cannot unlock a lead.
    if (dispatchedLeads.has(leadId)) return dispatchedLeads.get(leadId);
    // Wait for both destinations before redirecting, with one shared maximum of 800 ms.
    // A callback acknowledges dispatch, not receipt or attribution in either dashboard.
    function dispatch(name, params) {
      return new Promise(resolve => {
        const finish = () => { clearTimeout(timer); resolve(); };
        const timer = setTimeout(finish, 800);
        try { gtag('event', name, {...params, event_timeout:800, event_callback:finish}); }
        catch (_) { finish(); } // Measurement cannot turn a confirmed booking into an error.
      });
    }
    // Reserve before SDK dispatch: repeated callbacks cannot send the same server receipt twice.
    dispatchedLeads.set(leadId, Promise.resolve());
    try { window.cleanzoneClarityEvent?.('lead'); } catch (_) { /* Replay is optional. */ }
    const ga = dispatch('generate_lead', {
      send_to:measurementId,
      form_id:document.body.classList.contains('partner-page') ? 'partner' : 'booking',
      page_type:pageType, event_id:leadId, tracking_version:'20261010-funnel'
    });
    const ads = dispatch('conversion', {
      send_to:'AW-17004498635/Ymz2CPKt3eccEMudsKw_',
      transaction_id:leadId, value:0, currency:'PLN'
    });
    const pending = Promise.all([ga, ads]);
    dispatchedLeads.set(leadId, pending);
    return pending;
  };
})();
