/**
 * CAPTIV TECHNO SOLUTIONS — HERO CANVAS PARTICLES
 * Animated Network Mesh in Brand Colours (#0019A0 & #08891A)
 */

(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const BRAND_BLUE = 'rgba(0, 25, 160, ';
  const BRAND_GREEN = 'rgba(8, 137, 26, ';

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
    initParticles();
  }

  function initParticles() {
    particles = [];
    const count = Math.floor((width * height) / 16000);
    const particleCount = Math.min(Math.max(count, 35), 75);

    for (let i = 0; i < particleCount; i++) {
      const isGreen = Math.random() > 0.65;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1.2,
        colorBase: isGreen ? BRAND_GREEN : BRAND_BLUE,
        alpha: Math.random() * 0.4 + 0.25
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse gentle repulsion
      if (mouse.x !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 2;
          p.y -= (dy / dist) * force * 2;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.colorBase + p.alpha + ')';
      ctx.fill();

      // Connect adjacent particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 125) {
          const lineAlpha = (1 - dist / 125) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = p.colorBase + lineAlpha + ')';
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY <= rect.bottom && e.clientY >= rect.top) {
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    } else {
      mouse.x = null;
      mouse.y = null;
    }
  });

  window.addEventListener('mouseleave', function () {
    mouse.x = null;
    mouse.y = null;
  });

  resize();
  draw();
})();

