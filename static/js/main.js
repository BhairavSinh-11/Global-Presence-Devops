document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
       NAVBAR SCROLL EFFECT
       ========================================================================== */
  const navbar = document.getElementById("navbar");

  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Run once on load

  /* ==========================================================================
       MOBILE MENU TOGGLE
       ========================================================================== */
  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileToggle.classList.toggle("open");
      navMenu.classList.toggle("open");
    });

    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileToggle.classList.remove("open");
        navMenu.classList.remove("open");
      });
    });
  }

  /* ==========================================================================
       NAVBAR QUICK ASSESSMENT DROPDOWN CARD
       ========================================================================== */
  const dropdownBtn = document.getElementById("inquiry-dropdown-btn");
  const dropdownCard = document.getElementById("inquiry-dropdown-card");
  const dropdownContainer = document.querySelector(".dropdown-container");

  if (dropdownBtn && dropdownCard) {
    dropdownBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isShown = dropdownCard.classList.contains("show");

      // Close other mobile overlays if any
      // Toggle dropdown
      if (isShown) {
        dropdownCard.classList.remove("show");
        dropdownContainer.classList.remove("active");
      } else {
        dropdownCard.classList.add("show");
        dropdownContainer.classList.add("active");
        // Focus first input
        const firstInput = dropdownCard.querySelector("input");
        if (firstInput) setTimeout(() => firstInput.focus(), 200);
      }
    });

    // Prevent closing when clicking inside the dropdown card
    dropdownCard.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Close dropdown when clicking anywhere else on page
    document.addEventListener("click", () => {
      dropdownCard.classList.remove("show");
      dropdownContainer.classList.remove("active");
    });
  }

  /* ==========================================================================
       MODALS SYSTEM (Services Details)
       ========================================================================== */
  const modalOverlay = document.getElementById("service-modal-overlay");
  const modalCloseButtons = document.querySelectorAll(".modal-close-btn");
  const openModalBtns = document.querySelectorAll(".open-service-btn");
  const allModals = document.querySelectorAll(".modal-content-card");

  function openModal(modalId) {
    if (!modalOverlay) return;

    // Deactivate all modal panels
    allModals.forEach((m) => m.classList.remove("active"));

    const targetModal = document.getElementById(modalId);
    if (targetModal) {
      modalOverlay.classList.add("show");
      targetModal.classList.add("active");
      document.body.style.overflow = "hidden"; // Lock body scroll
    }
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("show");
    allModals.forEach((m) => m.classList.remove("active"));
    document.body.style.overflow = ""; // Unlock body scroll
  }

  if (openModalBtns && modalOverlay) {
    openModalBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute("data-target");
        openModal(targetId);
      });
    });

    modalCloseButtons.forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    // Modal Inner CTA ("Get Free Assessment" button inside modal redirects to inquiry form)
    const modalCtas = document.querySelectorAll(".modal-cta-trigger");
    modalCtas.forEach((cta) => {
      cta.addEventListener("click", () => {
        closeModal();
        // If on desktop, open the navbar dropdown. If on mobile, scroll to CTA section.
        if (window.innerWidth > 900) {
          if (dropdownCard && dropdownContainer) {
            dropdownCard.classList.add("show");
            dropdownContainer.classList.add("active");
            const firstInput = dropdownCard.querySelector("input");
            if (firstInput) setTimeout(() => firstInput.focus(), 200);
          }
        } else {
          const ctaSection = document.getElementById("contact");
          if (ctaSection) {
            ctaSection.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });
  }

  // Hero CTA button triggers quick assessment
  const heroCtaBtn = document.getElementById("hero-cta-btn");
  if (heroCtaBtn) {
    heroCtaBtn.addEventListener("click", () => {
      if (window.innerWidth > 900) {
        if (dropdownCard && dropdownContainer) {
          dropdownCard.classList.add("show");
          dropdownContainer.classList.add("active");
          const firstInput = dropdownCard.querySelector("input");
          if (firstInput) setTimeout(() => firstInput.focus(), 200);
        }
      } else {
        const ctaSection = document.getElementById("contact");
        if (ctaSection) {
          ctaSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  }

  /* ==========================================================================
   AJAX FORM SUBMISSIONS
   ========================================================================== */

  const forms = document.querySelectorAll(".contact-inquiry-form");

  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const statusMsg = form.querySelector(".form-status-msg");
      const originalBtnHtml = submitBtn.innerHTML;

      // Loading state
      submitBtn.disabled = true;

      submitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

      // Hide previous message
      if (statusMsg) {
        statusMsg.className = "form-status-msg";

        statusMsg.textContent = "";

        statusMsg.style.display = "none";
      }

      // Collect form data
      const formData = new FormData(form);

      const data = {};

      formData.forEach((value, key) => {
        data[key] = value;
      });

      try {
        const response = await fetch("/submit-inquiry", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(data),
        });

        const result = await response.json();

        // SUCCESS
        if (response.ok && result.success) {
          if (statusMsg) {
            statusMsg.textContent =
              "Thank you! We got your details. We will contact you soon.";

            statusMsg.className = "form-status-msg success";

            /* IMPORTANT:
                       Remove inline display:none */
            statusMsg.style.display = "block";
          }

          // Clear form
          form.reset();

          // Navbar form closes after 5 seconds
          if (form.closest("#inquiry-dropdown-card")) {
            setTimeout(() => {
              if (dropdownCard) {
                dropdownCard.classList.remove("show");
              }

              if (dropdownContainer) {
                dropdownContainer.classList.remove("active");
              }
            }, 5000);
          }
        } else {
          // BACKEND / VALIDATION ERROR
          if (statusMsg) {
            statusMsg.textContent =
              result.message || "Submission failed. Please check your details.";

            statusMsg.className = "form-status-msg error";

            statusMsg.style.display = "block";
          }
        }
      } catch (err) {
        console.error("Submission error:", err);

        if (statusMsg) {
          statusMsg.textContent =
            "Server connection failed. Please try again later.";

          statusMsg.className = "form-status-msg error";

          statusMsg.style.display = "block";
        }
      } finally {
        submitBtn.disabled = false;

        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  });

  /* ==========================================================================
       STATISTICS NUMBER COUNT-UP ANIMATION
       ========================================================================== */
  const statsSection = document.querySelector(".stats-section");
  const statNumbers = document.querySelectorAll(".stat-number");
  let animated = false;

  function animateCounters() {
    statNumbers.forEach((num) => {
      const target = parseInt(num.getAttribute("data-target"), 10);
      let count = 0;
      const duration = 2000; // 2 seconds
      const increment = Math.ceil(target / (duration / 30)); // 30ms intervals

      const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
          num.textContent = target;
          clearInterval(timer);
        } else {
          num.textContent = count;
        }
      }, 30);
    });
  }

  if (statsSection && statNumbers.length > 0) {
    // Set up Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            animated = true;
            animateCounters();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(statsSection);
  }
});
