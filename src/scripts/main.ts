import '../styles/main.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initHeaderScroll(): void {
  const header = document.querySelector<HTMLElement>('.tcd-header');
  if (!header) return;

  const updateScroll = (): void => {
    if (window.scrollY > 36) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });
}

function initDesktopDropdown(): void {
  const dropdownItems = document.querySelectorAll<HTMLElement>('[data-dropdown-item]');

  dropdownItems.forEach((item) => {
    const trigger = item.querySelector<HTMLElement>('[data-dropdown-trigger]');
    let closeTimer: number | undefined;

    const openMenu = (): void => {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = undefined;
      }
      item.classList.add('is-open');
      trigger?.setAttribute('aria-expanded', 'true');
    };

    const scheduleClose = (): void => {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
      }
      closeTimer = window.setTimeout(() => {
        item.classList.remove('is-open');
        trigger?.setAttribute('aria-expanded', 'false');
      }, 150);
    };

    item.addEventListener('mouseenter', openMenu);
    item.addEventListener('mouseleave', scheduleClose);

    item.addEventListener('focusin', openMenu);
    item.addEventListener('focusout', (e: FocusEvent) => {
      const nextTarget = e.relatedTarget as Node | null;
      if (!nextTarget || !item.contains(nextTarget)) {
        scheduleClose();
      }
    });

    trigger?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
  });
}

function initMobileMenu(): void {
  const openBtn = document.querySelector<HTMLButtonElement>('[data-mobile-open]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-mobile-close]');
  const drawer = document.querySelector<HTMLElement>('[data-mobile-drawer]');

  if (!openBtn || !closeBtn || !drawer) return;

  const setMenuState = (open: boolean): void => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';

    if (open) {
      closeBtn.focus();
    } else {
      openBtn.focus();
    }
  };

  openBtn.addEventListener('click', () => setMenuState(true));
  closeBtn.addEventListener('click', () => setMenuState(false));

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      setMenuState(false);
    }
  });
}

function initHomeServicePreview(): void {
  const rows = document.querySelectorAll<HTMLElement>('[data-service-preview]');
  const previewImg = document.querySelector<HTMLImageElement>('#home-service-preview-img');
  const previewCaption = document.querySelector<HTMLElement>('#home-service-preview-caption');

  if (!rows.length || !previewImg || !previewCaption) return;

  rows.forEach((row) => {
    const activate = (): void => {
      const src = row.dataset.previewSrc;
      const alt = row.dataset.previewAlt;
      const caption = row.dataset.previewCaption;

      rows.forEach((r) => r.classList.remove('is-active'));
      row.classList.add('is-active');

      if (src && previewImg.getAttribute('src') !== src) {
        previewImg.style.opacity = '0.35';
        window.setTimeout(() => {
          previewImg.setAttribute('src', src);
          if (alt) previewImg.setAttribute('alt', alt);
          if (caption) previewCaption.textContent = caption;
          previewImg.style.opacity = '1';
        }, 110);
      }
    };

    row.addEventListener('mouseenter', activate);
    row.addEventListener('focus', activate);
  });
}

function initAnimations(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Hero entrance reveal
  const heroItems = document.querySelectorAll('[data-hero-reveal]');
  if (heroItems.length) {
    gsap.from(heroItems, {
      y: 26,
      opacity: 0,
      duration: 0.75,
      stagger: 0.09,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    });
  }

  // Hero background image subtle parallax
  const heroParallax = document.querySelector<HTMLElement>('[data-hero-parallax]');
  if (heroParallax) {
    gsap.to(heroParallax, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.tcd-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // Landscape / image subtle scroll parallax
  document.querySelectorAll<HTMLElement>('[data-parallax-img]').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -4, scale: 1.06 },
      {
        yPercent: 4,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentElement || img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });

  // Scroll-triggered editorial content reveals
  document.querySelectorAll<HTMLElement>('[data-scroll-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 24,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true,
      },
    });
  });

  // Photo clip-path & settle reveal
  document.querySelectorAll<HTMLElement>('[data-photo-reveal]').forEach((frame) => {
    gsap.from(frame, {
      clipPath: 'inset(6% 0% 0% 0%)',
      opacity: 0.85,
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'clipPath,opacity',
      scrollTrigger: {
        trigger: frame,
        start: 'top 85%',
        once: true,
      },
    });
  });
}

