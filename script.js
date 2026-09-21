/* =========================================================
   INFRICTUS — FINAL SCRIPT
   Official interaction layer: navigation, WhatsApp, modal,
   independent responsive sliders, swipe and pause/resume.
   ========================================================= */

const WHATSAPP_NUMBER = "916388605805";

/* MOBILE NAVIGATION */
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
navLinks?.classList.remove("open");

menuToggle?.addEventListener("click", () => {
  navLinks?.classList.toggle("open");
  const isOpen = navLinks?.classList.contains("open");
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

document.querySelectorAll(".nav-links a").forEach(link => {
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

/* SCROLL REVEAL */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* WHATSAPP CONTACT FORM */
document.getElementById("contact-form")?.addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = form.get("name") || "";
  const service = form.get("service") || "";
  const messageText = form.get("message") || "";

  if (!WHATSAPP_NUMBER || WHATSAPP_NUMBER.includes("X")) {
    alert("Please update the WhatsApp number in script.js before using the form.");
    return;
  }

  const message =
    `Hello INFRICTUS,\n\nName: ${name}\nService: ${service}\nMessage: ${messageText}`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
});

/* IMAGE MODAL */
const imageModal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");
const modalClose = document.getElementById("modal-close");

function closeImageModal() {
  imageModal?.classList.remove("open");
  imageModal?.setAttribute("aria-hidden", "true");
  if (modalImage) modalImage.src = "";
  document.body.style.overflow = "";
  document.querySelectorAll("[data-slider]").forEach(slider => {
    slider.classList.remove("is-paused");
    const state = slider.__infrictusSlider;
    if (state) state.resumeAfterInteraction();
  });
}

function openImageModal(image) {
  if (!imageModal || !modalImage) return;
  modalImage.src = image.currentSrc || image.src;
  modalImage.alt = image.alt || "INFRICTUS preview";
  imageModal.classList.add("open");
  imageModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

document.addEventListener("click", event => {
  const image = event.target.closest(".zoomable-image");
  if (image) openImageModal(image);
});

document.addEventListener("keydown", event => {
  const image = event.target.closest?.(".zoomable-image");
  if (image && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openImageModal(image);
  }
  if (event.key === "Escape") closeImageModal();
});

document.querySelectorAll(".zoomable-image").forEach(image => {
  image.tabIndex = 0;
  image.setAttribute("role", "button");
});
modalClose?.addEventListener("click", closeImageModal);
imageModal?.addEventListener("click", event => {
  if (event.target === imageModal) closeImageModal();
});

/* =========================================================
   INDEPENDENT RESPONSIVE SLIDERS
   ========================================================= */
class InfrictusSlider {
  constructor(root) {
    this.root = root;
    this.viewport = root.querySelector(".slider-viewport");
    this.track = root.querySelector(".slider-track");
    this.slides = [...root.querySelectorAll(".slider-slide")];
    this.prev = root.querySelector(".slider-arrow.prev");
    this.next = root.querySelector(".slider-arrow.next");
    this.dots = root.querySelector(".slider-dots");
    this.index = 0;
    this.timer = null;
    this.resumeTimer = null;
    this.pointerStart = null;
    this.pointerDelta = 0;
    this.isInteracting = false;
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!this.viewport || !this.track || this.slides.length < 1) return;
    this.setup();
  }

  visibleCount() {
    if (window.innerWidth <= 680) return 1;
    if (window.innerWidth <= 1000) return 2;
    return 3;
  }

  maxIndex() {
    return Math.max(0, this.slides.length - this.visibleCount());
  }

  setup() {
    this.renderDots();
    this.prev?.addEventListener("click", () => this.go(this.index - 1, true));
    this.next?.addEventListener("click", () => this.go(this.index + 1, true));

    this.root.addEventListener("mouseenter", () => this.pause());
    this.root.addEventListener("mouseleave", () => this.resumeAfterInteraction());
    this.root.addEventListener("focusin", () => this.pause());
    this.root.addEventListener("focusout", () => this.resumeAfterInteraction());

    this.viewport.addEventListener("pointerdown", e => {
      this.isInteracting = true;
      this.pointerStart = e.clientX;
      this.pointerDelta = 0;
      this.pause();
      this.viewport.setPointerCapture?.(e.pointerId);
    });

    this.viewport.addEventListener("pointermove", e => {
      if (!this.isInteracting || this.pointerStart === null) return;
      this.pointerDelta = e.clientX - this.pointerStart;
    });

    const finishPointer = () => {
      if (!this.isInteracting) return;
      const delta = this.pointerDelta;
      this.isInteracting = false;
      this.pointerStart = null;

      if (Math.abs(delta) > 45) {
        this.go(delta < 0 ? this.index + 1 : this.index - 1, false);
      }
      this.resumeAfterInteraction();
    };

    this.viewport.addEventListener("pointerup", finishPointer);
    this.viewport.addEventListener("pointercancel", finishPointer);

    window.addEventListener("resize", () => {
      this.index = Math.min(this.index, this.maxIndex());
      this.update(false);
      this.renderDots();
    });

    this.update(false);
    this.start();
    this.root.__infrictusSlider = this;
  }

  renderDots() {
    if (!this.dots) return;
    this.dots.innerHTML = "";
    const count = this.maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot" + (i === this.index ? " active" : "");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => this.go(i, true));
      this.dots.appendChild(dot);
    }
  }

  update(animate = true) {
    const first = this.slides[0];
    if (!first) return;
    const gap = parseFloat(getComputedStyle(this.track).gap) || 0;
    const distance = first.getBoundingClientRect().width + gap;
    this.track.style.transition = animate ? "" : "none";
    this.track.style.transform = `translate3d(${-this.index * distance}px,0,0)`;
    if (!animate) {
      requestAnimationFrame(() => { this.track.style.transition = ""; });
    }
    this.dots?.querySelectorAll(".slider-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === this.index);
    });
  }

  go(target, userInitiated = false) {
    const max = this.maxIndex();
    if (max === 0) return;
    if (target > max) target = 0;
    if (target < 0) target = max;
    this.index = target;
    this.update(true);
    if (userInitiated) this.pauseAndResume();
  }

  pause() {
    clearInterval(this.timer);
    clearTimeout(this.resumeTimer);
    this.timer = null;
    this.root.classList.add("is-paused");
  }

  pauseAndResume() {
    this.pause();
    this.resumeTimer = setTimeout(() => this.start(), 1100);
  }

  resumeAfterInteraction() {
    clearTimeout(this.resumeTimer);
    this.resumeTimer = setTimeout(() => this.start(), 900);
  }

  start() {
    clearInterval(this.timer);
    this.root.classList.remove("is-paused");
    if (this.reduceMotion.matches || this.maxIndex() === 0) return;

    this.timer = setInterval(() => {
      if (!this.root.matches(":hover") && !this.isInteracting) {
        this.go(this.index + 1, false);
      }
    }, 4200);
  }
}

document.querySelectorAll("[data-slider]").forEach(root => {
  new InfrictusSlider(root);
});

/* Reset selected forms on a fresh page load when requested. */
window.addEventListener("pageshow", () => {
  document.querySelectorAll("form").forEach(form => {
    if (form.dataset.resetOnLoad === "true") form.reset();
  });
});
