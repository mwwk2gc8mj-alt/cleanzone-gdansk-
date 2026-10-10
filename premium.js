/* One-shot heading reveals. Content stays visible without JS or with reduced motion. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const headings = [...document.querySelectorAll('.section-heading h2,.booking-copy h2')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.dataset.premiumReveal = 'visible';
      observer.unobserve(entry.target);
    });
  }, {rootMargin:'0px 0px -30px 0px',threshold:0.05});
  headings.forEach(heading => {
    if (heading.getBoundingClientRect().top <= innerHeight - 30) return;
    heading.dataset.premiumReveal = 'pending';
    observer.observe(heading);
  });
  document.documentElement.classList.add('motion-ready');
  reduced.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    headings.forEach(heading => {heading.dataset.premiumReveal = 'visible';});
  });
  // A focus jump must never land on hidden content.
  document.addEventListener('focusin', event => {
    const section = event.target.closest('section');
    section?.querySelectorAll('[data-premium-reveal="pending"]').forEach(heading => {
      heading.dataset.premiumReveal = 'visible'; observer.unobserve(heading);
    });
  });
})();
