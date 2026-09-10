/* Scroll-controlled illustration. No tracking, network calls, or scroll interception. */
(function () {
  'use strict';
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (a, b, p) => a + (b - a) * p;
  window.initCleaningScene = function (host) {
    if (!host || host.dataset.sceneReady) return;
    host.dataset.sceneReady = 'true';
    const uid = 'cz' + Math.random().toString(36).slice(2, 8);
    const id = name => uid + '-' + name;
    const dotMarkup = Array.from({ length: 34 }, (_, i) => {
      const x = 34 + (i * 137 % 566), y = 29 + (i * 83 % 306);
      return `<circle cx="${x}" cy="${y}" r="${3 + i % 4}" fill="${i % 3 ? '#8f795a' : '#615338'}" opacity=".3"/>`;
    }).join('');
    const tufts = Array.from({ length: 54 }, (_, i) => {
      const x = 27 + i % 9 * 72, y = 29 + Math.floor(i / 9) * 59;
      return `<path d="M${x-10} ${y}q10 -7 20 0q-10 7 -20 0" fill="#b5b3a7" opacity=".25"/><circle cx="${x}" cy="${y}" r="2.2" fill="#fff" opacity=".9"/>`;
    }).join('');
    host.innerHTML = `
      <div class="cleaning-story__sticky">
        <div class="cleaning-story__heading">
          <p class="cleaning-story__eyebrow"><span></span> CZYSTOŚĆ, KTÓRĄ WIDAĆ</p>
          <h2>Przewiń.<br><em>Zobacz różnicę.</em></h2>
          <p>Woda, precyzja i siła ekstrakcji.<br>Świeżość wraca do Twojego domu.</p>
        </div>
        <div class="cleaning-story__visual">
          <div class="cleaning-story__halo" aria-hidden="true"></div>
          <svg class="cleaning-story__svg" viewBox="0 0 1060 680" role="img" aria-labelledby="${id('title')} ${id('desc')}">
            <title id="${id('title')}">Animacja prania ekstrakcyjnego materaca</title>
            <desc id="${id('desc')}">Podczas przewijania przez materac przechodzi przezroczysta ssawka. Zabrudzenia znikają, odsłaniając czystą tkaninę. To ilustracja procesu, nie zdjęcie realizacji.</desc>
            <defs>
              <linearGradient id="${id('top')}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf1"/><stop offset=".58" stop-color="#e9e8df"/><stop offset="1" stop-color="#c9cec8"/></linearGradient>
              <linearGradient id="${id('front')}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#cacbc0"/><stop offset=".45" stop-color="#a5afa7"/><stop offset="1" stop-color="#67776b"/></linearGradient>
              <linearGradient id="${id('left')}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c5c7bc"/><stop offset="1" stop-color="#6c7c6e"/></linearGradient>
              <linearGradient id="${id('glass')}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#cde8da" stop-opacity=".92"/><stop offset=".35" stop-color="#fff" stop-opacity=".28"/><stop offset=".7" stop-color="#d0eee2" stop-opacity=".8"/><stop offset="1" stop-color="#fafff5" stop-opacity=".93"/></linearGradient>
              <linearGradient id="${id('metal')}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#566357"/><stop offset=".24" stop-color="#e9eddf"/><stop offset=".5" stop-color="#a4afa1"/><stop offset=".74" stop-color="#fafced"/><stop offset="1" stop-color="#5b685e"/></linearGradient>
              <radialGradient id="${id('stain')}"><stop stop-color="#735b34" stop-opacity=".68"/><stop offset=".64" stop-color="#8d744a" stop-opacity=".3"/><stop offset="1" stop-color="#aa956c" stop-opacity="0"/></radialGradient>
              <pattern id="${id('fabric')}" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 1h8M1 0v8" stroke="#818e83" stroke-width=".65" opacity=".18"/><path d="M0 5h8M5 0v8" stroke="#fff" stroke-width=".8" opacity=".45"/></pattern>
              <pattern id="${id('quilting')}" width="72" height="59" patternUnits="userSpaceOnUse"><path d="M-36 0L36 59L108 0M-36 59L36 0L108 59" fill="none" stroke="#b3b9ad" stroke-width="1.5" opacity=".3"/><path d="M-36 2L36 61L108 2M-36 61L36 2L108 61" fill="none" stroke="#fff" stroke-width="1.5" opacity=".6"/></pattern>
              <clipPath id="${id('surface')}"><rect x="0" y="0" width="640" height="360" rx="28"/></clipPath>
              <clipPath id="${id('dirtclip')}"><rect class="cleaning-story__dirtclip" x="0" y="0" width="640" height="360"/></clipPath>
              <filter id="${id('shadow')}" x="-30%" y="-70%" width="160%" height="240%"><feGaussianBlur stdDeviation="19"/></filter>
            </defs>
            <ellipse cx="514" cy="558" rx="356" ry="44" fill="#000" opacity=".42" filter="url(#${id('shadow')})"/>
            <g class="cleaning-story__assembly">
              <path d="M91 390 L682 545 Q696 549 712 536 L938 387 L938 438 Q938 448 925 457 L712 592 Q698 602 683 598 L97 443 Q78 438 78 420 L78 402 Q78 393 91 390Z" fill="url(#${id('front')})"/>
              <path d="M330 220 L91 374 Q78 384 78 403 L78 420 Q78 438 97 443 L330 291Z" fill="url(#${id('left')})"/>
              <path d="M89 419 L682 574 Q698 578 711 568 L930 430" fill="none" stroke="#e4e6d7" stroke-opacity=".35" stroke-width="2"/>
              <path d="M96 438 L683 593 Q698 597 710 588 L924 453" fill="none" stroke="#54685a" stroke-opacity=".5" stroke-width="3"/>
              <g transform="matrix(.95 .25 -.7 .47 330 220)">
                <rect width="640" height="360" rx="28" fill="url(#${id('top')})"/>
                <g clip-path="url(#${id('surface')})">
                  <rect width="640" height="360" fill="url(#${id('fabric')})"/>
                  <rect width="640" height="360" fill="url(#${id('quilting')})"/>
                  ${tufts}
                  <g clip-path="url(#${id('dirtclip')})">
                    <rect width="640" height="360" fill="#968467" opacity=".21"/>
                    <ellipse cx="122" cy="112" rx="115" ry="89" fill="url(#${id('stain')})"/>
                    <ellipse cx="314" cy="230" rx="153" ry="106" fill="url(#${id('stain')})"/>
                    <ellipse cx="529" cy="97" rx="112" ry="88" fill="url(#${id('stain')})"/>
                    <ellipse cx="540" cy="310" rx="136" ry="67" fill="url(#${id('stain')})"/>
                    ${dotMarkup}
                  </g>
                  <rect class="cleaning-story__waterline" x="0" y="8" width="18" height="344" rx="8" fill="#fffedc" opacity=".5"/>
                </g>
                <rect x="8" y="8" width="624" height="344" rx="22" fill="none" stroke="#f8f9ed" stroke-width="3.5" opacity=".7"/>
                <rect x="15" y="15" width="610" height="330" rx="19" fill="none" stroke="#7a897e" stroke-width="1" stroke-dasharray="3 5" opacity=".4"/>
              </g>
              <g class="cleaning-story__wand">
                <path class="cleaning-story__hose-shadow" fill="none" stroke="#030704" stroke-width="35" stroke-linecap="round" opacity=".3"/>
                <path class="cleaning-story__hose" fill="none" stroke="#303d33" stroke-width="29" stroke-linecap="round"/>
                <path class="cleaning-story__hose-ribs" fill="none" stroke="#667061" stroke-width="28" stroke-dasharray="2.5 7" opacity=".75"/>
                <path class="cleaning-story__tube" fill="none" stroke="url(#${id('metal')})" stroke-width="22" stroke-linecap="round"/>
                <path class="cleaning-story__tube-shine" fill="none" stroke="#f1f5e6" stroke-width="3" opacity=".55" stroke-linecap="round"/>
              </g>
              <g class="cleaning-story__nozzle-plane" transform="matrix(.95 .25 -.7 .47 330 220)">
                <g class="cleaning-story__nozzle">
                  <rect x="-21" y="9" width="72" height="346" rx="12" fill="#182b1c" opacity=".13" transform="translate(10 10)"/>
                  <path d="M-17 21Q-17 12 -8 12H23Q34 12 36 26L48 135Q56 144 66 147V214Q56 217 48 225L36 334Q34 348 23 348H-8Q-17 348 -17 339Z" fill="url(#${id('glass')})" stroke="#e7f1e2" stroke-width="3"/>
                  <path d="M-16 26V334" fill="none" stroke="#677e69" stroke-width="9" stroke-linecap="round"/>
                  <path d="M-20 26V334" fill="none" stroke="#ffd600" stroke-width="4" stroke-linecap="round"/>
                  <path d="M-1 28L23 148V212L-1 332M22 32L37 146V214L22 328" fill="none" stroke="#fff" stroke-width="3" opacity=".66"/>
                  <rect x="39" y="151" width="41" height="60" rx="13" fill="url(#${id('metal')})" stroke="#6e8070" stroke-width="2"/>
                  <rect x="54" y="160" width="24" height="42" rx="6" fill="#26392b"/>
                  <g class="cleaning-story__droplets">${Array.from({ length: 13 }, (_, i) => `<circle data-drop="${i}" cx="0" cy="0" r="${2.2+i%3}" fill="${i%3===0?'#967946':'#f8ffed'}" opacity=".8"/>`).join('')}</g>
                </g>
              </g>
              <g class="cleaning-story__fresh" opacity="0" fill="none" stroke="#fffedb" stroke-width="2" stroke-linecap="round"><path d="M312 292v22m-11-11h22M546 374v16m-8-8h16M393 440v20m-10-10h20"/></g>
            </g>
          </svg>
          <span class="cleaning-story__tag cleaning-story__tag--before">ZABRUDZENIA</span>
          <span class="cleaning-story__tag cleaning-story__tag--after">CZYSTA TKANINA <span>↗</span></span>
          <p class="cleaning-story__disclaimer">Wizualizacja procesu</p>
        </div>
        <div class="cleaning-story__footer">
          <div class="cleaning-story__step"><span class="cleaning-story__number">01 / 03</span><p class="cleaning-story__step-title">Docieramy głębiej.</p><p class="cleaning-story__step-copy">Czyszczenie nie kończy się na powierzchni.</p></div>
          <div class="cleaning-story__track" aria-hidden="true"><span></span></div>
          <span class="cleaning-story__scroll-hint">PRZEWIŃ DALEJ <span>↓</span></span>
        </div>
      </div>`;
    const q = selector => host.querySelector(selector);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sticky = q('.cleaning-story__sticky');
    const parts = {
      assembly:q('.cleaning-story__assembly'), dirt:q('.cleaning-story__dirtclip'), nozzle:q('.cleaning-story__nozzle'),
      water:q('.cleaning-story__waterline'), hose:q('.cleaning-story__hose'), ribs:q('.cleaning-story__hose-ribs'), shadow:q('.cleaning-story__hose-shadow'),
      tube:q('.cleaning-story__tube'), shine:q('.cleaning-story__tube-shine'), fresh:q('.cleaning-story__fresh'),
      track:q('.cleaning-story__track span'), number:q('.cleaning-story__number'), title:q('.cleaning-story__step-title'), copy:q('.cleaning-story__step-copy'),
      before:q('.cleaning-story__tag--before'), after:q('.cleaning-story__tag--after'), drops:[...host.querySelectorAll('[data-drop]')]
    };
    const steps = [
      ['Docieramy głębiej.', 'Czyszczenie nie kończy się na powierzchni.'],
      ['Wypłukujemy zabrudzenia.', 'Ssawka odciąga wodę wraz z rozpuszczonym brudem.'],
      ['Czas na świeżość.', 'Po wyschnięciu — znowu Twój ulubiony kąt.']
    ];
    let frame = 0, lastStep = -1;
    function render() {
      frame = 0;
      const rect = host.getBoundingClientRect();
      const vh = window.innerHeight;
      if (!reduced.matches && (rect.bottom < -100 || rect.top > vh + 100)) return;
      const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
      const duration = Math.max(1, host.offsetHeight - sticky.offsetHeight);
      const raw = reduced.matches ? 1 : clamp((stickyTop - rect.top) / duration);
      const p = reduced.matches ? 1 : clamp((raw - .04) / .89);
      const x = mix(8, 659, p);
      parts.dirt.setAttribute('x', Math.min(640, x));
      parts.dirt.setAttribute('width', Math.max(0, 640-x));
      parts.nozzle.setAttribute('transform', `translate(${x} 0)`);
      parts.water.setAttribute('x', x - 28);
      parts.water.setAttribute('opacity', p > .985 ? '0' : '.48');
      parts.assembly.setAttribute('transform', `translate(0 ${mix(7,-6,p)}) rotate(${mix(-2.8,2.2,p)} 530 390)`);
      const ax = 330 + .95 * (x + 66) - .7 * 180;
      const ay = 220 + .25 * (x + 66) + .47 * 180 - 4;
      const bx = ax + 78, by = ay - 145;
      const hose = `M${bx} ${by} C${bx+90} ${by-55} ${930+30*p} ${by-155} 1077 ${130+80*p}`;
      const tube = `M${ax} ${ay} L${bx} ${by}`;
      parts.hose.setAttribute('d', hose); parts.ribs.setAttribute('d', hose); parts.shadow.setAttribute('d', hose);
      parts.tube.setAttribute('d', tube); parts.shine.setAttribute('d', `M${ax-4} ${ay-3} L${bx-4} ${by-3}`);
      parts.drops.forEach((drop,i) => {
        const t = (p * 12 + i / 13) % 1;
        const startY = 27 + (i * 37 % 298);
        drop.setAttribute('cx', mix(-7, 65, t));
        drop.setAttribute('cy', mix(startY, 180, t*t));
        drop.setAttribute('opacity', p > .985 || reduced.matches ? '0' : String(Math.sin(t*Math.PI)*.9));
      });
      parts.fresh.setAttribute('opacity', String(clamp((p-.73)/.25)*.75));
      parts.track.style.transform = `scaleX(${raw})`;
      parts.before.style.opacity = String(1-clamp((p-.46)/.3));
      parts.after.style.opacity = String(clamp((p-.15)/.35));
      host.style.setProperty('--cleaning-progress', p.toFixed(3));
      const step = Math.min(2, Math.floor(raw * 3));
      if (step !== lastStep) {
        parts.number.textContent = '0' + (step+1) + ' / 03';
        parts.title.textContent = steps[step][0]; parts.copy.textContent = steps[step][1]; lastStep = step;
      }
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(render); }
    window.addEventListener('scroll', schedule, {passive:true});
    window.addEventListener('resize', schedule, {passive:true});
    if (reduced.addEventListener) reduced.addEventListener('change', schedule);
    render();
    return { update: schedule, destroy: function () {
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      if (reduced.removeEventListener) reduced.removeEventListener('change', schedule);
      cancelAnimationFrame(frame); delete host.dataset.sceneReady;
    } };
  };
}());
