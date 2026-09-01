(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const splash = document.getElementById("splash");
  if (splash) {
    if (prefersReduced) {
      splash.parentNode.removeChild(splash);
    } else {
      document.body.classList.add("no-scroll");
      const splashWord = document.getElementById("splash-word");
      const words = ["AI · Computer Vision", "IoT & Robotics", "Defense-target Systems", "Full-Stack Web", "WordPress · Blockchain", "Engineer · Builder · Founder"];
      let wi = 0;
      if (splashWord) {
        splashWord.textContent = words[0];
        splashWord.style.transition = "opacity 300ms ease";
        const cycle = setInterval(() => {
          wi += 1;
          if (wi >= words.length) return clearInterval(cycle);
          splashWord.style.opacity = "0";
          setTimeout(() => { splashWord.textContent = words[wi]; splashWord.style.opacity = "1"; }, 260);
        }, 680);
      }
      const dismiss = () => {
        if (splash.classList.contains("fade") || splash.classList.contains("done")) return;
        splash.classList.add("fade");
        setTimeout(() => splash.classList.add("done"), 340);
        setTimeout(() => {
          document.body.classList.remove("no-scroll");
          if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
        }, 1590);
      };
      const hold = setTimeout(dismiss, 4200);
      splash.addEventListener("click", () => { clearTimeout(hold); dismiss(); });
    }
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    }));
  }

  const reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el, i) => { el.style.transitionDelay = `${Math.min((i % 6) * 70, 360)}ms`; io.observe(el); });
  }

  const counters = document.querySelectorAll(".counter");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    if (prefersReduced) return void (el.textContent = String(target));
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1200, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { animateCount(entry.target); co.unobserve(entry.target); }
    }), { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  } else counters.forEach((c) => (c.textContent = c.dataset.target));

  const rotator = document.getElementById("rotator");
  if (rotator && !prefersReduced) {
    const roles = ["AI products", "IoT & robotics", "defense-target systems", "full-stack web apps", "WordPress platforms", "blockchain solutions"];
    let roleIdx = 0, charIdx = roles[0].length, deleting = false;
    const tick = () => {
      const current = roles[roleIdx];
      if (!deleting) {
        charIdx++; rotator.textContent = current.slice(0, charIdx);
        if (charIdx >= current.length) { deleting = true; return setTimeout(tick, 1700); }
        return setTimeout(tick, 70);
      }
      charIdx--; rotator.textContent = current.slice(0, charIdx);
      if (charIdx <= 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; return setTimeout(tick, 240); }
      return setTimeout(tick, 38);
    };
    setTimeout(tick, 1700);
  }

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll("[data-nav]");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const map = {};
    navLinks.forEach((l) => (map[l.getAttribute("href").slice(1)] = l));
    const so = new IntersectionObserver((entries) => entries.forEach((entry) => {
      const link = map[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting) { navLinks.forEach((l) => l.classList.remove("active")); link.classList.add("active"); }
    }), { threshold: 0.5, rootMargin: "-20% 0px -50% 0px" });
    sections.forEach((s) => so.observe(s));
  }

  const glow = document.querySelector(".cursor-glow");
  if (glow && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    let raf = null, tx = -1000, ty = -1000;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => { glow.style.transform = `translate3d(${tx}px, ${ty}px, 0)`; raf = null; });
    });
  }

  const bindTilt = (root = document) => {
    if (prefersReduced || !window.matchMedia("(pointer: fine)").matches) return;
    root.querySelectorAll(".tilt").forEach((card) => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "true";
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  };
  bindTilt();

  const infoBtn = document.querySelector(".info-btn");
  const infoPanel = document.querySelector(".info-panel");
  if (infoBtn && infoPanel) infoBtn.addEventListener("click", () => {
    const open = infoPanel.hasAttribute("hidden");
    if (open) { infoPanel.removeAttribute("hidden"); infoBtn.setAttribute("aria-expanded", "true"); }
    else { infoPanel.setAttribute("hidden", ""); infoBtn.setAttribute("aria-expanded", "false"); }
  });

  /* ---- LinkedIn profile photo ---- */
  const heroInner = document.querySelector(".hero-inner");
  const heroTitle = document.getElementById("hero-title");
  if (heroInner && heroTitle && !document.querySelector(".profile-photo-wrap")) {
    const photo = document.createElement("div");
    photo.className = "profile-photo-wrap reveal in";
    photo.setAttribute("aria-label", "Md Taibur Rahaman profile photo");
    photo.style.cssText = "position:relative;width:132px;height:132px;margin:0 0 26px;border-radius:50%;padding:5px;background:linear-gradient(135deg,rgba(255,255,255,.22),rgba(255,255,255,.03));box-shadow:0 18px 60px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.08);overflow:visible;";
    photo.innerHTML = `
      <img class="profile-photo" src="https://media.licdn.com/dms/image/v2/D5603AQG6KqwHEhGG2A/profile-displayphoto-crop_800_800/B56aAqzm.ZI0AM-/0/1787424569528?e=1789603200&v=beta&t=MdsiQ4C0LR9PSpF41IXLStNvEFnQZWp3NpQ3afARba0" alt="Md Taibur Rahaman" loading="eager" decoding="async" style="display:block;width:100%;height:100%;object-fit:cover;border-radius:50%;">
      <span class="profile-photo-ring" aria-hidden="true" style="position:absolute;inset:-8px;border:1px solid rgba(255,255,255,.12);border-radius:50%;pointer-events:none;"></span>
    `;
    heroTitle.parentNode.insertBefore(photo, heroTitle);
  }

  /* ---- Latest projects ---- */
  const projectGrid = document.querySelector(".project-grid");
  if (projectGrid && !projectGrid.dataset.latestProjectsAdded) {
    projectGrid.dataset.latestProjectsAdded = "true";
    const latestProjects = [
      { tag: "NEW · AI", name: "ReplyPilot AI", description: "AI employee platform for Bangladesh SMBs with shared memory, RAG, CRM, sales automation, and controlled human handoff.", tech: ["Next.js", "TypeScript", "PostgreSQL", "pgvector"], url: "https://github.com/Taibur-Rahaman/Reply-Pilot-Ai" },
      { tag: "NEW · E-COMMERCE AI", name: "Prodexa AI", description: "Hosted product-discovery platform for WordPress and WooCommerce stores, with tenant-scoped discovery, licensing, HMAC APIs, and a WordPress client plugin.", tech: ["Node.js", "Fastify", "PostgreSQL", "WordPress"], url: "https://github.com/Taibur-Rahaman/Prodexa-AI---Product-Recommendation-Engine" },
      { tag: "NEW · FINTECH", name: "BeePay", description: "Bangladesh-first WooCommerce payment gateway supporting bKash, Nagad, Rocket, and SSLCommerz with encrypted credential storage and sandbox support.", tech: ["PHP", "WooCommerce", "bKash", "Nagad"], url: "https://github.com/Taibur-Rahaman/BeePay--WooCommerce-Bangladesh-Payment-Gateway" },
      { tag: "NEW · DESKTOP", name: "MRX FlipClock ScreenSaver", description: "Flipqlo-style flip clock screensaver for Windows, macOS, Linux, and the web, with a live browser demo and platform installers.", tech: ["JavaScript", "WebView", "CSS", "Desktop"], url: "https://github.com/Taibur-Rahaman/MRX-FlipClock-ScreenSaver" },
      { tag: "NEW · MEDTECH", name: "BaigMed", description: "Medical technology platform project focused on building practical digital healthcare workflows and tools.", tech: ["Healthcare", "Software", "Product"], url: "https://github.com/Taibur-Rahaman/BaigMed" },
      { tag: "NEW · AI SECURITY", name: "Agent2Wp AI WordPress Agent", description: "Security-focused WordPress AI agent layer with fail-closed risk classification, permission gating, audit logging, and controlled execution.", tech: ["PHP", "WordPress", "MCP", "AI Security"], url: "https://github.com/Taibur-Rahaman/Agent2Wp-AI-WordPress-Agent" }
    ];
    latestProjects.reverse().forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-card reveal in tilt";
      card.innerHTML = `<div class="project-card-top"><span class="project-tag">${project.tag}</span><h3>${project.name}</h3></div><p>${project.description}</p><ul class="tech-list">${project.tech.map((item) => `<li>${item}</li>`).join("")}</ul><a class="project-link" href="${project.url}" target="_blank" rel="noopener noreferrer">View repository →</a>`;
      projectGrid.prepend(card);
    });
    bindTilt(projectGrid);
  }
})();
