/* ============================================================
   Mind Blowing Technologies — shared frontend script
   Handles: mobile menu, header scroll state, IntersectionObserver
   entrance animations, and generic form UX. Vanilla JS only.
   ============================================================ */

(function () {
  "use strict";

  // ── Header: shrink on scroll ────────────────────────────────
  const header = document.querySelector("[data-header]");
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 20) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile menu toggle ──────────────────────────────────────
  const menuBtn = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  const menuIconOpen = document.querySelector("[data-menu-icon-open]");
  const menuIconClose = document.querySelector("[data-menu-icon-close]");

  if (menuBtn && menu) {
    const closeMenu = () => {
      menu.classList.add("hidden");
      menuBtn.setAttribute("aria-expanded", "false");
      if (menuIconOpen) menuIconOpen.classList.remove("hidden");
      if (menuIconClose) menuIconClose.classList.add("hidden");
    };
    const openMenu = () => {
      menu.classList.remove("hidden");
      menuBtn.setAttribute("aria-expanded", "true");
      if (menuIconOpen) menuIconOpen.classList.add("hidden");
      if (menuIconClose) menuIconClose.classList.remove("hidden");
    };
    menuBtn.addEventListener("click", () => {
      if (menu.classList.contains("hidden")) openMenu();
      else closeMenu();
    });
    // Close after any link click
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.classList.contains("hidden")) closeMenu();
    });
  }

  // ── IntersectionObserver: entrance animations ───────────────
  // Any element with .fade-up gains .in-view when it enters the viewport,
  // and CSS transitions handle the visual fade + slide.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    // Observe all fade-up elements
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    // Trigger hero entrance animations immediately on page load
    // (they should not wait for scroll — they're the first thing the user sees)
    window.addEventListener("DOMContentLoaded", () => {
      requestAnimationFrame(() => {
        document
          .querySelectorAll("[data-hero-enter], .hero-underline")
          .forEach((el) => el.classList.add("in-view"));
      });
    });
  } else {
    // Fallback for very old browsers — just reveal everything
    document.querySelectorAll(".fade-up, .hero-underline").forEach((el) => el.classList.add("in-view"));
  }

  // ── Contact form: HTML5 validation + Formspree delivery ──────
  //
  // Every field is `required`, so the browser blocks submission until all
  // are filled — the native tooltips handle "please fill this in" prompts.
  // On successful validation we POST the FormData to the Formspree endpoint
  // configured on the <form>'s `action` attribute. Formspree receives the
  // submission, applies its honeypot + spam filters, and forwards the
  // enquiry as an email to the Zoho inbox associated with the form (that's
  // sailesh@mindblowing-tech.com for this site).
  //
  // Everything runs client-side over HTTPS — no backend required, works
  // fine on a GitHub Pages static host.
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    // Only show :invalid styling after the user has interacted with a field,
    // so untouched fields aren't flagged red on initial load.
    contactForm.querySelectorAll(".form-field").forEach((field) => {
      field.addEventListener("blur", () => field.classList.add("touched"));
    });

    const setStatus = (message, tone) => {
      const status = contactForm.querySelector("[data-form-status]");
      if (!status) return;
      status.textContent = message;
      status.classList.remove("hidden");
      // Tone classes map to Tailwind semantic colours
      const toneClass = tone === "error" ? "text-red-300" : "text-emerald-300";
      status.className = `text-sm ${toneClass}`;
    };

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      // Native HTML5 validation — if anything's invalid, the browser shows
      // its own tooltip pointing at the offending field.
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        contactForm.querySelectorAll(".form-field").forEach((field) => {
          field.classList.add("touched");
        });
        return;
      }

      // Disable the button + swap label so the visitor knows we're working.
      const originalLabel = submitBtn ? submitBtn.textContent : "Send Message";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method || "POST",
          body: new FormData(contactForm),
          // Asking for JSON back tells Formspree to reply with a JSON body
          // instead of redirecting the browser — lets us keep the visitor
          // on the page and show an inline confirmation.
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          setStatus(
            "Thanks — your message is on its way. We'll reply within one business day.",
            "success"
          );
          contactForm.reset();
          contactForm
            .querySelectorAll(".form-field")
            .forEach((field) => field.classList.remove("touched"));
        } else {
          // Formspree returns a JSON payload with error details on 4xx.
          const data = await response.json().catch(() => ({}));
          const msg =
            (Array.isArray(data?.errors) &&
              data.errors.map((err) => err.message).filter(Boolean).join(", ")) ||
            "Something went wrong. Please email sailesh@mindblowing-tech.com directly.";
          setStatus(msg, "error");
        }
      } catch (err) {
        // Network failure / offline / DNS problem — fall back to a mailto
        // link in the error message so the visitor still has a route to us.
        setStatus(
          "Couldn't reach the server. Please email sailesh@mindblowing-tech.com directly.",
          "error"
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      }
    });
  }

  // ── Set active nav link based on current pathname ──────────
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = link.getAttribute("href");
    if (
      href === path ||
      (path === "" && href === "index.html") ||
      (path === "index.html" && href === "index.html")
    ) {
      link.classList.add("nav-active");
    }
  });

  // ── Copyright year auto-update ──────────────────────────────
  document.querySelectorAll("[data-current-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
