/* Reuse the existing form: one set of fields, one delivery handler, no extra requests. */
(() => {
  'use strict';
  const form = document.getElementById('bookingForm');
  const dialog = document.getElementById('quickBookingDialog');
  if (!form || !dialog || typeof dialog.showModal !== 'function') return;
  const placeholder = document.createElement('div');
  placeholder.setAttribute('aria-hidden', 'true');
  placeholder.style.minWidth = '0';
  const body = dialog.querySelector('.quick-booking-body');
  const close = dialog.querySelector('.quick-booking-close');
  const footer = dialog.querySelector('.quick-booking-footer');
  const submit = form.querySelector('.submit-button');
  const actions = [...form.querySelectorAll('.submit-button,.form-bottom,#bookingStatus')].map(node => ({node, marker:document.createComment('booking-action')}));
  const toast = document.querySelector('.selection-toast');
  const scrollHint = dialog.querySelector('.quick-booking-scroll-hint');
  let opener = null;
  let scrolled = false;
  function updateScrollHint() {
    if (scrollHint) scrollHint.hidden = !dialog.open || body.scrollHeight <= body.clientHeight + 2 || body.scrollTop >= body.scrollHeight - body.clientHeight - 2;
  }
  function open(link) {
    if (dialog.open) return true;
    // If a browser cannot open the dialog, leave the native link to the form working.
    try { dialog.showModal(); } catch (_) { return false; }
    opener = link;
    // Keep the page's height and scroll position even when opened from the footer.
    placeholder.style.height = form.getBoundingClientRect().height + 'px';
    form.before(placeholder);
    body.append(form);
    actions.forEach(({node, marker}) => { node.before(marker); footer.append(node); });
    submit.setAttribute('form', form.id);
    body.scrollTop = 0;
    scrolled = false;
    document.documentElement.classList.add('quick-booking-open');
    toast.hidden = true;
    close.focus({preventScroll:true});
    updateScrollHint();
    window.cleanzoneJourney?.track('booking_form_open');
    return true;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href="#bookingForm"]');
    if (link && !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      if (open(link)) event.preventDefault();
    }
    // An offer link inside the modal must close it before navigating to the offer's details.
    if (dialog.open && event.target.closest('a[href="#pierwsze-zamowienie"]')) dialog.close();
  });
  close.addEventListener('click', () => dialog.close());
  // Dismiss only a tap which both starts and ends outside the window, never a scroll drag.
  let backdropStart = null;
  function outside(event) {
    const r = dialog.getBoundingClientRect();
    return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
  }
  dialog.addEventListener('pointerdown', event => { backdropStart = outside(event) ? {x:event.clientX,y:event.clientY} : null; });
  dialog.addEventListener('pointercancel', () => { backdropStart = null; });
  dialog.addEventListener('click', event => {
    if (backdropStart && outside(event) && Math.hypot(event.clientX - backdropStart.x,event.clientY - backdropStart.y) < 10) dialog.close();
    backdropStart = null;
  });
  body.addEventListener('scroll', () => {
    updateScrollHint();
    if (dialog.open && !scrolled && body.scrollTop > 0) {
      scrolled = true;
      window.cleanzoneJourney?.track('booking_form_scroll');
    }
  }, {passive:true});
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(updateScrollHint);
    observer.observe(body);
    observer.observe(form);
  }
  dialog.addEventListener('close', () => {
    actions.forEach(({node, marker}) => marker.replaceWith(node));
    submit.removeAttribute('form');
    placeholder.replaceWith(form);
    document.documentElement.classList.remove('quick-booking-open');
    if (document.getElementById('selectionSummary')?.hidden === false) toast.hidden = false;
    updateScrollHint();
    window.cleanzoneJourney?.track('booking_form_close');
    opener?.focus({preventScroll:true});
  });
})();
