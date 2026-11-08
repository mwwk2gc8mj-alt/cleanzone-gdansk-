/* Share the site's existing consent and data layer with Google Tag Manager. */
(() => {
  'use strict';

  function loadContainer(event) {
    if (event.detail?.allowed !== true) return;
    window.removeEventListener('cleanzone:measurement-consent', loadContainer);
    window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-P4K2LG9P';
    document.head.append(script);
  }

  window.addEventListener('cleanzone:measurement-consent', loadContainer);
})();
