/* Session replay starts only after renewed opt-in. Never identify visitors by form data. */
(() => {
  'use strict';
  if (window.cleanzoneClarityEvent) return;
  const projectId = 'yr0iqsk14t';
  const consentKey = 'cleanzone-measurement-consent-v5';
  let loaded = false, allowed = false, stopped = false;
  document.querySelectorAll('form,input,textarea,select,.form-status').forEach(el => el.setAttribute('data-clarity-mask','true'));
  function enable() {
    if (allowed) return;
    allowed = true;
    if (!loaded) {
      loaded = true;
      window.clarity = window.clarity || function() { (window.clarity.q = window.clarity.q || []).push(arguments); };
      window.clarity('consentv2', {analytics_Storage:'granted',ad_Storage:'denied'});
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.clarity.ms/tag/' + projectId;
      document.head.append(script);
    } else {
      window.clarity('consentv2', {analytics_Storage:'granted',ad_Storage:'denied'});
      if (stopped) window.clarity('start');
      stopped = false;
    }
    window.clarity('set','page_type',document.body.classList.contains('partner-page') ? 'partner' : /^\/dziekujemy\/?$/.test(location.pathname) ? 'thank_you' : location.pathname === '/' ? 'home' : 'local');
  }
  addEventListener('cleanzone:measurement-consent', event => {
    if (event.detail?.allowed === true) enable();
    else {
      allowed = false;
      if (loaded) {
        window.clarity('consentv2', {analytics_Storage:'denied',ad_Storage:'denied'});
        window.clarity('consent',false);
        window.clarity('stop');
        stopped = true;
      }
    }
  });
  try {
    const saved = JSON.parse(localStorage.getItem(consentKey));
    if (saved?.choice === 'yes' && saved.expires > Date.now()) enable();
  } catch (_) { /* Refusing storage must never block booking. */ }
  const events = new Set(['view_pricing','before_after_interaction','form_view','lead','select_service','remove_service','booking_form_open','booking_form_close','booking_form_scroll','booking_cta_click','phone_click','booking_form_start','booking_validation_error','booking_submit_attempt','booking_submit_error','booking_submit_success','site_error']);
  window.cleanzoneClarityEvent = name => {
    if (allowed && events.has(name) && typeof window.clarity === 'function') {
      try { window.clarity('event', name); } catch (_) { /* Analytics is optional. */ }
    }
  };
})();
