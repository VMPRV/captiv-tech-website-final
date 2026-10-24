/**
 * CAPTIV TECHNO SOLUTIONS — NAVBAR & MEGA-MENU
 * Zoho-Inspired Mega-Menu, Mobile Drawer & Active Highlights
 */

(function () {
  'use strict';

  const header = document.querySelector('.site-header');
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const drawerCloseBtn = document.querySelector('.mobile-drawer-close');

  // 1. Shrink on Scroll
  function handleScroll() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile Drawer Open / Close
  function openDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('active');
    if (mobileOverlay) mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    if (mobileOverlay) mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeDrawer);

  // Close drawer on escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  // 3. Mobile Accordions
  const accordionToggles = document.querySelectorAll('.mobile-accordion-toggle');
  accordionToggles.forEach((toggle) => {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      const panel = this.nextElementSibling;
      const isExpanded = this.classList.contains('expanded');

      // Close all other panels
      accordionToggles.forEach((otherToggle) => {
        if (otherToggle !== this) {
          otherToggle.classList.remove('expanded');
          if (otherToggle.nextElementSibling) {
            otherToggle.nextElementSibling.style.maxHeight = null;
          }
        }
      });

      if (isExpanded) {
        this.classList.remove('expanded');
        if (panel) panel.style.maxHeight = null;
      } else {
        this.classList.add('expanded');
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // 4. Highlight Active Page Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .nav-dropdown a');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('/').pop().split('#')[0];
    if (linkPath === currentPath) {
      link.classList.add('active');
      // If inside nav item, mark parent as active
      const parentItem = link.closest('.nav-item');
      if (parentItem) parentItem.classList.add('active');
    }
  });
})();

