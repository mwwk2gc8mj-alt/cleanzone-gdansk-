/* Load the site's measurement container only after cookie consent. */
(() => {
  'use strict';
  let loaded = false;
  window.addEventListener('cleanzone:measurement-consent', event => {
    // Cached pages using the direct Google tags do not activate the GTM tags.
    if (event.detail?.allowed !== true || event.detail.gtmVersion !== 2) return;
    const layer = window.dataLayer;
    if (!loaded) {
      loaded = true;
      const path = location.pathname;
      const pageType = /^\/partnerzy\/?$/.test(path) ? 'partner' : /^\/dziekujemy\/?$/.test(path) ? 'thank_you' : path === '/' ? 'home' : 'local';
      layer.push({'gtm.start': Date.now(), event: 'gtm.js'});
      layer.push({event: 'cleanzone_gtm_boot_v2', cz_page_type: pageType});
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-P4K2LG9P';
      document.head.append(script);
    }
    layer.push({event: 'cleanzone_gtm_phone_v2'});
  });
})();
