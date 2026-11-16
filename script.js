/* =====================================================
   INFRICTUS FINAL SLIDER ENGINE
   ===================================================== */

const WHATSAPP_NUMBER = "916388605805";


/* =====================================================
   MOBILE NAV
   ===================================================== */

const menuToggle =
document.querySelector(".menu-toggle");

const navLinks =
document.querySelector(".nav-links");


menuToggle?.addEventListener("click", () => {

  const open =
  navLinks.classList.toggle("open");

  menuToggle.setAttribute(
    "aria-expanded",
    open ? "true" : "false"
  );

  menuToggle.setAttribute(
    "aria-label",
    open ? "Close menu" : "Open menu"
  );

});


document.querySelectorAll(".nav-links a")
.forEach(link => {

  link.addEventListener("click", () => {

    navLinks.classList.remove("open");

    menuToggle?.setAttribute(
      "aria-expanded",
      "false"
    );

  });

});


/* =====================================================
   SCROLL REVEAL
   ===================================================== */

const revealObserver =
new IntersectionObserver(
(entries) => {

  entries.forEach(entry => {

    if(entry.isIntersecting){

      entry.target.classList.add("visible");

    }

  });

},
{
  threshold:.12
});


document
.querySelectorAll(".reveal")
.forEach(el =>
revealObserver.observe(el)
);


/* =====================================================
   WHATSAPP CONTACT
   ===================================================== */

document
.getElementById("contact-form")
?.addEventListener("submit", event => {

  event.preventDefault();

  const form =
  new FormData(event.currentTarget);

  const name =
  form.get("name") || "";

  const service =
  form.get("service") || "";

  const message =
  form.get("message") || "";


  const text =
`Hello INFRICTUS,

Name: ${name}
Service: ${service}

Message:
${message}`;


  const url =
  `https://wa.me/${WHATSAPP_NUMBER}` +
  `?text=${encodeURIComponent(text)}`;


  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

});


/* =====================================================
   IMAGE MODAL
   ===================================================== */

const imageModal =
document.getElementById("image-modal");

const modalImage =
document.getElementById("modal-image");

const modalClose =
document.getElementById("modal-close");


function openImage(image){

  if(!imageModal || !modalImage)
  return;

  modalImage.src =
  image.currentSrc || image.src;

  modalImage.alt =
  image.alt || "INFRICTUS preview";

  imageModal.classList.add("open");

  imageModal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
  "hidden";

}


function closeImage(){

  imageModal?.classList.remove("open");

  imageModal?.setAttribute(
    "aria-hidden",
    "true"
  );

  if(modalImage)
  modalImage.src = "";

  document.body.style.overflow =
  "";

}


/* =========================================
   IMAGE CLICK HANDLER
   Works with slider cloned images
========================================= */

document.addEventListener("click", event => {

  const image = event.target.closest(".zoomable-image");

  if(!image) return;

  event.preventDefault();
  event.stopPropagation();

  openImage(image);

});

modalClose?.addEventListener(
"click",
closeImage
);


imageModal?.addEventListener(
"click",
event => {

  if(event.target === imageModal)
  closeImage();

});


document.addEventListener(
"keydown",
event => {

  if(event.key === "Escape")
  closeImage();

});


/* =====================================================
   UNIVERSAL TOUCH SLIDER
   ===================================================== */

class InfrictusSlider{

  constructor(root){

    this.root = root;

    this.viewport =
    root.querySelector(
      ".slider-viewport"
    );

    this.track =
    root.querySelector(
      ".slider-track"
    );

    this.dots =
    root.querySelector(
      ".slider-dots"
    );

    if(
      !this.viewport ||
      !this.track
    ){

      return;

    }


    this.originalSlides =
    Array.from(
      this.track.children
    );


    this.total =
    this.originalSlides.length;


    this.index = 0;

    this.timer = null;

    this.resumeTimer = null;

    this.dragging = false;

    this.startX = 0;

    this.currentX = 0;

    this.speed =
    Number(
      root.dataset.speed || 4000
    );


    this.init();

  }


