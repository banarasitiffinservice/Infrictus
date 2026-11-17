
/* =========================================================
   INFRICTUS — PREMIUM WEBSITE JAVASCRIPT
   Compatible with your index.html and styles.css
========================================================= */

"use strict";

/* =========================================================
   1. CONFIGURATION
========================================================= */

// WhatsApp number: country code + number, digits only.
const WHATSAPP_NUMBER = "916388605805";


/* =========================================================
   2. MOBILE NAVIGATION
========================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {

    function closeMenu() {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        menuToggle.textContent = "☰";
    }

    function openMenu() {
        navLinks.classList.add("open");
        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close menu");
        menuToggle.textContent = "✕";
    }

    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.contains("open");

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu after clicking a navigation link.
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Close menu when clicking outside.
    document.addEventListener("click", event => {
        if (
            navLinks.classList.contains("open") &&
            !navLinks.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeMenu();
        }
    });

    // Close menu with Escape.
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    // Close mobile menu when moving to desktop width.
    window.addEventListener("resize", () => {
        if (window.innerWidth > 950) {
            closeMenu();
        }
    });
}


/* =========================================================
   3. SCROLL REVEAL ANIMATION
========================================================= */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        }
    );

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

} else {

    // Fallback for older browsers.
    revealElements.forEach(element => {
        element.classList.add("visible");
    });

}


/* =========================================================
   4. CONTACT FORM — WHATSAPP
========================================================= */

const contactForm = document.querySelector("#contact-form");

if (contactForm) {

    contactForm.addEventListener("submit", event => {

        event.preventDefault();

        const name = contactForm.querySelector(
            '[name="name"]'
        )?.value.trim();

        const service = contactForm.querySelector(
            '[name="service"]'
        )?.value.trim();

        const message = contactForm.querySelector(
            '[name="message"]'
        )?.value.trim();

        if (!name || !message) {
            alert("Please enter your name and project message.");
            return;
        }

        if (
            !WHATSAPP_NUMBER ||
            !/^\d{10,15}$/.test(WHATSAPP_NUMBER)
        ) {
            alert("WhatsApp number is not configured correctly.");
            return;
        }

        const whatsappMessage = `
Hello INFRICTUS!

Name: ${name}

Service Required: ${service || "Not specified"}

Project Details:
${message}

I would like to discuss my project.
        `.trim();

        const whatsappURL =
            `https://wa.me/${WHATSAPP_NUMBER}?text=` +
            encodeURIComponent(whatsappMessage);

        window.open(
            whatsappURL,
            "_blank",
            "noopener,noreferrer"
        );

    });

}


/* =========================================================
   5. IMAGE ZOOM MODAL
========================================================= */

const imageModal = document.querySelector("#image-modal");
const modalImage = document.querySelector("#modal-image");
const modalClose = document.querySelector("#modal-close");

let previouslyFocusedElement = null;

if (imageModal && modalImage && modalClose) {

    function openImageModal(image) {

        previouslyFocusedElement = document.activeElement;

        modalImage.src = image.currentSrc || image.src;
        modalImage.alt = image.alt || "Expanded preview";

        imageModal.classList.add("open");
        imageModal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        modalClose.focus();
    }

    function closeImageModal() {

        if (!imageModal.classList.contains("open")) {
            return;
        }

        imageModal.classList.remove("open");
        imageModal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

        modalImage.removeAttribute("src");

        if (
            previouslyFocusedElement &&
            typeof previouslyFocusedElement.focus === "function"
        ) {
            previouslyFocusedElement.focus();
        }

    }

    // Open image using event delegation.
    document.addEventListener("click", event => {

        const image = event.target.closest(".zoomable-image");

        if (image) {
            openImageModal(image);
        }

    });

    modalClose.addEventListener("click", closeImageModal);

    // Close by clicking the dark backdrop.
    imageModal.addEventListener("click", event => {

        if (event.target === imageModal) {
            closeImageModal();
        }

    });

    // Close with Escape.
    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            imageModal.classList.contains("open")
        ) {
            closeImageModal();
        }

    });

}


