(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Splash screen ---- */
  const splash = document.getElementById("splash");
  if (splash) {
    if (prefersReduced) {
      splash.parentNode.removeChild(splash);
    } else {
      document.body.classList.add("no-scroll");

      const splashWord = document.getElementById("splash-word");
      const words = [
        "AI · Computer Vision",
        "IoT & Robotics",
        "Defense-target Systems",
        "Full-Stack Web",
        "WordPress · Blockchain",
        "Engineer · Builder · Founder",
      ];
      let wi = 0;
      if (splashWord) {
        splashWord.textContent = words[0];
        splashWord.style.transition = "opacity 300ms ease";
        const cycle = setInterval(() => {
          wi += 1;
          if (wi >= words.length) {
            clearInterval(cycle);
            return;
          }
          splashWord.style.opacity = "0";
          setTimeout(() => {
            splashWord.textContent = words[wi];
            splashWord.style.opacity = "1";
          }, 260);
        }, 680);
      }

      const dismiss = () => {
        if (splash.classList.contains("fade") || splash.classList.contains("done")) return;

        // 1) Content lifts and fades out
        splash.classList.add("fade");

        // 2) Panels rise in a staggered sequence to reveal the page
        setTimeout(() => splash.classList.add("done"), 340);

        // 3) Remove once the last panel finishes
        const cleanup = () => {
          document.body.classList.remove("no-scroll");
          if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
        };
        setTimeout(cleanup, 340 + 1500);
      };

      const hold = setTimeout(dismiss, 4200);
      splash.addEventListener("click", () => {
        clearTimeout(hold);
        dismiss();
      });
    }
  }

  /* ---- Year ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Mobile nav ---- */
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min((i % 6) * 70, 360)}ms`;
      io.observe(el);
    });
  }

  /* ---- Counters ---- */
  const counters = document.querySelectorAll(".counter");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    if (prefersReduced) {
      el.textContent = String(target);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            co.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.target));
  }

  /* ---- Rotating roles (typewriter) ---- */
  const rotator = document.getElementById("rotator");
  if (rotator && !prefersReduced) {
    const roles = [
      "AI products",
      "IoT & robotics",
      "defense-target systems",
      "full-stack web apps",
      "WordPress platforms",
      "blockchain solutions",
    ];
    let roleIdx = 0;
    let charIdx = roles[0].length;
    let deleting = false;

    const tick = () => {
      const current = roles[roleIdx];
      if (!deleting) {
        charIdx++;
        rotator.textContent = current.slice(0, charIdx);
        if (charIdx >= current.length) {
          deleting = true;
          return setTimeout(tick, 1700);
        }
        return setTimeout(tick, 70);
      }
      charIdx--;
      rotator.textContent = current.slice(0, charIdx);
      if (charIdx <= 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        return setTimeout(tick, 240);
      }
      return setTimeout(tick, 38);
    };
    setTimeout(tick, 1700);
  }

  /* ---- Active nav highlighting ---- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll("[data-nav]");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const map = {};
    navLinks.forEach((l) => (map[l.getAttribute("href").slice(1)] = l));
    const so = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = map[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { threshold: 0.5, rootMargin: "-20% 0px -50% 0px" }
    );
    sections.forEach((s) => so.observe(s));
  }

  /* ---- Cursor glow ---- */
  const glow = document.querySelector(".cursor-glow");
  if (glow && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    let raf = null;
    let tx = -1000, ty = -1000;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          glow.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
          raf = null;
        });
      }
    });
  }

  /* ---- Tilt on cards ---- */
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---- Degree info tooltip ---- */
  const infoBtn = document.querySelector(".info-btn");
  const infoPanel = document.querySelector(".info-panel");
  if (infoBtn && infoPanel) {
    infoBtn.addEventListener("click", () => {
      const open = infoPanel.hasAttribute("hidden");
      if (open) {
        infoPanel.removeAttribute("hidden");
        infoBtn.setAttribute("aria-expanded", "true");
      } else {
        infoPanel.setAttribute("hidden", "");
        infoBtn.setAttribute("aria-expanded", "false");
      }
    });
  }
})();
