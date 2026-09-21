
/* =========================================================
   INFRICTUS - FINAL INTERACTION SCRIPT
   ========================================================= */

const WHATSAPP_NUMBER = "916388605805";

/* MOBILE NAVIGATION */
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
navLinks?.classList.remove("open");
menuToggle?.addEventListener("click", () => {
  navLinks?.classList.toggle("open");
  menuToggle.setAttribute("aria-label",
    navLinks.classList.contains("open") ? "Close menu" : "Open menu");
});
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks?.classList.remove("open");
    menuToggle?.setAttribute("aria-label","Open menu");
  });
});

/* SCROLL REVEAL */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

/* CONTACT FORM */
document.getElementById("contact-form")?.addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message =
    `Hello INFRICTUS,\n\nName: ${form.get("name") || ""}\n` +
    `Service: ${form.get("service") || ""}\nMessage: ${form.get("message") || ""}`;
  if (!WHATSAPP_NUMBER || WHATSAPP_NUMBER.includes("X")) {
    alert("Please update the WhatsApp number in script.js before using the form.");
    return;
  }
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank","noopener,noreferrer"
  );
});

/* IMAGE MODAL */
const imageModal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");
const modalClose = document.getElementById("modal-close");
const closeImageModal = () => {
  imageModal?.classList.remove("open");
  imageModal?.setAttribute("aria-hidden","true");
  if (modalImage) modalImage.src = "";
  document.body.style.overflow = "";
  document.querySelectorAll("[data-slider]").forEach(s => s.classList.remove("is-paused"));
};
const openImageModal = image => {
  if (!imageModal || !modalImage) return;
  modalImage.src = image.currentSrc || image.src;
  modalImage.alt = image.alt || "INFRICTUS preview";
  imageModal.classList.add("open");
  imageModal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
};
document.querySelectorAll(".zoomable-image").forEach(image => {
  image.tabIndex = 0;
  image.setAttribute("role","button");
  image.addEventListener("click",() => openImageModal(image));
  image.addEventListener("keydown",event => {
    if(event.key === "Enter" || event.key === " "){
      event.preventDefault();
      openImageModal(image);
    }
  });
});
modalClose?.addEventListener("click",closeImageModal);
imageModal?.addEventListener("click",event => {
  if(event.target === imageModal) closeImageModal();
});
document.addEventListener("keydown",event => {
  if(event.key === "Escape") closeImageModal();
});

/* =========================================================
   TOUCH-FIRST INDEPENDENT SLIDERS
   - no arrow UI
   - auto rotate
   - swipe / drag
   - pause on hover / touch / click
   - smooth loop using cloned slides
   - every slider owns its own state
   ========================================================= */
class TouchSlider{
  constructor(root){
    this.root=root;
    this.viewport=root.querySelector(".slider-viewport");
    this.track=root.querySelector(".slider-track");
    this.dots=root.querySelector(".slider-dots");
    if(!this.viewport || !this.track) return;

    this.original=[...this.track.children];
    this.index=0;
    this.timer=null;
    this.resumeTimer=null;
    this.dragging=false;
    this.startX=0;
    this.currentX=0;
    this.baseTranslate=0;
    this.speed=Number(root.dataset.autoplay || 4000);
    this.bind();
    this.build();
  }

  visible(){
    if(innerWidth <= 620) return 1;
    if(innerWidth <= 900) return 2;
    return 3;
  }

  build(){
    this.stop();
    this.track.innerHTML="";
    const count=this.original.length;
    const visible=Math.min(this.visible(),Math.max(1,count));
    this.visibleCount=visible;

    /* enough clones for a seamless boundary */
    const head=this.original.slice(0,visible).map(n=>n.cloneNode(true));
    const tail=this.original.slice(-visible).map(n=>n.cloneNode(true));
    tail.forEach(n=>this.track.appendChild(n));
    this.original.forEach(n=>this.track.appendChild(n.cloneNode(true)));
    head.forEach(n=>this.track.appendChild(n));

    this.realCount=count;
    this.index=visible;
    this.dots.innerHTML="";
    for(let i=0;i<count;i++){
      const b=document.createElement("button");
      b.type="button";
      b.setAttribute("aria-label",`Go to slide ${i+1}`);
      b.addEventListener("click",()=>{
        this.pause();
        this.goTo(visible+i,true);
        this.delayedResume();
      });
      this.dots.appendChild(b);
    }
    this.layout(false);
    this.updateDots();
    this.start();
  }

