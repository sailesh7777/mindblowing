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

  // ── Contact form: HTML5 validation + mailto delivery ─────────
  //
  // Every field is `required`, so the browser blocks submission until all
  // are filled — no custom validation needed beyond the native tooltips.
  // On successful submit we build a mailto: URL addressed to
  // sailesh@mindblowing-tech.com containing the full enquiry, then hand
  // off to the visitor's default email client.
  //
  // → For a fully server-driven form (no email client required, submission
  //   tracking, spam protection), swap the mailto step for a POST to a
  //   form endpoint. Example with Formspree — register at formspree.io,
  //   create a form, then:
  //     await fetch("https://formspree.io/f/YOUR_ID", {
  //       method: "POST",
  //       headers: { "Accept": "application/json" },
  //       body: new FormData(contactForm),
  //     });
  const CONTACT_TO = "sailesh@mindblowing-tech.com";
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    // Only show :invalid styling after the user has interacted with a field,
    // so untouched fields aren't flagged red on initial load.
    contactForm.querySelectorAll(".form-field").forEach((field) => {
      field.addEventListener("blur", () => field.classList.add("touched"));
    });

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = contactForm.querySelector("[data-form-status]");
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      // Native HTML5 validation — if anything's invalid, the browser shows
      // its own tooltip pointing at the offending field.
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        // Mark every field as touched so the invalid ones stay red
        contactForm.querySelectorAll(".form-field").forEach((field) => {
          field.classList.add("touched");
        });
        return;
      }

      // Pull values from the form
      const data = new FormData(contactForm);
      const name    = String(data.get("name") || "").trim();
      const email   = String(data.get("email") || "").trim();
      const phone   = String(data.get("phone") || "").trim();
      const service = String(data.get("service") || "").trim();
      const message = String(data.get("message") || "").trim();

      // Build the email
      const subject = `New enquiry from ${name} — ${service}`;
      const bodyLines = [
        `Name:     ${name}`,
        `Email:    ${email}`,
        `Phone:    ${phone}`,
        `Service:  ${service}`,
        "",
        "Project Details",
        "---------------",
        message,
        "",
        `— Sent from mindblowing-tech.com contact form`,
      ];
      const mailto =
        "mailto:" + encodeURIComponent(CONTACT_TO) +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\r\n"));

      // Kick off the email client
      window.location.href = mailto;

      // Friendly confirmation. The user still needs to press Send in their
      // mail app, so the wording nudges toward that step.
      if (status) {
        status.textContent =
          "Your email client is opening — please click Send to complete your enquiry.";
        status.className = "text-sm text-emerald-300";
      }
      // Small delay so the user sees the confirmation before we clear the form
      if (submitBtn) submitBtn.disabled = true;
      setTimeout(() => {
        contactForm.reset();
        contactForm
          .querySelectorAll(".form-field")
          .forEach((field) => field.classList.remove("touched"));
        if (submitBtn) submitBtn.disabled = false;
      }, 2000);
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
