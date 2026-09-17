// CHANGE THIS NUMBER BEFORE DEPLOYMENT. Use digits only, including country code.
const WHATSAPP_NUMBER = '916388605805';
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Keep mobile navbar closed when website opens
navLinks?.classList.remove('open');

menuToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');

  menuToggle.setAttribute(
    'aria-label',
    navLinks.classList.contains('open')
      ? 'Close menu'
      : 'Open menu'
  );
});

// Close navbar when clicking any navigation link
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-label', 'Open menu');
  });
});

// Close navbar when switching to desktop screen
window.addEventListener('resize', () => {
  if (window.innerWidth > 680) {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-label', 'Open menu');
  }
});

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add('visible');
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.getElementById('contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message = `Hello INFRICTUS,\n\nName: ${form.get('name')}\nService: ${form.get('service')}\nMessage: ${form.get('message')}`;
  if (WHATSAPP_NUMBER.includes('X')) {
    alert('Please update WHATSAPP_NUMBER in script.js before using the WhatsApp form.');
    return;
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});


// Click-to-expand image previews with a clear close control.
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalClose = document.getElementById('modal-close');
const closeImageModal = () => {
  imageModal?.classList.remove('open');
  imageModal?.setAttribute('aria-hidden','true');
  if (modalImage) modalImage.src = '';
  document.body.style.overflow = '';
};
document.querySelectorAll('.zoomable-image').forEach(image => {
  const open = () => {
    if (!imageModal || !modalImage) return;
    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt;
    imageModal.classList.add('open');
    imageModal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  };
  image.addEventListener('click', open);
  image.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
});
modalClose?.addEventListener('click', closeImageModal);
imageModal?.addEventListener('click', event => { if (event.target === imageModal) closeImageModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeImageModal(); });