/* =========================================================
   6. PREMIUM INFINITE SLIDER
========================================================= */

class InfrictusSlider {

    constructor(root) {

        this.root = root;

        this.viewport = root.querySelector(".slider-viewport");
        this.track = root.querySelector(".slider-track");
        this.dotsContainer = root.querySelector(".slider-dots");

        if (!this.viewport || !this.track) {
            return;
        }

        this.originalSlides = Array.from(
            this.track.querySelectorAll(".slide")
        );

        if (this.originalSlides.length < 2) {
            return;
        }

        this.speed = Math.max(
            1500,
            Number(root.dataset.speed) || 4000
        );

        this.index = 0;
        this.visibleCount = 1;
        this.cloneCount = 0;

        this.step = 0;
        this.timer = null;

        this.isPaused = false;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.dragDistance = 0;

        this.pointerId = null;

        this.originalSlides.forEach(slide => {
            slide.setAttribute("draggable", "false");
        });

        this.build();
        this.bindEvents();

        this.startAutoPlay();

        // Expose instance for debugging if needed.
        root._slider = this;
    }


    /* -----------------------------------------------------
       RESPONSIVE VISIBLE SLIDES
    ----------------------------------------------------- */

    getVisibleCount() {

        if (window.innerWidth <= 620) {
            return 1;
        }

        if (window.innerWidth <= 950) {
            return 2;
        }

        return 3;
    }


    /* -----------------------------------------------------
       BUILD SLIDER
    ----------------------------------------------------- */

    build() {

        this.stopAutoPlay();

        this.visibleCount = Math.min(
            this.getVisibleCount(),
            this.originalSlides.length
        );

        this.cloneCount = this.visibleCount;

        this.track.style.transition = "none";

        this.track.innerHTML = "";

        // Clones before the original slides.
        const beforeClones = this.originalSlides
            .slice(-this.cloneCount)
            .map(slide => this.createClone(slide));

        // Original slides.
        const originals = this.originalSlides;

        // Clones after original slides.
        const afterClones = this.originalSlides
            .slice(0, this.cloneCount)
            .map(slide => this.createClone(slide));

        [
            ...beforeClones,
            ...originals,
            ...afterClones
        ].forEach(slide => {
            this.track.appendChild(slide);
        });

        this.index = this.cloneCount;

        this.createDots();

        this.calculateStep();

        this.updatePosition(false);

        this.updateDots();

        requestAnimationFrame(() => {
            this.track.style.transition =
                "transform .55s cubic-bezier(.22,.75,.25,1)";
        });

        if (!this.isPaused) {
            this.startAutoPlay();
        }

    }


    /* -----------------------------------------------------
       CLONE SLIDE
    ----------------------------------------------------- */

    createClone(slide) {

        const clone = slide.cloneNode(true);

        clone.setAttribute("aria-hidden", "true");

        // Prevent cloned links and controls from receiving focus.
        clone.querySelectorAll("a, button, input, select, textarea")
            .forEach(element => {
                element.setAttribute("tabindex", "-1");
            });

        return clone;
    }


    /* -----------------------------------------------------
       CALCULATE SLIDE WIDTH + GAP
    ----------------------------------------------------- */

    calculateStep() {

        const firstSlide = this.track.children[0];

        if (!firstSlide) {
            return;
        }

        const slideWidth =
            firstSlide.getBoundingClientRect().width;

        const styles = window.getComputedStyle(this.track);

        const gap = parseFloat(styles.columnGap) ||
                    parseFloat(styles.gap) ||
                    0;

        this.step = slideWidth + gap;

    }


    /* -----------------------------------------------------
       UPDATE SLIDER POSITION
    ----------------------------------------------------- */

    updatePosition(animate = true) {

        if (!this.step) {
            this.calculateStep();
        }

        this.track.style.transition = animate
            ? "transform .55s cubic-bezier(.22,.75,.25,1)"
            : "none";

        const distance = this.index * this.step;

        this.track.style.transform =
            `translate3d(${-distance}px,0,0)`;

    }


