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
    const ribs = Array.from({length: 12}, (_, i) => `<path d="M-104 ${i*6} Q0 ${65+i*6} 104 ${i*6}" fill="none" stroke="#090c0d" stroke-width="3.5"/><path d="M-104 ${i*6-1.5} Q0 ${63.5+i*6} 104 ${i*6-1.5}" fill="none" stroke="#6d7576" stroke-width=".7" opacity=".38"/>`).join('');
    const grille = Array.from({length: 13}, (_, i) => `<circle r="${16+i*7}" fill="none" stroke="#929c9d" stroke-width="1.05"/>`).join('') + Array.from({length: 16}, (_, i) => `<path d="M15 0H102" transform="rotate(${i*22.5})" stroke="#7e8789" stroke-width=".85"/>`).join('');
    const blades = Array.from({length: 7}, (_, i) => `<g transform="rotate(${i*360/7})"><path d="M9 -14C15 -37 19 -75 42 -89Q61 -94 70 -77C65 -48 35 -20 14 5Z" fill="url(#${id('blade')})"/><path d="M15 -18C30 -42 37 -69 51 -84" fill="none" stroke="#bec5c5" stroke-width=".8" opacity=".3"/></g>`).join('');
    const streams = Array.from({length: 4}, (_, i) => `<path class="drying-air" d="M${790-i*8} ${353+i*13}C${686-i*15} ${226+i*12} ${495-i*18} ${219+i*21} ${231-i*9} ${270+i*19}" fill="none" stroke="url(#${id('air')})" stroke-width="${.85+i*.12}" stroke-linecap="round" stroke-dasharray="95 150 24 190"/>`).join('');
    visual.innerHTML = `<svg class="drying-svg" viewBox="0 0 1060 670" role="img" aria-labelledby="${id('title')} ${id('desc')}">
      <title id="${id('title')}">Ekspresowe suszenie tapicerki po praniu</title>
      <desc id="${id('desc')}">Ilustracja procesu: profesjonalny wentylator kieruje powietrze na wyprany materac, a wilgotna powierzchnia stopniowo jaśnieje. Animacja jest poglądowa i nie określa czasu suszenia.</desc>
      <defs>
        <linearGradient id="${id('top')}" x2="1" y2="1"><stop stop-color="#fffef3"/><stop offset=".6" stop-color="#e2e5d9"/><stop offset="1" stop-color="#aebcaf"/></linearGradient>
        <linearGradient id="${id('edge')}" x2="0" y2="1"><stop stop-color="#c6cfc0"/><stop offset="1" stop-color="#637467"/></linearGradient>
        <linearGradient id="${id('case')}" x2="1" y2=".2"><stop stop-color="#1a1f21"/><stop offset=".27" stop-color="#424b4e"/><stop offset=".6" stop-color="#252c2e"/><stop offset="1" stop-color="#101517"/></linearGradient>
        <linearGradient id="${id('rim')}" x2=".3" y2="1"><stop stop-color="#747e80"/><stop offset=".28" stop-color="#394245"/><stop offset=".65" stop-color="#1d2426"/><stop offset="1" stop-color="#0d1214"/></linearGradient>
        <linearGradient id="${id('blade')}" x2=".8" y2="1"><stop stop-color="#8c9698"/><stop offset=".4" stop-color="#414c50"/><stop offset="1" stop-color="#1b2427"/></linearGradient>
        <radialGradient id="${id('well')}"><stop stop-color="#101619"/><stop offset=".8" stop-color="#070c0e"/><stop offset="1" stop-color="#323c3f"/></radialGradient>
        <linearGradient id="${id('air')}"><stop stop-color="#dbe2df" stop-opacity="0"/><stop offset=".55" stop-color="#dbe2df" stop-opacity=".32"/><stop offset="1" stop-color="#dbe2df" stop-opacity="0"/></linearGradient>
        <radialGradient id="${id('shadow')}"><stop stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
        <pattern id="${id('quilt')}" width="72" height="59" patternUnits="userSpaceOnUse"><path d="M-36 0L36 59L108 0M-36 59L36 0L108 59" fill="none" stroke="#8b9d8b" stroke-width="1.2" opacity=".3"/><circle cx="36" cy="29.5" r="2.5" fill="#fff" opacity=".8"/></pattern>
        <clipPath id="${id('surface')}"><rect width="640" height="360" rx="28"/></clipPath>
        <pattern id="${id('weave')}" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 1h7M1 0v7" stroke="#607267" stroke-width=".6" opacity=".14"/><path d="M0 4h7M4 0v7" stroke="#fff" stroke-width=".6" opacity=".28"/></pattern>
        <linearGradient id="${id('wetfade')}" class="drying-wetclip" gradientUnits="userSpaceOnUse" x1="640" x2="792"><stop stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <mask id="${id('wetmask')}" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="360" style="mask-type:alpha"><rect width="640" height="360" fill="url(#${id('wetfade')})"/></mask>
        <clipPath id="${id('vents')}"><path d="M-105 -8V76C-102 132 102 132 105 76V-8Z"/></clipPath>
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
              <rect width="640" height="360" fill="url(#${id('weave')})"/>
              <g mask="url(#${id('wetmask')})"><rect width="640" height="360" fill="#334b46" opacity=".25"/><path d="M-30 110Q180 25 340 110T700 95" stroke="#d7e3df" stroke-width="65" opacity=".06" fill="none"/></g>
            </g>
            <rect x="8" y="8" width="624" height="344" rx="22" fill="none" stroke="#f8f9ed" stroke-width="3" opacity=".7"/>
          </g>
        </g>
      </g>
      <g class="drying-airflow" opacity="0">${streams}</g>
      <g class="drying-fan" opacity="0">
        <ellipse cx="835" cy="559" rx="174" ry="38" fill="url(#${id('shadow')})"/>
        <g transform="translate(827 413)">
          <path d="M-99 75L-94 124Q-93 132 -85 133H-73L-69 89M99 75L94 124Q93 132 85 133H73L69 89" fill="url(#${id('case')})" stroke="#596265" stroke-width="1"/>
          <path d="M-96 129H-73M73 129H96" stroke="#080c0d" stroke-width="6" stroke-linecap="round"/>
          <path d="M-113 -17V78C-110 144 109 144 113 78V-17Z" fill="url(#${id('case')})" stroke="#40494c" stroke-width="1"/>
          <g clip-path="url(#${id('vents')})">${ribs}</g>
          <path d="M-109 -6V76C-109 132 109 132 109 76V-6" fill="none" stroke="url(#${id('rim')})" stroke-width="7"/>
          <path d="M-98 82Q0 138 98 82" fill="none" stroke="#ad963d" stroke-width="2.5" opacity=".75"/>
          <ellipse cy="-19" rx="118" ry="66" fill="url(#${id('rim')})" stroke="#616d70" stroke-width="1"/>
          <ellipse cy="-19" rx="109" ry="58" fill="url(#${id('well')})" stroke="#0c1113" stroke-width="3"/>
          <g transform="translate(0 -17) scale(1 .53)"><g class="drying-rotor">${blades}</g><g opacity=".8">${grille}</g><circle r="16" fill="url(#${id('rim')})" stroke="#7c878a" stroke-width="1.3"/><circle r="5" fill="#182023"/></g>
          <path d="M-99 -51Q0 -99 99 -51" fill="none" stroke="#c4ccce" stroke-width="1" opacity=".42"/>
          <path d="M-40 -74V-92Q0 -111 40 -92V-74" fill="none" stroke="#151d20" stroke-width="11" stroke-linejoin="round"/>
          <path d="M-40 -77V-92Q0 -111 40 -92V-77" fill="none" stroke="#6f7a7d" stroke-width="1.2"/>
          <path d="M-24 -97Q0 -105 24 -97" fill="none" stroke="#b7a044" stroke-width="2.5"/>
          <path d="M-94 -50l3 2M94 -50l-3 2M-83 20l3 -1M83 20l-3 -1" stroke="#a8b1b3" stroke-width="2"/>
          <rect x="-26" y="59" width="52" height="19" rx="3" fill="#141b1e" stroke="#505c60" stroke-width=".8"/><rect x="8" y="63" width="10" height="10" rx="1.5" fill="#373f41"/><path d="M-17 66h16M-17 69h11" stroke="#909b9e" stroke-width=".7"/><circle cx="13" cy="66" r="1.2" fill="#c8b564"/>
        </g>
      </g>
    </svg><div class="drying-visual-meta"><span class="drying-stage">PO PRANIU · WILGOTNA TKANINA</span><span>Wizualizacja procesu</span></div><div class="drying-progress" aria-hidden="true"><span></span></div>`;
    const q = selector => visual.querySelector(selector);
    const parts = {mattress:q('.drying-mattress'), wet:q('.drying-wetclip'), fan:q('.drying-fan'), rotor:q('.drying-rotor'), air:q('.drying-airflow'), streams:[...visual.querySelectorAll('.drying-air')], stage:q('.drying-stage'), bar:q('.drying-progress span')};
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
      const wetEdge = 716 - 792 * dry;
      parts.wet.setAttribute('x1', String(wetEdge - 76));
      parts.wet.setAttribute('x2', String(wetEdge + 76));
      parts.fan.setAttribute('opacity', String(appear));
      parts.fan.setAttribute('transform', `translate(${70 * (1 - appear)} ${20 * (1 - appear) - 6 * p}) rotate(${-8 * (1 - appear)} 830 500)`);
      parts.rotor.setAttribute('transform', `rotate(${phase(p, .35, .85) * 2520})`);
      parts.air.setAttribute('opacity', String(staticMode ? 0 : airflow * .65));
      parts.streams.forEach((path, i) => path.setAttribute('stroke-dashoffset', String(p * 1050 + i * 22)));
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