  stepWidth(){
    const first=this.track.children[0];
    if(!first) return this.viewport.clientWidth;
    const gap=parseFloat(getComputedStyle(this.track).gap)||0;
    return first.getBoundingClientRect().width+gap;
  }

  layout(animate=true){
    this.track.style.transition=animate ? "transform .62s cubic-bezier(.22,.7,.2,1)" : "none";
    this.baseTranslate=this.index*this.stepWidth();
    this.track.style.transform=`translate3d(${-this.baseTranslate}px,0,0)`;
  }

  goTo(index,animate=true){
    this.index=index;
    this.layout(animate);
    this.updateDots();
  }

  updateDots(){
    if(!this.dots) return;
    let real=(this.index-this.visibleCount)%this.realCount;
    if(real<0) real+=this.realCount;
    [...this.dots.children].forEach((b,i)=>b.classList.toggle("is-active",i===real));
  }

  normalize(){
    const min=this.visibleCount;
    const max=this.visibleCount+this.realCount;
    if(this.index>=max){
      this.index=min;
      this.layout(false);
    }else if(this.index<min){
      this.index=max-1;
      this.layout(false);
    }
    this.updateDots();
  }

  next(){
    if(this.realCount<=this.visibleCount) return;
    this.goTo(this.index+1,true);
  }

  start(){
    this.stop();
    if(this.realCount<=this.visibleCount) return;
    this.timer=setInterval(()=>this.next(),this.speed);
  }

  stop(){
    clearInterval(this.timer);
    this.timer=null;
  }

  pause(){
    this.stop();
    this.root.classList.add("is-paused");
    clearTimeout(this.resumeTimer);
  }

  delayedResume(){
    clearTimeout(this.resumeTimer);
    this.resumeTimer=setTimeout(()=>{
      this.root.classList.remove("is-paused");
      this.start();
    },900);
  }

  bind(){
    this.root.addEventListener("mouseenter",()=>this.pause());
    this.root.addEventListener("mouseleave",()=>this.delayedResume());
    this.root.addEventListener("focusin",()=>this.pause());
    this.root.addEventListener("focusout",()=>this.delayedResume());

    this.viewport.addEventListener("pointerdown",e=>{
      this.pause();
      this.dragging=true;
      this.root.classList.add("is-dragging");
      this.startX=e.clientX;
      this.currentX=e.clientX;
      this.track.style.transition="none";
      this.viewport.setPointerCapture?.(e.pointerId);
    });

    this.viewport.addEventListener("pointermove",e=>{
      if(!this.dragging) return;
      this.currentX=e.clientX;
      const delta=this.currentX-this.startX;
      const offset=this.index*this.stepWidth()-delta;
      this.track.style.transform=`translate3d(${-offset}px,0,0)`;
    });

    const end=e=>{
      if(!this.dragging) return;
      this.dragging=false;
      this.root.classList.remove("is-dragging");
      const delta=this.currentX-this.startX;
      const threshold=Math.min(90,Math.max(42,this.viewport.clientWidth*.12));
      if(Math.abs(delta)>threshold){
        this.goTo(this.index+(delta<0?1:-1),true);
      }else{
        this.layout(true);
      }
      this.delayedResume();
      try{this.viewport.releasePointerCapture?.(e.pointerId)}catch(_){}
    };
    this.viewport.addEventListener("pointerup",end);
    this.viewport.addEventListener("pointercancel",end);

    this.track.addEventListener("transitionend",()=>{
      this.normalize();
    });

    window.addEventListener("resize",()=>{
      clearTimeout(this.resizeTimer);
      this.resizeTimer=setTimeout(()=>this.build(),150);
    });
  }
}

document.querySelectorAll("[data-slider]").forEach(root => new TouchSlider(root));

/* keep forms clean after back/forward navigation */
window.addEventListener("pageshow",()=>{
  document.querySelectorAll("form[data-reset-on-load='true']").forEach(form=>form.reset());
});