    /* -----------------------------------------------------
       CREATE NAVIGATION DOTS
    ----------------------------------------------------- */

    createDots() {

        if (!this.dotsContainer) {
            return;
        }

        this.dotsContainer.innerHTML = "";

        this.originalSlides.forEach((slide, index) => {

            const dot = document.createElement("button");

            dot.type = "button";

            dot.setAttribute(
                "aria-label",
                `Go to slide ${index + 1}`
            );

            dot.addEventListener("click", () => {

                this.goTo(index);

                this.restartAutoPlay();

            });

            this.dotsContainer.appendChild(dot);

        });

    }


    /* -----------------------------------------------------
       ACTIVE DOT
    ----------------------------------------------------- */

    updateDots() {

        if (!this.dotsContainer) {
            return;
        }

        const dots = this.dotsContainer.querySelectorAll("button");

        const activeIndex =
            (
                this.index - this.cloneCount +
                this.originalSlides.length
            ) % this.originalSlides.length;

        dots.forEach((dot, index) => {

            const active = index === activeIndex;

            dot.classList.toggle("active", active);

            dot.setAttribute(
                "aria-current",
                active ? "true" : "false"
            );

        });

    }


    /* -----------------------------------------------------
       GO TO SLIDE
    ----------------------------------------------------- */

    goTo(index) {

        this.index = this.cloneCount + index;

        this.updatePosition(true);
        this.updateDots();

    }


    /* -----------------------------------------------------
       NEXT SLIDE
    ----------------------------------------------------- */

    next() {

        if (this.isDragging) {
            return;
        }

        this.index++;

        this.updatePosition(true);
        this.updateDots();

    }


    /* -----------------------------------------------------
       PREVIOUS SLIDE
    ----------------------------------------------------- */

    previous() {

        if (this.isDragging) {
            return;
        }

        this.index--;

        this.updatePosition(true);
        this.updateDots();

    }


    /* -----------------------------------------------------
       INFINITE LOOP RESET
    ----------------------------------------------------- */

    handleTransitionEnd() {

        const total = this.originalSlides.length;

        if (this.index >= total + this.cloneCount) {

            this.index = this.cloneCount;

            this.updatePosition(false);

        }

        if (this.index < this.cloneCount) {

            this.index = total + this.cloneCount - 1;

            this.updatePosition(false);

        }

        this.updateDots();

    }


    /* -----------------------------------------------------
       AUTOPLAY
    ----------------------------------------------------- */

    startAutoPlay() {

        this.stopAutoPlay();

        if (
            this.isPaused ||
            document.hidden ||
            this.originalSlides.length < 2
        ) {
            return;
        }

        this.timer = window.setInterval(() => {
            this.next();
        }, this.speed);

    }


    stopAutoPlay() {

        if (this.timer !== null) {

            clearInterval(this.timer);

            this.timer = null;

        }

    }


    restartAutoPlay() {

        this.stopAutoPlay();

        if (!this.isPaused && !document.hidden) {
            this.startAutoPlay();
        }

    }


    /* -----------------------------------------------------
       PAUSE / RESUME
    ----------------------------------------------------- */

    pause() {

        this.isPaused = true;

        this.stopAutoPlay();

    }


    resume() {

        this.isPaused = false;

        this.startAutoPlay();

    }


    /* -----------------------------------------------------
       POINTER / TOUCH DRAG
    ----------------------------------------------------- */

    pointerDown(event) {

        // Only respond to the primary pointer.
        if (
            event.button !== undefined &&
            event.button !== 0
        ) {
            return;
        }

        this.isDragging = true;
        this.pointerId = event.pointerId;

        this.startX = event.clientX;
        this.currentX = event.clientX;
        this.dragDistance = 0;

        this.stopAutoPlay();

        this.track.style.transition = "none";

        try {
            this.viewport.setPointerCapture(event.pointerId);
        } catch (error) {
            // Pointer capture may not be available.
        }

    }


