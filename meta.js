/* Meta Pixel on all site pages, loaded after explicit measurement consent. */
(() => {
  'use strict';
  if (window.cleanzoneMetaPixelReady) return;
  window.cleanzoneMetaPixelReady = true;
  const pixelId = '1125559183140836';
  const consentKey = 'cleanzone-measurement-consent-v4';
  const leadKey = 'cleanzone-confirmed-lead-v1';
  const isThankYouPage = /^\/dziekujemy\/?$/.test(location.pathname);
  let initialized = false;
  let pendingLead = null;

  // Consume the token on arrival, before tracking. Reload/back/direct visits cannot repeat Lead.
  if (isThankYouPage) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(leadKey));
      sessionStorage.removeItem(leadKey);
      if (saved?.id && saved.createdAt > Date.now() - 10 * 60 * 1000) pendingLead = saved.id;
    } catch (_) { /* Browsing without session storage still works. */ }
  }

  window.cleanzoneMarkConfirmedLead = () => {
    try {
      sessionStorage.setItem(leadKey, JSON.stringify({id:crypto.randomUUID(), createdAt:Date.now()}));
    } catch (_) { /* Booking and redirect must not depend on analytics storage. */ }
  };

  function hasConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(consentKey));
      return saved?.choice === 'yes' && saved.expires > Date.now();
    } catch (_) { return false; }
  }
  function trackLead() {
    if (!pendingLead || !initialized) return;
    pendingLead = null;
    window.fbq('track', 'Lead');
  }
  function enable() {
    if (initialized) {
      window.fbq('consent', 'grant');
      trackLead();
      return;
    }
    initialized = true;
    // Meta's small official bootstrap; never inserted before consent.
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    trackLead();
  }
  addEventListener('cleanzone:measurement-consent', event => {
    if (event.detail?.allowed) enable();
    else {
      pendingLead = null;
      if (initialized) window.fbq('consent', 'revoke');
    }
  });
  if (hasConsent()) enable();
})();
