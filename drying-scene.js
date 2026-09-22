/* Reversible, scroll-driven SVG illustration. No continuous animation or dependencies. */
(function () {
  'use strict';
  const clamp = n => Math.min(1, Math.max(0, n));
  const phase = (p, start, end) => clamp((p - start) / (end - start));
  const ease = n => n * n * (3 - 2 * n);
  window.initDryingScene = function (host) {
    if (!host || host.dataset.dryingReady) return;
    const visual = host.querySelector('.drying-visual');
    const sticky = host.querySelector('.drying-sticky');
    if (!visual || !sticky) return;
    host.dataset.dryingReady = 'true';
    const prefix = 'dry-' + Math.random().toString(36).slice(2, 9);
    const id = name => prefix + '-' + name;
    const ribs = Array.from({length: 10}, (_, i) => `<ellipse cx="0" cy="${-14 + i * 9}" rx="113" ry="48" fill="none" stroke="#737970" stroke-width="2" opacity=".42"/>`).join('');
    const grille = Array.from({length: 9}, (_, i) => `<circle r="${17 + i * 10}" fill="none" stroke="#80867a" stroke-width="1.7"/>`).join('');
    const blades = Array.from({length: 5}, (_, i) => `<path transform="rotate(${i * 72})" d="M0 -13C11 -37 28 -70 54 -75Q82 -78 86 -51C64 -21 37 0 11 9Z" fill="#a0a79a" stroke="#c5ccba" stroke-width="1"/>`).join('');
    const streams = Array.from({length: 6}, (_, i) => `<path class="drying-air" d="M${790 - i * 8} ${353 + i * 13}C${686 - i * 15} ${226 + i * 12} ${495 - i * 18} ${219 + i * 21} ${231 - i * 9} ${270 + i * 19}" fill="none" stroke="url(#${id('air')})" stroke-width="${1.5 + i % 2}" stroke-linecap="round" stroke-dasharray="48 29 11 38"/>`).join('');
    visual.innerHTML = `<svg class="drying-svg" viewBox="0 0 1060 670" role="img" aria-labelledby="${id('title')} ${id('desc')}">
      <title id="${id('title')}">Ekspresowe suszenie tapicerki po praniu</title>
      <desc id="${id('desc')}">Ilustracja procesu: profesjonalny wentylator kieruje powietrze na wyprany materac, a wilgotna powierzchnia stopniowo jaśnieje. Animacja jest poglądowa i nie określa czasu suszenia.</desc>
      <defs>
        <linearGradient id="${id('top')}" x2="1" y2="1"><stop stop-color="#fffef3"/><stop offset=".6" stop-color="#e2e5d9"/><stop offset="1" stop-color="#aebcaf"/></linearGradient>
        <linearGradient id="${id('edge')}" x2="0" y2="1"><stop stop-color="#c6cfc0"/><stop offset="1" stop-color="#637467"/></linearGradient>
        <linearGradient id="${id('case')}" x2="1" y2="1"><stop stop-color="#3f463d"/><stop offset=".5" stop-color="#151b16"/><stop offset="1" stop-color="#050806"/></linearGradient>
        <linearGradient id="${id('rim')}" x2="0" y2="1"><stop stop-color="#ffeb6d"/><stop offset=".5" stop-color="#ffd600"/><stop offset="1" stop-color="#b79510"/></linearGradient>
        <linearGradient id="${id('air')}"><stop stop-color="#edf2dd" stop-opacity="0"/><stop offset=".55" stop-color="#edf2dd" stop-opacity=".7"/><stop offset="1" stop-color="#ffd600" stop-opacity=".16"/></linearGradient>
        <radialGradient id="${id('shadow')}"><stop stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
        <pattern id="${id('quilt')}" width="72" height="59" patternUnits="userSpaceOnUse"><path d="M-36 0L36 59L108 0M-36 59L36 0L108 59" fill="none" stroke="#8b9d8b" stroke-width="1.2" opacity=".3"/><circle cx="36" cy="29.5" r="2.5" fill="#fff" opacity=".8"/></pattern>
        <clipPath id="${id('surface')}"><rect width="640" height="360" rx="28"/></clipPath>
        <clipPath id="${id('wetclip')}"><rect class="drying-wetclip" width="640" height="360"/></clipPath>
      </defs>
      <ellipse cx="416" cy="533" rx="376" ry="63" fill="url(#${id('shadow')})"/>
      <g class="drying-mattress">
        <g transform="translate(-8 68) scale(.79)">
          <path d="M91 390L682 545Q696 549 712 536L938 387V438Q938 448 925 457L712 592Q698 602 683 598L97 443Q78 438 78 420V402Q78 393 91 390Z" fill="url(#${id('edge')})"/>
          <path d="M330 220L91 374Q78 384 78 403V420Q78 438 97 443L330 291Z" fill="#889887"/>
          <path d="M89 419L682 574Q698 578 711 568L930 430" fill="none" stroke="#e4e6d7" stroke-opacity=".4" stroke-width="2"/>
          <g transform="matrix(.95 .25 -.7 .47 330 220)">
            <rect width="640" height="360" rx="28" fill="url(#${id('top')})"/>
            <g clip-path="url(#${id('surface')})">
              <rect width="640" height="360" fill="url(#${id('quilt')})"/>
              <g clip-path="url(#${id('wetclip')})"><rect width="640" height="360" fill="#344f49" opacity=".39"/><path d="M40 100Q180 70 280 130T580 140M70 240Q230 185 410 240T610 250" stroke="#c8ded5" stroke-width="16" opacity=".12" fill="none"/></g>
            </g>
            <rect x="8" y="8" width="624" height="344" rx="22" fill="none" stroke="#f8f9ed" stroke-width="3" opacity=".7"/>
          </g>
        </g>
      </g>
      <g class="drying-airflow" opacity="0">${streams}</g>
      <g class="drying-fan" opacity="0">
        <ellipse cx="835" cy="559" rx="174" ry="38" fill="url(#${id('shadow')})"/>
        <g transform="translate(827 413)">
          <path d="M-101 48L-92 130H-74L-66 75M101 48L92 130H74L66 75" fill="#111711" stroke="#5c6658" stroke-width="3"/>
          <path d="M-113 -17V78C-110 144 109 144 113 78V-17Z" fill="url(#${id('case')})" stroke="#3d493c" stroke-width="2"/>
          ${ribs}
          <path d="M-112 -9V76C-112 134 112 134 112 76V-9" fill="none" stroke="url(#${id('rim')})" stroke-width="13"/>
          <ellipse cy="-19" rx="119" ry="66" fill="#111911" stroke="url(#${id('rim')})" stroke-width="15"/>
          <g transform="translate(0 -19) scale(1 .53)"><g class="drying-rotor">${blades}</g><g opacity=".72">${grille}<path d="M-106 0H106M0 -106V106M-76 -76L76 76M76 -76L-76 76" stroke="#858d7f" stroke-width="3"/></g><circle r="18" fill="#252f24" stroke="#707a65" stroke-width="4"/></g>
          <path d="M-95 -49Q0 -111 95 -49" fill="none" stroke="#fff3a7" stroke-width="3" opacity=".7"/>
          <path d="M-47 -77V-96Q0 -118 47 -96V-77" fill="none" stroke="url(#${id('rim')})" stroke-width="12" stroke-linejoin="round"/>
          <rect x="-29" y="60" width="58" height="23" rx="5" fill="#263124" stroke="#68745d"/><circle cx="15" cy="71" r="4" fill="#ffd600"/>
        </g>
      </g>
      <g class="drying-sparkle" fill="none" stroke="#fff4aa" stroke-width="2" stroke-linecap="round" opacity="0"><path d="M262 292v22m-11 -11h22M524 358v16m-8 -8h16M363 407v18m-9 -9h18"/></g>
    </svg><div class="drying-visual-meta"><span class="drying-stage">PO PRANIU · WILGOTNA TKANINA</span><span>Wizualizacja procesu</span></div><div class="drying-progress" aria-hidden="true"><span></span></div>`;
    const q = selector => visual.querySelector(selector);
    const parts = {mattress:q('.drying-mattress'), wet:q('.drying-wetclip'), fan:q('.drying-fan'), rotor:q('.drying-rotor'), air:q('.drying-airflow'), streams:[...visual.querySelectorAll('.drying-air')], sparkle:q('.drying-sparkle'), stage:q('.drying-stage'), bar:q('.drying-progress span')};
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const shortScreen = matchMedia('(max-height: 600px)');
    const offer = host.querySelector('.drying-offer');
    let frame = 0;
    host.classList.add('drying-enhanced');
    function render() {
      frame = 0;
      const staticMode = reduced.matches || shortScreen.matches;
      const rect = host.getBoundingClientRect();
      if (!staticMode && (rect.bottom < -100 || rect.top > innerHeight + 100)) return;
      const top = parseFloat(getComputedStyle(sticky).top) || 0;
      const p = staticMode ? 1 : clamp((top - rect.top) / Math.max(1, host.offsetHeight - sticky.offsetHeight));
      const dry = ease(phase(p, .35, .75));
      const appear = ease(phase(p, .2, .35));
      const airflow = phase(p, .33, .4) * (1 - phase(p, .72, .9));
      parts.mattress.setAttribute('transform', `translate(0 ${8 - 15 * p}) rotate(${-1.8 + 3 * p} 400 400)`);
      parts.wet.setAttribute('width', String(640 * (1 - dry)));
      parts.fan.setAttribute('opacity', String(appear));
      parts.fan.setAttribute('transform', `translate(${70 * (1 - appear)} ${20 * (1 - appear) - 6 * p}) rotate(${-8 * (1 - appear)} 830 500)`);
      parts.rotor.setAttribute('transform', `rotate(${phase(p, .35, .85) * 2520})`);
      parts.air.setAttribute('opacity', String(staticMode ? 0 : airflow * .8));
      parts.streams.forEach((path, i) => path.setAttribute('stroke-dashoffset', String(p * 1050 + i * 22)));
      parts.sparkle.setAttribute('opacity', String(phase(p, .73, .9) * .8));
      parts.bar.style.transform = `scaleX(${p})`;
      parts.stage.textContent = p < .35 ? 'PO PRANIU · WILGOTNA TKANINA' : p < .75 ? 'KONTROLOWANY PRZEPŁYW POWIETRZA' : 'FINAŁ SUSZENIA · ŚWIEŻA TKANINA';
      host.dataset.progress = p.toFixed(3);
      if (offer) {
        const revealed = staticMode || p >= .9;
        offer.style.opacity = String(staticMode ? 1 : phase(p, .9, 1));
        offer.style.transform = `translateY(${staticMode ? 0 : 12 * (1 - phase(p, .9, 1))}px)`;
        offer.inert = !revealed;
      }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(render); }
    addEventListener('scroll', schedule, {passive:true});
    addEventListener('resize', schedule, {passive:true});
    reduced.addEventListener('change', schedule);
    shortScreen.addEventListener('change', schedule);
    render();
    return {update:schedule, destroy:function () {
      removeEventListener('scroll', schedule); removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule); shortScreen.removeEventListener('change', schedule);
      cancelAnimationFrame(frame); host.classList.remove('drying-enhanced'); delete host.dataset.dryingReady;
      if (offer) {offer.style.opacity = ''; offer.style.transform = ''; offer.inert = false;}
    }};
  };
}());