    pointerMove(event) {

        if (!this.isDragging) {
            return;
        }

        this.currentX = event.clientX;

        this.dragDistance = this.currentX - this.startX;

        const baseDistance = this.index * this.step;

        this.track.style.transform =
            `translate3d(${
                -baseDistance + this.dragDistance
            }px,0,0)`;

    }


    pointerUp(event, cancelled = false) {

        if (!this.isDragging) {
            return;
        }

        this.isDragging = false;

        if (cancelled) {
            this.dragDistance = 0;
        }

        const threshold = Math.max(
            35,
            this.step * 0.15
        );

        if (this.dragDistance < -threshold) {

            this.index++;

        } else if (this.dragDistance > threshold) {

            this.index--;

        }

        this.updatePosition(true);
        this.updateDots();

        this.pointerId = null;

        if (!this.isPaused) {
            this.startAutoPlay();
        }

    }


    /* -----------------------------------------------------
       EVENT LISTENERS
    ----------------------------------------------------- */

    bindEvents() {

        this.track.addEventListener(
            "transitionend",
            event => {

                if (event.target === this.track) {
                    this.handleTransitionEnd();
                }

            }
        );

        // Pause on mouse hover.
        this.root.addEventListener("mouseenter", () => {
            this.pause();
        });

        this.root.addEventListener("mouseleave", () => {
            this.resume();
        });

        // Pause when keyboard users focus slider controls.
        this.root.addEventListener("focusin", () => {
            this.pause();
        });

        this.root.addEventListener("focusout", event => {

            if (!this.root.contains(event.relatedTarget)) {
                this.resume();
            }

        });

        // Drag support.
        this.viewport.addEventListener(
            "pointerdown",
            event => this.pointerDown(event)
        );

        this.viewport.addEventListener(
            "pointermove",
            event => this.pointerMove(event)
        );

        this.viewport.addEventListener(
            "pointerup",
            event => this.pointerUp(event)
        );

        this.viewport.addEventListener(
            "pointercancel",
            event => this.pointerUp(event, true)
        );

        this.viewport.addEventListener(
            "lostpointercapture",
            () => {

                if (this.isDragging) {
                    this.pointerUp(null, true);
                }

            }
        );

        // Prevent images from being dragged separately.
        this.viewport.addEventListener("dragstart", event => {
            event.preventDefault();
        });

    }


    /* -----------------------------------------------------
       DESTROY
    ----------------------------------------------------- */

    destroy() {

        this.stopAutoPlay();

        this.root._slider = null;

    }

}


/* =========================================================
   7. INITIALIZE ALL SLIDERS
========================================================= */

const sliderInstances = [];

document.querySelectorAll("[data-slider]").forEach(root => {

    const slider = new InfrictusSlider(root);

    if (slider.track) {
        sliderInstances.push(slider);
    }

});


/* =========================================================
   8. RESIZE HANDLING
========================================================= */

let resizeTimer = null;

window.addEventListener("resize", () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {

        sliderInstances.forEach(slider => {

            const newVisibleCount = slider.getVisibleCount();

            if (newVisibleCount !== slider.visibleCount) {

                slider.build();

            } else {

                slider.calculateStep();
                slider.updatePosition(false);

            }

        });

    }, 180);

});


/* =========================================================
   9. PAUSE SLIDERS WHEN TAB IS HIDDEN
========================================================= */

document.addEventListener("visibilitychange", () => {

    sliderInstances.forEach(slider => {

        if (document.hidden) {

            slider.stopAutoPlay();

        } else if (!slider.isPaused) {

            slider.startAutoPlay();

        }

    });

});


/* =========================================================
   10. PAGE LOAD
========================================================= */

window.addEventListener("load", () => {

    sliderInstances.forEach(slider => {

        slider.calculateStep();
        slider.updatePosition(false);

    });

});