  /* -----------------------------------------------
     NUMBER OF VISIBLE SLIDES
  ------------------------------------------------ */

  getVisible(){

    if(window.innerWidth <= 620)
    return 1;

    if(window.innerWidth <= 950)
    return 2;

    return 3;

  }


  /* -----------------------------------------------
     BUILD SLIDER
  ------------------------------------------------ */

  build(){

    this.stop();

    this.visible =
    Math.min(
      this.getVisible(),
      this.total
    );


    this.track.innerHTML = "";


    /*
      Clone last slides before original slides
      and first slides after original slides.
      This creates the seamless loop.
    */


    const before =
    this.originalSlides
    .slice(-this.visible)
    .map(slide =>
      slide.cloneNode(true)
    );


    const original =
    this.originalSlides
    .map(slide =>
      slide.cloneNode(true)
    );


    const after =
    this.originalSlides
    .slice(0,this.visible)
    .map(slide =>
      slide.cloneNode(true)
    );


    [
      ...before,
      ...original,
      ...after
    ]
    .forEach(slide => {

      slide.classList.add("slide");

      this.track.appendChild(slide);

    });


    this.index =
    this.visible;


    this.createDots();


    this.move(false);


    this.start();

  }


  /* -----------------------------------------------
     CARD WIDTH
  ------------------------------------------------ */

  getStep(){

    const first =
    this.track.children[0];

    if(!first)
    return this.viewport.clientWidth;


    const style =
    window.getComputedStyle(
      this.track
    );


    const gap =
    parseFloat(style.gap) || 0;


    return (
      first.getBoundingClientRect()
      .width + gap
    );

  }


  /* -----------------------------------------------
     MOVE
  ------------------------------------------------ */

  move(animated = true){

    const step =
    this.getStep();


    this.track.style.transition =
    animated
    ? "transform .58s cubic-bezier(.22,.7,.2,1)"
    : "none";


    this.track.style.transform =
    `translate3d(${-this.index * step}px,0,0)`;


    this.updateDots();

  }


  /* -----------------------------------------------
     NEXT
  ------------------------------------------------ */

  next(){

    if(
      this.total <= this.visible
    )
    return;


    this.index++;

    this.move(true);

  }


  /* -----------------------------------------------
     PREVIOUS VIA SWIPE
  ------------------------------------------------ */

  previous(){

    if(
      this.total <= this.visible
    )
    return;


    this.index--;

    this.move(true);

  }


  /* -----------------------------------------------
     SEAMLESS LOOP RESET
  ------------------------------------------------ */

  normalize(){

    const firstReal =
    this.visible;

    const lastReal =
    this.visible +
    this.total - 1;


    if(
      this.index >
      lastReal
    ){

      this.index =
      firstReal;

      this.move(false);

    }


    if(
      this.index <
      firstReal
    ){

      this.index =
      lastReal;

      this.move(false);

    }


    this.updateDots();

  }


  /* -----------------------------------------------
     DOTS
  ------------------------------------------------ */

  createDots(){

    if(!this.dots)
    return;


    this.dots.innerHTML = "";


    for(
      let i = 0;
      i < this.total;
      i++
    ){

      const button =
      document.createElement(
        "button"
      );


      button.type =
      "button";


      button.setAttribute(
        "aria-label",
        `Go to slide ${i + 1}`
      );


      button.addEventListener(
        "click",
        () => {

          this.pause();

          this.index =
          this.visible + i;

          this.move(true);

          this.resumeSoon();

        }
      );


      this.dots.appendChild(
        button
      );

    }

  }


  /* -----------------------------------------------
     ACTIVE DOT
  ------------------------------------------------ */

  updateDots(){

    if(!this.dots)
    return;


    let realIndex =
    this.index - this.visible;


    realIndex =
    (
      realIndex %
      this.total +
      this.total
    ) %
    this.total;


    Array
    .from(this.dots.children)
    .forEach(
      (dot,index) => {

        dot.classList.toggle(
          "active",
          index === realIndex
        );

      }
    );

  }


  /* -----------------------------------------------
     AUTO PLAY
  ------------------------------------------------ */

