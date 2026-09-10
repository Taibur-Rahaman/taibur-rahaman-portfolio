(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;
  const soundKey = 'taibur-interface-sound';
  let soundOn = localStorage.getItem(soundKey) !== 'off';
  let audioCtx = null;

  /* Visual refinement layer: keeps the existing HTML/CSS structure but makes the
     reference-inspired hero feel more alive without adding heavy libraries. */
  const style = document.createElement('style');
  style.textContent = `
    .hero{padding-top:34px;padding-bottom:52px;min-height:calc(100vh - 82px)}
    .hero-layout{grid-template-columns:minmax(0,1.06fr) minmax(360px,.94fr);gap:24px}
    .hero-copy{position:relative;z-index:2}
    .hero-title{font-size:clamp(4.1rem,7.15vw,7rem);margin:24px 0 22px}
    .hero-headline{min-height:68px}
    .typewriter{display:inline-block;min-width:min(100%,590px)}
    .typewriter-caret{display:inline-block;width:2px;height:1em;margin-left:5px;vertical-align:-.12em;background:var(--cyan);box-shadow:0 0 14px rgba(53,231,193,.7);animation:caretBlink .8s steps(1) infinite}
    @keyframes caretBlink{50%{opacity:0}}
    .portrait-system{width:min(100%,430px);filter:drop-shadow(0 25px 55px rgba(0,0,0,.28))}
    .portrait-frame{inset:16%;padding:6px;animation:portraitFloat 6s ease-in-out infinite}
    .portrait-frame:before{content:"";position:absolute;inset:-7px;border-radius:50%;background:conic-gradient(from 0deg,transparent 0 24%,rgba(53,231,193,.72) 29%,transparent 36% 61%,rgba(88,217,255,.55) 66%,transparent 73%);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 2px),#000 calc(100% - 1px));mask:radial-gradient(farthest-side,transparent calc(100% - 2px),#000 calc(100% - 1px));animation:ringSweep 7s linear infinite;pointer-events:none}
    .portrait-frame:after{content:"";position:absolute;inset:4%;border-radius:50%;border:1px solid rgba(255,255,255,.08);box-shadow:inset 0 0 35px rgba(53,231,193,.09);pointer-events:none}
    .portrait-frame img{transform:scale(.99);transition:transform .7s ease,filter .7s ease}
    .portrait-system:hover .portrait-frame img{transform:scale(1.015);filter:saturate(1.06) contrast(1.02)}
    .portrait-glass{background:linear-gradient(115deg,rgba(255,255,255,.18),transparent 27%,transparent 61%,rgba(53,231,193,.08))}
    .portrait-glass:after{content:"";position:absolute;left:10%;right:10%;top:15%;height:1px;background:linear-gradient(90deg,transparent,var(--cyan),transparent);opacity:.45;filter:blur(.2px);animation:scanline 4.5s ease-in-out infinite}
    @keyframes portraitFloat{50%{transform:translateY(-7px)}}
    @keyframes ringSweep{to{transform:rotate(360deg)}}
    @keyframes scanline{0%,100%{transform:translateY(0);opacity:0}18%,72%{opacity:.45}50%{transform:translateY(240px);opacity:.18}}
    .orbit{inset:7%;animation-duration:22s}
    .orbit-two{inset:12%;animation-duration:16s}
    .orbit-three{inset:2%;animation-duration:31s}
    .orbit-dot{animation:dotPulse 2.5s ease-in-out infinite}
    .dot-b{animation-delay:-.8s}.dot-c{animation-delay:-1.6s}
    @keyframes dotPulse{50%{transform:scale(1.8);opacity:.72}}
    .identity-card{max-width:470px;margin-top:-4px;box-shadow:0 18px 55px rgba(0,0,0,.24)}
    .featured-shell{margin-top:0;padding:32px 30px 34px}
    .featured-shell .project-grid{gap:18px}
    .project-card{min-height:345px}
    .project-card:after{content:"";position:absolute;top:-20%;left:-40%;width:34%;height:140%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.055),transparent);transform:rotate(18deg);transition:transform .8s ease;pointer-events:none}
    .project-card:hover:after{transform:translateX(420%) rotate(18deg)}
    @media(max-width:1050px){.hero{padding-top:40px}.hero-layout{grid-template-columns:1fr;gap:20px}.hero-visual{order:-1}.portrait-system{width:min(100%,410px)}.hero-copy{max-width:850px}}
    @media(max-width:760px){.hero{padding-top:32px;padding-bottom:48px}.hero-title{font-size:clamp(3.7rem,15vw,5.7rem)}.hero-headline{min-height:60px}.portrait-system{width:min(100%,360px)}.portrait-frame{inset:15%}.featured-shell{padding:22px 18px 24px}}
    @media(prefers-reduced-motion:reduce){.portrait-frame,.portrait-frame:before,.orbit,.orbit-two,.orbit-three,.orbit-dot,.typewriter-caret,.portrait-glass:after{animation:none!important}}
  `;
  document.head.appendChild(style);

  const ensureAudio = () => {
    if (!soundOn) return null;
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  };

  const tone = (freq, duration=.055, type='sine', gain=.018, delay=0) => {
    const ctx = ensureAudio(); if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator(), amp = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, now);
    amp.gain.setValueAtTime(.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now+.008);
    amp.gain.exponentialRampToValueAtTime(.0001, now+duration);
    osc.connect(amp).connect(ctx.destination); osc.start(now); osc.stop(now+duration+.01);
  };

  const playSound = kind => {
    if (kind==='hover') tone(740,.035,'sine',.008);
    if (kind==='nav') tone(440,.045,'triangle',.012);
    if (kind==='card') tone(520,.04,'sine',.008);
    if (kind==='open') { tone(330,.05,'triangle',.012); tone(520,.07,'triangle',.012,.045); }
    if (kind==='close') tone(280,.06,'triangle',.01);
    if (kind==='success') { tone(520,.06,'sine',.012); tone(780,.09,'sine',.01,.055); }
  };

  const soundButton = document.getElementById('soundToggle');
  const updateSoundButton = () => {
    soundButton?.classList.toggle('off', !soundOn);
    soundButton?.setAttribute('aria-pressed', String(soundOn));
    if (soundButton) soundButton.innerHTML = soundOn ? '♫ <span>Sound</span>' : '◌ <span>Muted</span>';
  };
  soundButton?.addEventListener('click', () => {
    soundOn = !soundOn;
    localStorage.setItem(soundKey, soundOn ? 'on' : 'off');
    updateSoundButton();
    if (soundOn) playSound('success');
  });
  updateSoundButton();
  document.addEventListener('pointerdown', () => ensureAudio(), {once:true,passive:true});

  document.querySelectorAll('[data-sound]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (el.dataset.sound==='hover'||el.dataset.sound==='card') playSound(el.dataset.sound);
    }, {passive:true});
    el.addEventListener('click', () => playSound(el.dataset.sound), {passive:true});
  });

  /* Reference-style typing / deleting loop for the hero sentence. */
  const typeTarget = document.querySelector('.hero-headline span');
  if (typeTarget) {
    const phrases = [
      'I build full-stack solutions that solve real-world problems.',
      'I build AI products that turn ideas into usable systems.',
      'I build WordPress, SaaS and automation products that ship.',
      'I build practical technology for real people and businesses.'
    ];
    const highlight = text => text.replace('real-world', '<b>real-world</b>');
    if (!reduced) {
      typeTarget.classList.add('typewriter');
      typeTarget.innerHTML = '';
      const caret = document.createElement('span');
      caret.className = 'typewriter-caret';
      typeTarget.appendChild(caret);
      let phraseIndex = 0, charIndex = 0, deleting = false;
      const tick = () => {
        const phrase = phrases[phraseIndex];
        charIndex += deleting ? -1 : 1;
        const visible = phrase.slice(0, Math.max(0, charIndex));
        typeTarget.innerHTML = highlight(visible) + '<span class="typewriter-caret"></span>';
        let delay = deleting ? 35 : 52;
        if (!deleting && charIndex >= phrase.length) { delay = 1800; deleting = true; }
        else if (deleting && charIndex <= 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 450; }
        setTimeout(tick, delay);
      };
      setTimeout(tick, 650);
    }
  }

  /* Reliable but fast opening splash: no artificial 1.65s wait. */
  const loader = document.getElementById('loader');
  let loaderFinished = false;
  const finishLoader = () => {
    if (!loader || loaderFinished) return;
    loaderFinished = true;
    loader.classList.add('hide');
    document.body.classList.remove('loading');
    setTimeout(() => loader.remove(), reduced ? 0 : 700);
  };
  const revealSplash = () => setTimeout(finishLoader, reduced ? 80 : 650);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', revealSplash, {once:true});
  else revealSplash();
  setTimeout(finishLoader, reduced ? 1000 : 2600);

  const reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) reveals.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    }), {threshold:.08,rootMargin:'0px 0px -5% 0px'});
    reveals.forEach((el,i) => {
      el.style.transitionDelay=`${Math.min(i%5,4)*45}ms`;
      io.observe(el);
    });
  }

  const menuButton = document.getElementById('menuButton'), menu = document.getElementById('menu');
  const closeMenu = () => {
    menu?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded','false');
    menuButton?.setAttribute('aria-label','Open menu');
  };
  menuButton?.addEventListener('click', () => {
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open',open);
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');
    playSound(open?'open':'close');
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));

  const sections = document.querySelectorAll('main section[id]'), navLinks = document.querySelectorAll('[data-nav]');
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('active',l.getAttribute('href')===`#${entry.target.id}`));
    }), {rootMargin:'-35% 0px -55% 0px',threshold:0});
    sections.forEach(s => so.observe(s));
  }

  const cursor = document.querySelector('.cursor-orb');
  if (cursor && !reduced && finePointer) {
    let x=-500,y=-500,rx=-500,ry=-500;
    addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY});
    const loop=()=>{
      rx+=(x-rx)*.12; ry+=(y-ry)*.12;
      cursor.style.transform=`translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  if (!reduced && finePointer) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(700px) rotateX(${(-py*3).toFixed(2)}deg) rotateY(${(px*3).toFixed(2)}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
