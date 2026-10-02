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
  const toast = document.querySelector('.selection-toast');
  let opener = null;
  function open(link) {
    if (dialog.open) return;
    opener = link;
    // Keep the page's height and scroll position even when opened from the footer.
    placeholder.style.height = form.getBoundingClientRect().height + 'px';
    form.before(placeholder);
    body.append(form);
    dialog.showModal();
    body.scrollTop = 0;
    document.documentElement.classList.add('quick-booking-open');
    toast.hidden = true;
    close.focus({preventScroll:true});
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href="#bookingForm"]');
    if (link && !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      open(link);
    }
    // An offer link inside the modal must close it before navigating to the offer's details.
    if (dialog.open && event.target.closest('a[href="#pierwsze-zamowienie"]')) dialog.close();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    placeholder.replaceWith(form);
    document.documentElement.classList.remove('quick-booking-open');
    if (!document.getElementById('selectionSummary').hidden) toast.hidden = false;
    opener?.focus({preventScroll:true});
  });
})();
