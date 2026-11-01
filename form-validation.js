/* Keep validation visible inside the scrollable booking dialog, including mobile keyboards. */
(() => {
  'use strict';
  const form = document.getElementById('bookingForm');
  if (!form) return;
  const labels = {name:'imię',phone:'numer telefonu',city:'miejscowość',service:'usługę'};
  const messages = new Map();
  let pendingFocus = false;
  function validate(field) {
    if (!labels[field.name]) return;
    let error = '';
    if (field.name === 'phone' && field.value.trim()) {
      const digits = field.value.replace(/\D/g,'');
      if (!/^[+\d\s()\-]+$/.test(field.value.trim()) || digits.length < 9 || digits.length > 15)
        error = 'Wpisz poprawny numer telefonu (9–15 cyfr).';
    } else if (['name','city'].includes(field.name) && field.tagName !== 'SELECT' && field.value && field.value.trim().length < 2) {
      error = 'Wpisz co najmniej 2 znaki.';
    }
    field.setCustomValidity(error);
  }
  function clear(field) {
    const message = messages.get(field);
    if (!message) return;
    message.hidden = true;
    field.removeAttribute('aria-invalid');
    const ids = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== message.id);
    if (ids.length) field.setAttribute('aria-describedby',ids.join(' '));
    else field.removeAttribute('aria-describedby');
  }
  function show(field) {
    if (!labels[field.name]) return;
    let message = messages.get(field);
    if (!message) {
      message = document.createElement('small');
      message.id = 'booking-error-' + field.name;
      message.className = 'form-field-error';
      field.after(message);
      messages.set(field,message);
    }
    message.textContent = field.validity.valueMissing ? 'Uzupełnij ' + labels[field.name] + '.' : field.validationMessage;
    message.hidden = false;
    field.setAttribute('aria-invalid','true');
    const ids = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    ids.add(message.id);
    field.setAttribute('aria-describedby',[...ids].join(' '));
  }
  form.addEventListener('invalid', event => {
    const field = event.target;
    if (!labels[field.name]) return;
    // Native bubbles can be outside the dialog's scroll viewport. Use persistent inline text.
    event.preventDefault();
    show(field);
    if (pendingFocus) return;
    pendingFocus = true;
    const dialog = field.closest('dialog');
    requestAnimationFrame(() => {
      pendingFocus = false;
      if (!field.isConnected || field.validity.valid || (dialog && !dialog.open)) return;
      field.focus({preventScroll:true});
      field.scrollIntoView({block:'center',behavior:'instant'});
    });
  }, true);
  for (const type of ['input','change']) form.addEventListener(type, event => {
    const field = event.target;
    if (!labels[field.name]) return;
    validate(field);
    if (field.validity.valid) clear(field);
    else if (field.getAttribute('aria-invalid') === 'true') show(field);
  });
})();