function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('#tcd-quote-form');
  if (!form) return;

  const statusBox = document.querySelector<HTMLElement>('#tcd-form-status');
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const submitLabel = submitBtn?.querySelector<HTMLElement>('[data-submit-label]');
  const issueSelect = form.querySelector<HTMLSelectElement>('#issue');
  const locationInput = form.querySelector<HTMLInputElement>('#location');

  let csrfToken = '';

  // Pre-fill plumbing issue or area if passed via query string
  const params = new URLSearchParams(window.location.search);
  const prefillService = params.get('service');
  if (prefillService && issueSelect) {
    const matched = Array.from(issueSelect.options).find(
      (opt) => opt.value.toLowerCase() === prefillService.toLowerCase()
    );
    if (matched) {
      issueSelect.value = matched.value;
    }
  }
  const prefillArea = params.get('area');
  if (prefillArea && locationInput && !locationInput.value) {
    locationInput.value = prefillArea;
  }

  const fetchCsrf = async (): Promise<void> => {
    try {
      const resp = await fetch('/api/csrf-token', { cache: 'no-store' });
      if (resp.ok) {
        const data = (await resp.json()) as { csrfToken?: string };
        csrfToken = data.csrfToken || '';
      }
    } catch {
      // Handled during submit if missing
    }
  };

  void fetchCsrf();

  const clearFieldErrors = (): void => {
    form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => {
      el.textContent = '';
    });
    form.querySelectorAll<HTMLElement>('[aria-invalid]').forEach((el) => {
      el.removeAttribute('aria-invalid');
    });
  };

  const setFieldError = (field: string, message: string): void => {
    const input = form.querySelector<HTMLElement>(`[name="${field}"]`);
    const errEl = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
    if (input) input.setAttribute('aria-invalid', 'true');
    if (errEl) errEl.textContent = message;
  };

  const showStatus = (kind: 'success' | 'error', text: string, refId?: string): void => {
    if (!statusBox) return;
    statusBox.hidden = false;
    statusBox.className = `tcd-form-status tcd-form-status--${kind}`;
    statusBox.textContent = '';

    const p = document.createElement('p');
    p.style.margin = '0';
    p.textContent = text;
    statusBox.appendChild(p);

    if (refId) {
      const meta = document.createElement('p');
      meta.style.margin = '0.5rem 0 0';
      meta.style.fontWeight = '600';
      meta.textContent = `Reference: ${refId}`;
      statusBox.appendChild(meta);
    }
  };

  form.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();
    clearFieldErrors();
    if (statusBox) statusBox.hidden = true;

    const formData = new FormData(form);
    const payload = {
      customerName: String(formData.get('customerName') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      location: String(formData.get('location') || '').trim(),
      issue: String(formData.get('issue') || '').trim(),
      preferredContact: String(formData.get('preferredContact') || '').trim(),
      details: String(formData.get('details') || '').trim(),
      companyWebsite: String(formData.get('companyWebsite') || ''),
      csrfToken,
    };

    // Client-side pre-validation matching server rules
    let hasError = false;
    if (payload.customerName.length < 2) {
      setFieldError('customerName', 'Please enter your name.');
      hasError = true;
    }
    if (payload.phone.replace(/[^\d]/g, '').length < 9) {
      setFieldError('phone', 'Please enter a valid telephone number.');
      hasError = true;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) {
      setFieldError('email', 'Please enter a valid email address.');
      hasError = true;
    }
    if (payload.location.length < 2) {
      setFieldError('location', 'Please tell us where the property is located.');
      hasError = true;
    }
    if (!payload.issue) {
      setFieldError('issue', 'Please choose a plumbing issue.');
      hasError = true;
    }
    if (!payload.preferredContact) {
      setFieldError('preferredContact', 'Please select how you would like to be contacted.');
      hasError = true;
    }
    if (payload.details.length < 10) {
      setFieldError('details', 'Please share a brief description of the issue (at least 10 characters).');
      hasError = true;
    }

    if (hasError) {
      showStatus('error', 'Please review the highlighted fields before sending your enquiry.');
      const firstInvalid = form.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    if (!csrfToken) {
      await fetchCsrf();
      payload.csrfToken = csrfToken;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending Enquiry...';

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        referenceId?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok || !result.ok) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([key, msg]) => {
            setFieldError(key, msg);
          });
        }
        showStatus(
          'error',
          result.error || 'We could not submit your quote enquiry. Please call +44 7756 046558 directly.',
          result.referenceId
        );
        // Refresh CSRF token after error in case it expired
        if (response.status === 403) {
          void fetchCsrf();
        }
        return;
      }

      showStatus('success', result.message || 'Your quote enquiry has been received.', result.referenceId);
      form.reset();
      void fetchCsrf();
    } catch {
      showStatus(
        'error',
        'A network error interrupted your submission. Please try again or call +44 7756 046558 directly.'
      );
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Send Quote Request';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initDesktopDropdown();
  initMobileMenu();
  initHomeServicePreview();
  initAnimations();
  initContactForm();
});
