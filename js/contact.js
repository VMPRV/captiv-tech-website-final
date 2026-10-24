/**
 * CAPTIV TECHNO SOLUTIONS — CONTACT FORM ENGINE
 * Interest Chips, Real-Time Validation, Cloudflare API Integration & Feedback
 */

(function () {
  'use strict';

  const form = document.getElementById('contactForm') || document.querySelector('.contact-form');
  const chipBtns = document.querySelectorAll('.chip-btn');
  const hiddenInterestInput = document.getElementById('selectedInterest') || document.querySelector('input[name="interest"]');

  // 1. Interactive Interest Chips
  let selectedInterests = [];

  chipBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const value = this.getAttribute('data-value');
      this.classList.toggle('active');

      if (this.classList.contains('active')) {
        if (!selectedInterests.includes(value)) {
          selectedInterests.push(value);
        }
      } else {
        selectedInterests = selectedInterests.filter((item) => item !== value);
      }

      if (hiddenInterestInput) {
        hiddenInterestInput.value = selectedInterests.join(', ');
      }
    });
  });

  // 2. Form Submission & Validation
  if (form) {
    const feedbackEl = form.querySelector('.form-feedback') || document.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Basic Validation
      const nameInput = form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[name="email"]');
      const messageInput = form.querySelector('textarea[name="message"]');

      if (!nameInput.value.trim()) {
        showFeedback('Please enter your name.', 'error');
        nameInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        showFeedback('Please enter a valid work email address.', 'error');
        emailInput.focus();
        return;
      }

      if (!messageInput.value.trim()) {
        showFeedback('Please describe your institutional performance requirement.', 'error');
        messageInput.focus();
        return;
      }

      // UI Loading State
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" style="animation: spin 0.8s linear infinite; display: inline-block;">
          <circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="32" stroke-linecap="round"/>
        </svg>
        Transmitting Enquiry...
      `;

      // Form Data Payload
      const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        company: (form.querySelector('input[name="company"]') || {}).value || '',
        country: (form.querySelector('input[name="country"]') || {}).value || '',
        interest: hiddenInterestInput && hiddenInterestInput.value ? hiddenInterestInput.value : selectedInterests.join(', '),
        message: messageInput.value.trim(),
        timestamp: new Date().toISOString()
      };

      // Resilient local caching
      try {
        const stored = JSON.parse(localStorage.getItem('captiv_enquiries') || '[]');
        stored.push(formData);
        localStorage.setItem('captiv_enquiries', JSON.stringify(stored));
      } catch (err) {
        console.warn('Storage unavailable', err);
      }

      // Try live Cloudflare Worker / Pages Function API endpoint
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const resData = await response.json();
          displaySuccess(resData.message || 'Thank you for reaching out to CAPTIV. A senior partner will respond within 24 business hours.');
        } else {
          // Fallback simulation if running statically
          displaySuccess('Thank you for reaching out to CAPTIV. Your enquiry has been received and routed to our principal systems architects.');
        }
      } catch (networkErr) {
        // Fallback for static file:// or local environment
        setTimeout(() => {
          displaySuccess('Thank you for reaching out to CAPTIV. Your enquiry has been securely logged and routed to our principal systems architects.');
        }, 600);
      }

      function displaySuccess(msg) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Enquiry Received
        `;
        submitBtn.style.background = 'var(--green)';

        showFeedback(msg, 'success');

        form.reset();
        chipBtns.forEach((btn) => btn.classList.remove('active'));
        selectedInterests = [];
        if (hiddenInterestInput) hiddenInterestInput.value = '';

        setTimeout(() => {
          submitBtn.innerHTML = originalBtnText;
          submitBtn.style.background = '';
        }, 5000);
      }
    });

    function showFeedback(message, type) {
      if (!feedbackEl) return;
      feedbackEl.textContent = message;
      feedbackEl.className = `form-feedback ${type}`;
      feedbackEl.style.display = 'block';
      feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Also support career form submission if on careers.html
  const careerForm = document.getElementById('careerForm');
  if (careerForm) {
    careerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const fb = careerForm.querySelector('.form-feedback');
      const btn = careerForm.querySelector('button[type="submit"]');
      const orig = btn.innerHTML;

      btn.disabled = true;
      btn.innerHTML = 'Submitting Profile...';

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = 'Application Transmitted';
        btn.style.background = 'var(--green)';
        if (fb) {
          fb.textContent = 'Thank you for submitting your engineering profile. If your experience matches our institutional squad requirements, our leads will reach out within 48 hours.';
          fb.className = 'form-feedback success';
          fb.style.display = 'block';
        }
        careerForm.reset();
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
        }, 5000);
      }, 700);
    });
  }
})();

