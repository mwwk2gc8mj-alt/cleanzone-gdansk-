/* Google Ads: load only after opt-in; count only the confirmed booking hook. */
(() => {
  'use strict';
  const key = 'cleanzone-ads-consent-v1';
  let allowed = false;
  let loaded = false;
  window.dataLayer = window.dataLayer || [];
  const gtag = (...args) => window.dataLayer.push(args);
  const denied = {ad_storage:'denied', analytics_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'};
  gtag('consent', 'default', denied);
  function enable() {
    allowed = true;
    gtag('consent', 'update', {...denied, ad_storage:'granted', ad_user_data:'granted'});
    if (loaded) return;
    loaded = true;
    gtag('js', new Date());
    gtag('config', 'AW-17004498635', {allow_ad_personalization_signals:false});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17004498635';
    document.head.append(script);
  }
  const panel = document.createElement('section');
  panel.className = 'ads-consent';
  panel.setAttribute('aria-label', 'Ustawienia prywatności');
  panel.innerHTML = '<strong>Pomóż nam mierzyć skuteczność reklam</strong><p>Za Twoją zgodą użyjemy plików cookie Google Ads i przekażemy Google dane o wizycie oraz wysłaniu zapytania. Bez personalizacji reklam i bez treści formularza. Odmowa nie wpływa na zamówienie usługi. Zgodę możesz wycofać w stopce.</p><div><button type="button" data-choice="no">Odrzuć</button><button type="button" data-choice="yes">Zgadzam się</button></div>';
  document.body.append(panel);
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
      if (loaded) gtag('consent', 'update', denied);
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0].trim();
        if (!/^_gcl_/.test(name)) continue;
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
