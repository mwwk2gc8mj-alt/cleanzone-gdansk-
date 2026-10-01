/* Consent-gated funnel. Never collect field contents, phone numbers or arbitrary DOM text. */
(() => {
  'use strict';
  if (window.cleanzoneJourney) return;
  const measurementId = 'G-DD4EGC87V8';
  const consentKey = 'cleanzone-measurement-consent-v5';
  const services = new Set(['sofa2','sofa3','cornerl','corneru','pullout','stool','chair','office','armchair','mattress1','mattress2','headboard','rug','multiple','other','partner3','partner5','partner8','partner12','partnerOther']);
  const fields = new Set(['name','phone','city','service','date','comment','expressDrying']);
  const errors = new Set(['required','invalid','config_unavailable','network','timeout','http_error','invalid_response','delivery_unconfirmed','script_error','asset_error']);
  const sections = new Set(['home','cleaning-story','drying-story','cennik','efekty','opinie','jak-dzialamy','faq','rezerwacja','warunki','bookingForm']);
  const actions = new Set(['menu','clear_selection','privacy','instagram','google_reviews','partners','local_area','home','drying','process','results','faq']);
  const locations = new Set(['header','hero','prices','drying','results','reviews','process','faq','form','footer','dock','selection_toast','partner_offer','local_page','page']);
  const names = new Set(['section_view','price_view','price_filter','select_service','remove_service','booking_cta_click','booking_form_start','booking_field_complete','booking_validation_error','booking_submit_click','booking_submit_attempt','booking_submit_error','booking_submit_success','phone_click','faq_open','compare_interaction','drying_option','scroll_depth','site_error','navigation_click','interaction_click']);
  let allowed = false;
  try { const saved = JSON.parse(localStorage.getItem(consentKey)); allowed = saved?.choice === 'yes' && saved.expires > Date.now(); } catch (_) {}
  const seen = new Set();
  let started = false, completed = false, inFlight = false;
  const pageType = /^\/partnerzy\/?$/.test(location.pathname) ? 'partner' : /^\/dziekujemy\/?$/.test(location.pathname) ? 'thank_you' : location.pathname === '/' ? 'home' : 'local';
  function track(name, params = {}) {
    if (!allowed || !names.has(name) || typeof window.gtag !== 'function') return false;
    // Explicit allowlist: callers cannot leak user input or an error message into analytics.
    const safe = {send_to:measurementId, page_type:pageType, tracking_version:'20261001'};
    if (actions.has(params.action_id)) safe.action_id = params.action_id;
    if (sections.has(params.section_id)) safe.section_id = params.section_id;
    if (locations.has(params.action_location)) safe.action_location = params.action_location;
    if (services.has(params.service_id)) safe.service_id = params.service_id;
    if (fields.has(params.field_name)) safe.field_name = params.field_name;
    if (errors.has(params.error_type)) safe.error_type = params.error_type;
    if (['all','sofy','fotele','materace','dywany'].includes(params.filter_id)) safe.filter_id = params.filter_id;
    if ([25,50,75,90].includes(params.scroll_percent)) safe.scroll_percent = params.scroll_percent;
    if (Number.isInteger(params.item_index) && params.item_index > 0 && params.item_index < 30) safe.item_index = params.item_index;
    if (typeof params.option_selected === 'boolean') safe.option_selected = params.option_selected;
    if (Number.isInteger(params.http_status) && params.http_status >= 400 && params.http_status < 600) safe.http_status = params.http_status;
    if (document.getElementById('bookingForm') && name.startsWith('booking_')) safe.form_id = pageType === 'partner' ? 'partner' : 'booking';
    try { window.cleanzoneClarityEvent?.(name); } catch (_) { /* Replay cannot block GA or booking. */ }
    try { window.gtag('event', name, safe); return true; } catch (_) { return false; }
  }
  function once(key, name, params) {
    if (seen.has(key)) return;
    if (track(name, params)) seen.add(key);
  }
  function start() {
    if (!allowed || started) return;
    started = true; completed = false;
    track('booking_form_start');
  }
  window.cleanzoneJourney = {
    track,
    submitAttempt() { start(); inFlight = true; track('booking_submit_attempt'); },
    submitError(errorType, httpStatus) { inFlight = false; track('booking_submit_error', {error_type:errorType, http_status:httpStatus}); },
    submitSuccess() { if (completed || !inFlight) return; completed = true; inFlight = false; track('booking_submit_success'); }
  };
  function placement(element) {
    if (element.closest('.mobile-dock')) return 'dock';
    if (element.closest('.selection-toast')) return 'selection_toast';
    if (element.closest('header')) return 'header';
    if (element.closest('footer')) return 'footer';
    if (element.closest('#bookingForm')) return 'form';
    if (element.closest('.partner-tier')) return 'partner_offer';
    const id = element.closest('section[id]')?.id;
    return ({home:'hero',cennik:'prices','drying-story':'drying',efekty:'results',opinie:'reviews','jak-dzialamy':'process',faq:'faq',rezerwacja:'form'})[id] || (pageType === 'local' ? 'local_page' : 'page');
  }
  document.addEventListener('click', event => {
    const element = event.target.closest('a,button');
    if (!element || element.closest('.ads-consent,#privacyDialog') || element.classList.contains('ads-settings')) return;
    const actionLocation = placement(element);
    const href = element.getAttribute('href') || '';
    if (element.matches('.submit-button')) track('booking_submit_click', {action_location:'form'});
    if (element.matches('.menu-toggle')) track('interaction_click', {action_id:'menu',action_location:'header'});
    if (element.closest('#selectionSummary') && element.tagName === 'BUTTON') track('interaction_click', {action_id:'clear_selection',action_location:'form'});
    if (href.startsWith('tel:')) track('phone_click', {action_location:actionLocation});
    else if (/#(?:rezerwacja|bookingForm)$/.test(href)) track('booking_cta_click', {action_location:actionLocation});
    else if (href.includes('#')) {
      const id = href.slice(href.lastIndexOf('#')+1);
      if (sections.has(id)) track('navigation_click', {section_id:id,action_location:actionLocation});
    } else {
      const destination = /instagram\.com/.test(href) ? 'instagram' : /google\.com\/maps/.test(href) ? 'google_reviews' : /^\/partnerzy\/?$/.test(href) ? 'partners' : /^\/pranie-tapicerki-[a-z-]+\/$/.test(href) ? 'local_area' : href === '/' ? 'home' : null;
      if (destination) track('interaction_click', {action_id:destination,action_location:actionLocation});
    }
    if (element.matches('.price-filters button')) track('price_filter', {filter_id:element.dataset.filter});
    if (element.matches('.choose-service')) track(element.getAttribute('aria-pressed') === 'true' ? 'remove_service' : 'select_service', {service_id:element.dataset.service,action_location:'prices'});
    if (element.hasAttribute('data-tier')) track('select_service', {service_id:element.dataset.tier,action_location:'partner_offer'});
    if (element.hasAttribute('data-add-drying')) track('drying_option', {option_selected:true,action_location:actionLocation});
  }, true); // Capture sees the selection state before the existing UI toggles it.
  const form = document.getElementById('bookingForm');
  if (form) {
    form.addEventListener('input', event => { if (fields.has(event.target.name)) start(); });
    form.addEventListener('focusout', event => {
      const field = event.target;
      if (fields.has(field.name) && field.type !== 'checkbox' && field.value && field.checkValidity()) once('field:'+field.name, 'booking_field_complete', {field_name:field.name});
    });
    form.addEventListener('change', event => {
      const field = event.target;
      if (!fields.has(field.name)) return;
      start();
      if (field.type === 'checkbox' || (field.value && field.checkValidity())) once('field:'+field.name, 'booking_field_complete', {field_name:field.name});
      if (field.name === 'service') track('select_service', {service_id:field.value,action_location:'form'});
      if (field.id === 'expressDrying') track('drying_option', {option_selected:field.checked,action_location:'form'});
    });
    form.addEventListener('invalid', event => {
      if (!fields.has(event.target.name)) return;
      once('invalid:'+event.target.name, 'booking_validation_error', {field_name:event.target.name,error_type:event.target.validity.valueMissing ? 'required' : 'invalid'});
    }, true);
  }
  document.querySelectorAll('.faq-list details').forEach((element, index) => element.addEventListener('toggle', () => {
    if (element.open) track('faq_open', {item_index:index+1});
  }));
  document.querySelectorAll('.compare-images input').forEach((element, index) => element.addEventListener('input', () => once('compare:'+index, 'compare_interaction', {item_index:index+1})));
  // Observe a viewport-sized slice of large sections. A 50% ratio on a tall scroll scene is unreachable.
  const visible = new Map();
  const timers = new Map();
  const targets = [];
  function reportView(element) {
    if (!allowed || !visible.get(element)) return;
    if (element.matches('.price-card')) once('price:'+element.id, 'price_view', {service_id:element.querySelector('[data-service]')?.dataset.service});
    else once('section:'+element.id, 'section_view', {section_id:element.id});
  }
  function dwell(element) {
    clearTimeout(timers.get(element));
    if (allowed && visible.get(element) && document.visibilityState !== 'hidden') timers.set(element, setTimeout(() => { timers.delete(element); reportView(element); }, 600));
  }
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const r = entry.intersectionRect;
        const h = Math.min(entry.boundingClientRect.height, innerHeight);
        const w = Math.min(entry.boundingClientRect.width, innerWidth);
        visible.set(entry.target, entry.isIntersecting && r.height >= h * .35 && r.width >= w * .35);
        dwell(entry.target);
      }
    }, {threshold:[0,.01,.05,.1,.25,.35,.5,.75,1]});
    document.querySelectorAll('section[id],#bookingForm,.price-card').forEach(element => { if (sections.has(element.id) || element.matches('.price-card')) { targets.push(element); observer.observe(element); } });
  }
  let scrollFrame = 0;
  function scrollDepth() {
    scrollFrame = 0;
    if (!allowed) return;
    const height = document.documentElement.scrollHeight;
    if (height <= innerHeight) return;
    const percent = (scrollY + innerHeight) / height * 100;
    for (const value of [25,50,75,90]) if (percent >= value) once('scroll:'+value, 'scroll_depth', {scroll_percent:value});
  }
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollDepth); }, {passive:true});
  addEventListener('error', event => {
    const resource = event.target;
    if (resource?.tagName === 'IMG' && resource.closest('main')) once('asset_error', 'site_error', {error_type:'asset_error'});
    else if (event.filename && /\/(app|partners|scene|drying-scene|drying-price|journey)\.js(?:\?|$)/.test(event.filename)) once('script_error', 'site_error', {error_type:'script_error'});
  }, true);
  addEventListener('cleanzone:measurement-consent', event => {
    allowed = event.detail?.allowed === true;
    if (!allowed) { seen.clear(); started = false; completed = false; inFlight = false; }
    for (const element of targets) dwell(element);
    if (allowed) scrollDepth();
  });
  document.addEventListener('visibilitychange', () => { for (const element of targets) dwell(element); });
})();
