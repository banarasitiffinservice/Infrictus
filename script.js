/* =========================================================
   INFRICTUS - FINAL SCRIPT.JS
   ========================================================= */

// WhatsApp number
const WHATSAPP_NUMBER = "916388605805";

/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

navLinks?.classList.remove("open");

menuToggle?.addEventListener("click", () => {
  navLinks?.classList.toggle("open");

  const isOpen = navLinks?.classList.contains("open");

  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close menu" : "Open menu"
  );
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks?.classList.remove("open");
    menuToggle?.setAttribute("aria-label", "Open menu");
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 680) {
    navLinks?.classList.remove("open");
    menuToggle?.setAttribute("aria-label", "Open menu");
  }
});

/* =========================================================
   SCROLL REVEAL ANIMATION
   ========================================================= */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.12,
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

/* =========================================================
   CONTACT FORM - WHATSAPP
   ========================================================= */

document
  .getElementById("contact-form")
  ?.addEventListener("submit", (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const name = form.get("name") || "";
    const service = form.get("service") || "";
    const messageText = form.get("message") || "";

    const message =
      `Hello INFRICTUS,\n\n` +
      `Name: ${name}\n` +
      `Service: ${service}\n` +
      `Message: ${messageText}`;

    if (!WHATSAPP_NUMBER || WHATSAPP_NUMBER.includes("X")) {
      alert(
        "Please update the WhatsApp number in script.js before using the form."
      );
      return;
    }

    const whatsappURL =
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank", "noopener,noreferrer");
  });

/* =========================================================
   IMAGE MODAL
   ========================================================= */

const imageModal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");
const modalClose = document.getElementById("modal-close");

const closeImageModal = () => {
  imageModal?.classList.remove("open");
  imageModal?.setAttribute("aria-hidden", "true");

  if (modalImage) {
    modalImage.src = "";
  }

  document.body.style.overflow = "";

  document.querySelectorAll("[data-slider]").forEach((slider) => {
    slider.classList.remove("is-paused");
  });
};

const openImageModal = (image) => {
  if (!imageModal || !modalImage) return;

  modalImage.src = image.currentSrc || image.src;
  modalImage.alt = image.alt || "INFRICTUS preview";

  imageModal.classList.add("open");
  imageModal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
};

document.querySelectorAll(".zoomable-image").forEach((image) => {
  image.addEventListener("click", () => {
    openImageModal(image);
  });

  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openImageModal(image);
    }
  });

  image.setAttribute("tabindex", "0");
  image.setAttribute("role", "button");
});

modalClose?.addEventListener("click", closeImageModal);

imageModal?.addEventListener("click", (event) => {
  if (event.target === imageModal) {
    closeImageModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeImageModal();
  }
});

/* =========================================================
   AUTOMATIC SLIDER - PAUSE AND RESUME
   ========================================================= */

document.querySelectorAll("[data-slider]").forEach((slider) => {
  let resumeTimer;

  const pauseSlider = () => {
    slider.classList.add("is-paused");
  };

  const resumeSlider = () => {
    slider.classList.remove("is-paused");
  };

  const delayedResume = () => {
    clearTimeout(resumeTimer);

    resumeTimer = setTimeout(() => {
      resumeSlider();
    }, 900);
  };

  // Desktop hover
  slider.addEventListener("mouseenter", pauseSlider);
  slider.addEventListener("mouseleave", resumeSlider);

  // Keyboard focus
  slider.addEventListener("focusin", pauseSlider);
  slider.addEventListener("focusout", resumeSlider);

  // Mouse and touch
  slider.addEventListener("pointerdown", () => {
    clearTimeout(resumeTimer);
    pauseSlider();
  });

  slider.addEventListener("pointerup", () => {
    delayedResume();
  });

  slider.addEventListener("pointercancel", () => {
    resumeSlider();
  });

  slider.addEventListener("pointerleave", () => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      delayedResume();
    }
  });
});

/* =========================================================
   ACCESSIBILITY - MODAL FOCUS
   ========================================================= */

imageModal?.addEventListener("transitionend", () => {
  if (imageModal.classList.contains("open")) {
    modalClose?.focus();
  }
});

/* =========================================================
   PREVENT FORM RESUBMISSION ON PAGE REFRESH
   ========================================================= */

window.addEventListener("pageshow", () => {
  document.querySelectorAll("form").forEach((form) => {
    if (form.dataset.resetOnLoad === "true") {
      form.reset();
    }
  });
});
