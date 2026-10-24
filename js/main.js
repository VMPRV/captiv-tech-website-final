/**
 * CAPTIV TECHNO SOLUTIONS — MAIN INTERACTIVITY ENGINE
 * Scroll Progress, Reveals, Counters, Spotlight Glow, 3D Tilt & Timeline
 */

(function () {
  'use strict';

  // 1. Scroll Progress Bar
  const progressBar = document.querySelector('.scroll-progress-bar');
  const backToTopBtn = document.querySelector('.back-to-top');

  function updateScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar && docHeight > 0) {
      const scrolled = (scrollTop / docHeight) * 100;
      progressBar.style.width = scrolled + '%';
    }

    if (backToTopBtn) {
      if (scrollTop > 450) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }

    // Dynamic How We Operate Timeline Drawing
    updateTimelineProgress();
  }

  window.addEventListener('scroll', updateScroll, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 2. Intersection Observer for Scroll Reveals
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.12
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // 3. Animated Number Counters
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  function runCounters() {
    counters.forEach((counter) => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';
      const isDecimal = target % 1 !== 0;
      const duration = 1800; // ms
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out quad
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = isDecimal
          ? (easeProgress * target).toFixed(1)
          : Math.floor(easeProgress * target);

        counter.textContent = prefix + current + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = prefix + (isDecimal ? target.toFixed(1) : target) + suffix;
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  if (counters.length > 0) {
    const counterContainer = document.querySelector('.hero-stats-row') || counters[0];
    if (counterContainer && 'IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersAnimated) {
            countersAnimated = true;
            runCounters();
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });

      counterObserver.observe(counterContainer);
    } else {
      runCounters();
    }
  }

  // 4. Cursor Spotlight Follow on Cards
  const spotlightCards = document.querySelectorAll('.spotlight-card');
  spotlightCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 5. Dynamic "How We Operate" Timeline Drawing
  function updateTimelineProgress() {
    const timelineWrap = document.querySelector('.operate-timeline-wrap');
    const progressLine = document.querySelector('.timeline-progress-line');
    if (!timelineWrap || !progressLine) return;

    const rect = timelineWrap.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate percentage based on scroll position through section
    if (rect.top <= windowHeight * 0.7 && rect.bottom >= windowHeight * 0.2) {
      const totalDist = windowHeight * 0.5;
      const current = windowHeight * 0.7 - rect.top;
      const pct = Math.min(Math.max((current / totalDist) * 100, 0), 100);
      progressLine.style.width = `${pct}%`;
    } else if (rect.top > windowHeight * 0.7) {
      progressLine.style.width = '0%';
    } else if (rect.bottom < windowHeight * 0.2) {
      progressLine.style.width = '100%';
    }
  }

  // 6. Interactive 3D Card Tilt
  const tiltCards = document.querySelectorAll('.product-glow-card, .case-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Call initial scroll update
  updateScroll();
})();

