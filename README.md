# CAPTIV Techno Solutions — Enterprise Corporate Website

> **CAPTIV — Excellence. Delivered.**  
> Institutional Performance Engineering for Governments, Financial Institutions, and Global Enterprises.

A production-ready, multi-page corporate website for **CAPTIV Techno Solutions Pvt. Ltd.**, engineered to Zoho-level enterprise design standards. Built with modern, accessible, zero-dependency HTML5, CSS3, and ES6 JavaScript, optimized for ultra-fast load times and deployment on Cloudflare Pages or Cloudflare Workers.

---

## Architecture & Technology Stack

- **Design Philosophy**: Light-theme enterprise grade inspired by [Zoho Corporation](https://www.zohocorp.com/), featuring a sticky glassmorphic navbar with mega-menus, structured high-contrast typography, brand glow accents, and responsive layout.
- **Brand Colors**:
  - Royal Blue: `#0019A0`
  - Deep Blue: `#00007A`
  - Emerald Green: `#08891A`
  - Deep Green: `#04571A`
  - Dark Ink (Headings & Body): `#0B0F1A`
  - Brand Gradient: `linear-gradient(135deg, #0019A0, #08891A)`
  - Background: Pure White (`#FFFFFF`) and Soft Grey-Blue (`#F5F8FC`)
- **Interactive Effects**:
  - Canvas-based dynamic network particle mesh in brand colours.
  - Interactive mouse-following radial spotlight glow on cards.
  - Animated blue-to-green gradient borders on product cards.
  - IntersectionObserver scroll reveals with progressive staggering.
  - Smooth animated number counters (10+ Countries, 50+ Clients, 20+ Partners, 99.9% Uptime).
  - Dynamic scroll-drawn progress line on the "How We Operate" 4-step timeline.
  - Infinite auto-scrolling client and partner marquee (pauses on hover).
  - Animated SVG world map with pulsing geo-hotspots.
  - Multi-select interactive interest chips with real-time form validation and Cloudflare Function endpoint.
  - Top scroll progress bar & floating back-to-top button.
  - Fully responsive mobile drawer navigation with accordion sub-menus.

---

## Directory Structure

```
captivtechwebsite/
├── assets/
│   ├── CAPTIV_NEW_BLACK.png         # Primary logo for light navbar, hero & footer
│   ├── CAPTIV_NEW_BLACK_CROPPED.png # Tightly cropped version for ultra-crisp display
│   ├── CAPTIV_NEW_WHITE.png         # Logo for dark contrast sections (Contact CTA)
│   ├── CAPTIV_NEW_WHITE_CROPPED.png # Cropped white wordmark version
│   ├── captiv-symbol.png            # Ribbon symbol mark (favicon & loaders)
│   ├── favicon.png                  # High-res favicon
│   ├── clients/                     # 18 official client brand logos
│   │   ├── johnson-control.png
│   │   ├── vertiv.png
│   │   ├── ford.png
│   │   ├── philips.png
│   │   ├── redington.png
│   │   ├── tech-mahindra.png
│   │   ├── indian-army.png
│   │   ├── iit-madras.png
│   │   ├── nit-calicut.png
│   │   ├── lion-finance.png
│   │   ├── xtenda-finance.png
│   │   ├── zamtel.png
│   │   ├── fnb-zambia.png
│   │   ├── bancabc.png
│   │   ├── tn-police.png
│   │   ├── ipa.png
│   │   ├── oman-mtcit.png
│   │   └── royal-enfield.png
│   ├── partners/                    # 12 official technology partner logos
│   │   ├── aws.png
│   │   ├── azure.png
│   │   ├── google-cloud.png
│   │   ├── ibm-cloud.png
│   │   ├── oracle.png
│   │   ├── redhat.png
│   │   ├── redington.png
│   │   ├── zoho.png
│   │   ├── netapp.png
│   │   ├── cloudanix.png
│   │   ├── ingram.png
│   │   └── techdata.png
│   ├── flags/                       # SVG national flags (HQ India, UAE, Singapore)
│   │   ├── india.svg
│   │   ├── uae.svg
│   │   └── singapore.svg
│   └── maps/
│       └── world-map.svg            # Scalable world map vector
├── css/
│   ├── main.css                     # Design tokens, typography, utilities, glows, buttons
│   ├── navbar.css                   # Glass sticky navbar, mega-menu, mobile drawer
│   ├── sections.css                 # Homepage sections 1 to 15 in exact sequence
│   └── pages.css                    # Subpage-specific layouts & deep-dives
├── js/
│   ├── hero-canvas.js               # Network particle mesh animation
│   ├── navbar.js                    # Mega-menu, mobile drawer, active page detection
│   ├── contact.js                   # Interest chips, validation, async form transmission
│   └── main.js                      # Scroll progress, counters, spotlight, 3D tilt
├── functions/
│   └── api/
│       └── contact.js               # Cloudflare Pages serverless API function
├── index.html                       # Home page (all 15 enterprise sections)
├── products.html                    # 6 performance engines in-depth (SkyVerse, ProAug, etc.)
├── industries.html                  # Sector breakdowns & outcomes
├── about.html                       # Company overview, operating principle & global nodes
├── work.html                        # Deep institutional case studies
├── partners.html                    # Strategic technology alliances matrix
├── careers.html                     # "Build What Matters" job board & profile pitch
├── insights.html                    # Technical research briefs & whitepapers
├── contact.html                     # Contact page & regional office desks
├── privacy-policy.html              # Enterprise compliance privacy policy
├── terms-of-use.html                # Master terms of use & SLA terms
├── _headers                         # Cloudflare Pages caching & security headers
├── wrangler.toml                    # Cloudflare Pages / Workers deployment config
└── package.json                     # Quick run scripts
```

---

## Local Development

You can run the website locally using any standard static file server:

### Option 1: Python Built-in Server
```bash
python3 -m http.server 8080
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 2: Node.js Serve
```bash
npx serve -p 8080 .
```

### Option 3: Cloudflare Wrangler (Pages Dev with Serverless Function)
```bash
npx wrangler pages dev .
```

---

## Deployment to Cloudflare Pages / Workers

### Deploy to Cloudflare Pages (Recommended)
```bash
npx wrangler pages deploy . --project-name=captiv-website
```
Or connect your GitHub / GitLab repository directly to **Cloudflare Dashboard &rarr; Pages**:
- **Build output directory**: `.` (or root)
- **Build command**: None required (zero-build static site)
- **Functions directory**: `functions/` (auto-detected)

### Cloudflare Environment Variables (Optional)
In your Cloudflare Pages project settings, you can define:
- `WEBHOOK_URL`: (Optional) Slack, Discord, or CRM webhook URL to receive instant lead notifications when the contact form is submitted.

---

## Company Information

**CAPTIV Techno Solutions Pvt. Ltd.**  
*Excellence. Delivered.*

- **HQ India**: 4th Floor, Tower C TEK MEADOWS, 51, Rajiv Gandhi Salai, Sholinganallur, Chennai, Tamil Nadu 600119  
- **Phone**: 044 – 4776 0166  
- **Email**: info@captivtech.com  
- **Regional Hubs**: Dubai (UAE) &middot; Singapore  
- &copy; 2026 CAPTIV Techno Solutions Pvt. Ltd. All rights reserved.

