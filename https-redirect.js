/* Upgrade legacy ad/bookmark links before booking or measurement scripts run. */
(() => {
  'use strict';
  if (location.protocol === 'http:' && ['cleanzone-uslugi.pl','www.cleanzone-uslugi.pl'].includes(location.hostname)) {
    location.replace('https://www.cleanzone-uslugi.pl' + location.pathname + location.search + location.hash);
  }
})();