  start(){

    this.stop();


    if(
      this.total <= this.visible
    )
    return;


    this.timer =
    setInterval(
      () => this.next(),
      this.speed
    );

  }


  stop(){

    clearInterval(
      this.timer
    );

    this.timer = null;

  }


  /* -----------------------------------------------
     PAUSE
  ------------------------------------------------ */

  pause(){

    this.stop();

    clearTimeout(
      this.resumeTimer
    );

  }


  /* -----------------------------------------------
     RESUME
  ------------------------------------------------ */

  resumeSoon(){

    clearTimeout(
      this.resumeTimer
    );


    this.resumeTimer =
    setTimeout(
      () => this.start(),
      900
    );

  }


  /* -----------------------------------------------
     TOUCH / DRAG
  ------------------------------------------------ */

  pointerDown(event){

    this.pause();

    this.dragging = true;

    this.startX =
    event.clientX;

    this.currentX =
    event.clientX;


    this.track.style.transition =
    "none";


    this.root.classList.add(
      "dragging"
    );


    try{

      this.viewport.setPointerCapture(
        event.pointerId
      );

    }catch(error){}

  }


  pointerMove(event){

    if(!this.dragging)
    return;


    this.currentX =
    event.clientX;


    const distance =
    this.currentX -
    this.startX;


    const step =
    this.getStep();


    const position =
    this.index * step -
    distance;


    this.track.style.transform =
    `translate3d(${-position}px,0,0)`;

  }


  pointerUp(event){

    if(!this.dragging)
    return;


    this.dragging = false;

    this.root.classList.remove(
      "dragging"
    );


    const distance =
    this.currentX -
    this.startX;


    const threshold =
    Math.max(
      40,
      this.viewport.clientWidth * .10
    );


    if(
      Math.abs(distance) >
      threshold
    ){

      if(distance < 0){

        this.next();

      }else{

        this.previous();

      }

    }else{

      this.move(true);

    }


    this.resumeSoon();


    try{

      this.viewport.releasePointerCapture(
        event.pointerId
      );

    }catch(error){}

  }


  /* -----------------------------------------------
     EVENTS
  ------------------------------------------------ */

  bind(){

    /*
      Desktop hover pause
    */

    this.root.addEventListener(
      "mouseenter",
      () => this.pause()
    );


    this.root.addEventListener(
      "mouseleave",
      () => this.resumeSoon()
    );


    /*
      Touch / mouse drag
    */

    this.viewport.addEventListener(
      "pointerdown",
      event =>
      this.pointerDown(event)
    );


    this.viewport.addEventListener(
      "pointermove",
      event =>
      this.pointerMove(event)
    );


    this.viewport.addEventListener(
      "pointerup",
      event =>
      this.pointerUp(event)
    );


    this.viewport.addEventListener(
      "pointercancel",
      event =>
      this.pointerUp(event)
    );


    /*
      Seamless boundary correction
    */

    this.track.addEventListener(
      "transitionend",
      () => this.normalize()
    );


    /*
      Rebuild after resize
    */

    let resizeTimer;


    window.addEventListener(
      "resize",
      () => {

        clearTimeout(
          resizeTimer
        );


        resizeTimer =
        setTimeout(
          () => this.build(),
          180
        );

      }
    );

  }


  /* -----------------------------------------------
     INITIALIZE
  ------------------------------------------------ */

  init(){

    this.bind();

    this.build();

  }

}


/* =====================================================
   ACTIVATE EVERY SLIDER INDEPENDENTLY
   ===================================================== */

document
.querySelectorAll(
  "[data-slider]"
)
.forEach(
  slider =>
  new InfrictusSlider(slider)
);


/* =====================================================
   EXTRA ACCESSIBILITY
   ===================================================== */

document.addEventListener(
"visibilitychange",
() => {

  if(
    document.hidden
  ){

    document
    .querySelectorAll(
      "[data-slider]"
    )
    .forEach(
      slider => {

        if(slider._slider)
        slider._slider.stop();

      }
    );

  }

});
