# Md Taibur Rahaman — Portfolio

A fast, animated, single-page portfolio and printable CV for **Md Taibur Rahaman** — AI, IoT &amp; Robotics engineer and technical founder.

Built with plain HTML, CSS, and JavaScript. No build step, no dependencies, fully responsive, accessible, and SEO-optimized.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Taibur-Rahaman/taibur-rahaman-portfolio)

## Features

- Animated splash screen with a name-to-hero shared-element (FLIP) transition
- Slow, smooth gradient motion on the hero name
- Scroll-reveal animations, animated counters, typewriter roles, and 3D card tilt
- Sections: About, Capstone (defense-target projects), Projects, Experience, Ventures, Skills, Education, Contact
- Full SEO: meta tags, Open Graph, Twitter cards, and JSON-LD `Person` structured data
- Print stylesheet — export a clean PDF CV via the browser print dialog
- Respects `prefers-reduced-motion`

## Tech

- HTML5, modern CSS (custom properties, grid, animations)
- Vanilla JavaScript (`IntersectionObserver`, FLIP transitions)
- Google Fonts: Syne, Space Grotesk, IBM Plex Mono

## Local development

No tooling required. Serve the folder with any static server:

```bash
python3 -m http.server 8765
```

Then open [http://localhost:8765](http://localhost:8765).

## Deploy

### Vercel (recommended)

```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```

Or click the **Deploy with Vercel** button above to import this repository directly.

### Download CV

Click **Download CV** in the navigation to download the ATS-friendly PDF (`Md-Taibur-Rahaman-CV.pdf`). The source is `cv.html`; regenerate with headless Chrome:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --no-pdf-header-footer \
  --print-to-pdf="Md-Taibur-Rahaman-CV.pdf" "file://$PWD/cv.html"
```

## Project structure

```
.
├── index.html                  # Markup and content
├── styles.css                  # Design system, layout, animations, print styles
├── script.js                   # Splash, reveals, counters, morph transition
├── cv.html                     # ATS-friendly CV source
├── Md-Taibur-Rahaman-CV.pdf    # Generated ATS PDF (linked from Download CV)
├── vercel.json                 # Static hosting config + headers
├── LICENSE                     # MIT
└── README.md
```

## License

[MIT](LICENSE) © Md Taibur Rahaman
