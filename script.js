(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const soundKey = 'taibur-interface-sound';
  let soundOn = localStorage.getItem(soundKey) !== 'off';
  let audioCtx = null;

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
    soundOn = !soundOn; localStorage.setItem(soundKey, soundOn ? 'on' : 'off'); updateSoundButton();
    if (soundOn) playSound('success');
  });
  updateSoundButton();
  document.addEventListener('pointerdown', () => ensureAudio(), {once:true,passive:true});

  document.querySelectorAll('[data-sound]').forEach(el => {
    el.addEventListener('mouseenter', () => { if (el.dataset.sound==='hover'||el.dataset.sound==='card') playSound(el.dataset.sound); }, {passive:true});
    el.addEventListener('click', () => playSound(el.dataset.sound), {passive:true});
  });

  // Reliable opening splash: always starts before content is revealed, waits for the page,
  // and keeps the animation long enough to be visible without trapping the user.
  const loader = document.getElementById('loader');
  const finishLoader = () => {
    if (!loader) return;
    loader.classList.add('hide');
    document.body.classList.remove('loading');
    setTimeout(() => loader.remove(), reduced ? 0 : 900);
  };
  const minimumSplash = reduced ? 250 : 1650;
  const started = performance.now();
  const waitForPage = () => {
    const elapsed = performance.now() - started;
    const wait = Math.max(0, minimumSplash - elapsed);
    setTimeout(finishLoader, wait);
  };
  if (document.readyState === 'complete') waitForPage();
  else window.addEventListener('load', waitForPage, {once:true});
  setTimeout(() => { if (loader && !loader.classList.contains('hide')) finishLoader(); }, reduced ? 1200 : 5000);

  const reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) reveals.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    }), {threshold:.12,rootMargin:'0px 0px -7% 0px'});
    reveals.forEach((el,i) => { el.style.transitionDelay=`${Math.min(i%5,4)*65}ms`; io.observe(el); });
  }

  const menuButton = document.getElementById('menuButton'), menu = document.getElementById('menu');
  const closeMenu = () => { menu?.classList.remove('open'); menuButton?.setAttribute('aria-expanded','false'); menuButton?.setAttribute('aria-label','Open menu'); };
  menuButton?.addEventListener('click', () => {
    const open = !menu.classList.contains('open'); menu.classList.toggle('open',open);
    menuButton.setAttribute('aria-expanded',String(open)); menuButton.setAttribute('aria-label',open?'Close menu':'Open menu'); playSound(open?'open':'close');
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
  if (cursor && !reduced && matchMedia('(pointer:fine)').matches) {
    let x=-500,y=-500,rx=-500,ry=-500;
    addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY});
    const loop=()=>{rx+=(x-rx)*.12;ry+=(y-ry)*.12;cursor.style.transform=`translate3d(${rx}px,${ry}px,0)`;requestAnimationFrame(loop)}; loop();
  }

  if (!reduced && matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(700px) rotateX(${(-py*3).toFixed(2)}deg) rotateY(${(px*3).toFixed(2)}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
  }

  const year = document.getElementById('year'); if (year) year.textContent = new Date().getFullYear();
})();
