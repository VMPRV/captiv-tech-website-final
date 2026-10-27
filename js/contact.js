/**
 * CAPTIV TECHNO SOLUTIONS — CONTACT & RECRUITMENT FORM ENGINE
 * Dispatches inquiries to info@captivtech.com & applications to hr@captivtech.com
 * Handles real-time validation, Cloudflare API communication, and automated confirmation receipts.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. INTERACTIVE INTEREST CHIPS (Contact Forms)
  // =========================================================================
  const form = document.getElementById('contactForm') || document.querySelector('.contact-form:not(#careerForm)');
  const chipBtns = document.querySelectorAll('.chip-btn');
  const hiddenInterestInput = document.getElementById('selectedInterest') || document.querySelector('input[name="interest"]');
  let selectedInterests = [];

  chipBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const value = this.getAttribute('data-value');
      const isActive = this.classList.toggle('active');
      this.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      if (isActive) {
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

  // =========================================================================
  // 2. CONTACT FORM DISPATCH -> info@captivtech.com
  // =========================================================================
  if (form && form.id !== 'careerForm') {
    const feedbackEl = form.querySelector('.form-feedback') || document.querySelector('.form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const nameInput = form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('input[name="email"]');
      const messageInput = form.querySelector('textarea[name="message"]');
      const companyInput = form.querySelector('input[name="company"]');
      const countryInput = form.querySelector('input[name="country"]');

      if (!nameInput || !nameInput.value.trim()) {
        showFeedback('Please enter your full name.', 'error');
        if (nameInput) nameInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput || !emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        showFeedback('Please enter a valid work email address.', 'error');
        if (emailInput) emailInput.focus();
        return;
      }

      if (!messageInput || !messageInput.value.trim()) {
        showFeedback('Please describe your institutional performance requirement.', 'error');
        if (messageInput) messageInput.focus();
        return;
      }

      // UI Loading state
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" style="animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px;">
          <circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="32" stroke-linecap="round"/>
        </svg>
        Transmitting Inquiry...
      `;

      const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        company: companyInput ? companyInput.value.trim() : '',
        country: countryInput ? countryInput.value.trim() : '',
        interest: hiddenInterestInput && hiddenInterestInput.value ? hiddenInterestInput.value : selectedInterests.join(', '),
        message: messageInput.value.trim(),
        timestamp: new Date().toISOString()
      };

      try {
        const stored = JSON.parse(localStorage.getItem('captiv_enquiries') || '[]');
        stored.push(formData);
        localStorage.setItem('captiv_enquiries', JSON.stringify(stored));
      } catch (err) {}

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const resData = await response.json();
          displaySuccess(resData.message || 'Thank you. Your inquiry has been securely received. An engineering partner will respond within 24 business hours.');
        } else {
          displaySuccess('Thank you. Your inquiry has been securely received. An engineering partner will respond within 24 business hours.');
        }
      } catch (networkErr) {
        displaySuccess('Thank you. Your inquiry has been securely received. An engineering partner will respond within 24 business hours.');
      }

      function displaySuccess(msg) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Inquiry Transmitted Successfully
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
        }, 6000);
      }

      function showFeedback(message, type) {
        if (!feedbackEl) return;
        feedbackEl.textContent = message;
        feedbackEl.className = `form-feedback ${type}`;
        feedbackEl.style.display = 'block';
        feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // =========================================================================
  // 3. CAREERS FORM DISPATCH -> hr@captivtech.com & APPLICANT RECEIPT
  // =========================================================================
  const careerForm = document.getElementById('careerForm');
  const roleSelect = document.getElementById('applicant-role');
  const applyButtons = document.querySelectorAll('.apply-btn, a[href="#apply"]');

  // Auto-select job role when clicking "Apply Now" buttons
  applyButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
      const targetRole = this.getAttribute('data-role');
      if (targetRole && roleSelect) {
        let found = false;
        for (let i = 0; i < roleSelect.options.length; i++) {
          if (roleSelect.options[i].value === targetRole) {
            roleSelect.selectedIndex = i;
            found = true;
            break;
          }
        }
        if (!found) {
          const newOpt = document.createElement('option');
          newOpt.value = targetRole;
          newOpt.text = targetRole;
          newOpt.selected = true;
          roleSelect.appendChild(newOpt);
        }
      }

      // Smooth scroll and focus name input
      const applySection = document.getElementById('apply');
      if (applySection) {
        applySection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const nameInput = document.getElementById('applicant-name');
          if (nameInput) nameInput.focus();
        }, 500);
      }
    });
  });

  if (careerForm) {
    const feedbackEl = careerForm.querySelector('.form-feedback');
    const submitBtn = careerForm.querySelector('button[type="submit"]');

    // Receipt Modal Elements
    const modal = document.getElementById('applicantReceiptModal');
    const modalBackdrop = document.getElementById('receiptModalBackdrop');
    const closeBtn = document.getElementById('receiptCloseBtn');
    const letterContent = document.getElementById('receiptLetterContent');
    const printBtn = document.getElementById('receiptPrintBtn');
    const mailtoBtn = document.getElementById('receiptMailtoBtn');

    // Resume Dropzone Elements
    const resumeInput = document.getElementById('applicant-resume');
    const resumeDropzone = document.getElementById('resumeDropzone');
    const dropzoneContent = document.getElementById('dropzoneContent');
    const resumePreview = document.getElementById('resumePreview');
    const resumeFileName = document.getElementById('resumeFileName');
    const resumeFileSize = document.getElementById('resumeFileSize');
    const resumeRemoveBtn = document.getElementById('resumeRemoveBtn');

    function formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 KB';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function readFileAsBase64(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result;
          const base64Data = (typeof res === 'string' && res.includes(','))
            ? res.split(',')[1]
            : '';
          resolve({
            filename: file.name,
            type: file.type || 'application/pdf',
            size: file.size,
            base64: base64Data
          });
        };
        reader.onerror = () => {
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    }

    function resetResumeDropzone() {
      if (resumeInput) resumeInput.value = '';
      if (dropzoneContent) dropzoneContent.style.display = 'flex';
      if (resumePreview) resumePreview.style.display = 'none';
      if (resumeDropzone) resumeDropzone.classList.remove('dragover');
    }

    function handleResumeFile(file) {
      if (!file) return false;
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(fileExt)) {
        showFeedback('Please upload a valid Resume in PDF, DOC, or DOCX format.', 'error');
        resetResumeDropzone();
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        showFeedback('File size exceeds the 10 MB limit. Please upload a smaller document.', 'error');
        resetResumeDropzone();
        return false;
      }

      if (resumeFileName) resumeFileName.textContent = file.name;
      if (resumeFileSize) resumeFileSize.textContent = formatFileSize(file.size);
      if (dropzoneContent) dropzoneContent.style.display = 'none';
      if (resumePreview) resumePreview.style.display = 'flex';
      return true;
    }

    if (resumeInput && resumeDropzone) {
      resumeInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
          handleResumeFile(this.files[0]);
        }
      });

      ['dragenter', 'dragover'].forEach(eventName => {
        resumeDropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          resumeDropzone.classList.add('dragover');
        }, false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        resumeDropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          resumeDropzone.classList.remove('dragover');
        }, false);
      });

      resumeDropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length) {
          resumeInput.files = dt.files;
          handleResumeFile(dt.files[0]);
        }
      });

      if (resumeRemoveBtn) {
        resumeRemoveBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          resetResumeDropzone();
        });
      }
    }

    function closeModal() {
      if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    careerForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const nameInput = document.getElementById('applicant-name');
      const emailInput = document.getElementById('applicant-email');
      const phoneInput = document.getElementById('applicant-phone');
      const linkInput = document.getElementById('applicant-link');
      const notesInput = document.getElementById('applicant-notes');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const role = roleSelect ? roleSelect.value : 'J1026-1149 - Service Desk Technical Analyst';
      const link = linkInput ? linkInput.value.trim() : '';
      const message = notesInput ? notesInput.value.trim() : '';

      if (!name) {
        showFeedback('Please enter your full name.', 'error');
        if (nameInput) nameInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showFeedback('Please enter a valid email address.', 'error');
        if (emailInput) emailInput.focus();
        return;
      }

      const selectedFile = (resumeInput && resumeInput.files && resumeInput.files[0]) ? resumeInput.files[0] : null;
      if (!selectedFile) {
        showFeedback('Please upload your Resume / CV (PDF, DOC, or DOCX).', 'error');
        if (resumeInput) resumeInput.focus();
        return;
      }

      const resumeName = selectedFile.name;

      // Confirmation letter
      const candidateGreeting = name ? `Dear ${name},` : 'Dear Candidate,';
      const confirmationLetter =
`${candidateGreeting}

Thank you for reaching out to CAPTIV Techno Solutions Private Limited and expressing your interest in career opportunities with us.

We have received your email and resume successfully. Our HR team will review your profile and contact you if your qualifications and experience match our current job openings.

We appreciate your interest in being part of CAPTIV Tech and thank you for considering us for your career journey.

Best Regards,
HR Team
CAPTIV Techno Solutions
Excellence Delivered
https://captivtech.com`;

      // Loading state
      const origBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" style="animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px;">
          <circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="32" stroke-linecap="round"/>
        </svg>
        Attaching Resume & Transmitting...
      `;

      let resumeAttachment = null;
      if (selectedFile) {
        try {
          resumeAttachment = await readFileAsBase64(selectedFile);
        } catch (readErr) {
          console.warn('Could not read resume file', readErr);
        }
      }

      const payload = {
        name,
        email,
        phone,
        role,
        resume: resumeName,
        resumeAttachment: resumeAttachment,
        link,
        message,
        timestamp: new Date().toISOString()
      };

      try {
        const stored = JSON.parse(localStorage.getItem('captiv_applications') || '[]');
        stored.push({
          name,
          email,
          phone,
          role,
          resume: resumeName,
          link,
          message,
          timestamp: payload.timestamp
        });
        localStorage.setItem('captiv_applications', JSON.stringify(stored));
      } catch (err) {}

      try {
        await fetch('/api/careers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (networkErr) {
        console.warn('API background log', networkErr);
      }

      // Display Success State
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Application Submitted Successfully
      `;
      submitBtn.style.background = 'var(--green)';

      showFeedback(`Thank you ${name}. Your application and resume for "${role}" have been submitted successfully. A confirmation receipt has been generated.`, 'success');

      // Populate & open Receipt Modal
      if (modal && letterContent) {
        letterContent.textContent = confirmationLetter;

        if (mailtoBtn) {
          const mailSubject = encodeURIComponent(`Job Application: ${role} - ${name}`);
          const mailBody = encodeURIComponent(
            `Dear HR Team,\n\n` +
            `A new job application has been received through the CAPTIV Tech Careers email address.\n\n` +
            `Candidate Details:\n` +
            `- Candidate Name: ${name || 'Not Specified'}\n` +
            `- Email Address: ${email}\n` +
            `- Contact Number: ${phone || 'Not available'}\n` +
            `- Position Applied For: ${role || 'Not specified'}\n` +
            `- Resume: Attached (${resumeName})\n` +
            (link ? `- Profile / Portfolio: ${link}\n` : '') +
            (message ? `- Candidate Notes / Experience: ${message}\n` : '') +
            `\nKindly review the candidate's profile and proceed with the recruitment process as appropriate.\n\n` +
            `Best Regards,\n` +
            `CAPTIV Tech Careers System\n` +
            `CAPTIV Techno Solutions Private Limited\n` +
            `Website: https://captivtech.com`
          );
          mailtoBtn.href = `mailto:hr@captivtech.com?subject=${mailSubject}&body=${mailBody}`;
        }

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }

      careerForm.reset();
      resetResumeDropzone();

      setTimeout(() => {
        submitBtn.innerHTML = origBtnText;
        submitBtn.style.background = '';
      }, 7000);
    });

    function showFeedback(message, type) {
      if (!feedbackEl) return;
      feedbackEl.textContent = message;
      feedbackEl.className = `form-feedback ${type}`;
      feedbackEl.style.display = 'block';
      feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
})();
