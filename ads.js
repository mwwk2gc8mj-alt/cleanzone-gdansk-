/* Google Ads: load only after opt-in; count only the confirmed booking hook. */
(() => {
  'use strict';
  const key = 'cleanzone-ads-consent-v2';
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
    allowed = true;
    gtag('consent', 'update', {...denied, ad_storage:'granted', ad_user_data:'granted'});
    if (loaded) { configureCalls(); return; }
    loaded = true;
    gtag('js', new Date());
    gtag('config', 'AW-17004498635', {allow_ad_personalization_signals:false});
    configureCalls();
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17004498635';
    document.head.append(script);
  }
  const panel = document.createElement('section');
  panel.className = 'ads-consent';
  panel.setAttribute('aria-label', 'Ustawienia prywatności');
  panel.innerHTML = '<strong>Pomóż nam mierzyć skuteczność reklam</strong><p>Za Twoją zgodą użyjemy Google Ads do pomiaru wizyt, wysłanych zapytań i połączeń telefonicznych. Google może wyświetlić numer przekierowujący do Cleanzone oraz zmierzyć czas i długość połączenia. Bez personalizacji reklam i bez treści formularza. Odmowa nie wpływa na zamówienie usługi. Zgodę możesz wycofać w stopce.</p><div><button type="button" data-choice="no">Odrzuć</button><button type="button" data-choice="yes">Zgadzam się</button></div>';
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
      restorePhones();
      if (loaded) gtag('consent', 'update', denied);
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0].trim();
        if (!/^(_gcl_|_gac_|gwcc$)/.test(name)) continue;
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
  window.cleanzoneConfirmedConversion = () => {
    if (!allowed) return;
    gtag('event', 'conversion', {
      send_to:'AW-17004498635/Ymz2CPKt3eccEMudsKw_',
      transaction_id:crypto.randomUUID(), value:0, currency:'PLN'
    });
  };
})();
