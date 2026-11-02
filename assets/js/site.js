(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  root.classList.add('has-js');

  // Reveal each image and its text as it enters the viewport. Content stays visible without script.
  const revealItems = document.querySelectorAll('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (item) { item.classList.add('revealed'); });
  } else {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    revealItems.forEach(function (item, index) {
      item.style.transitionDelay = (Math.min(index % 5, 4) * 45) + 'ms';
      revealObserver.observe(item);
    });
  }

  // Narrow-screen navigation.
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('open', open);
    });
  }

  // Filter the credited image collection.
  const filterButtons = document.querySelectorAll('[data-filter]');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const category = button.dataset.filter;
      filterButtons.forEach(function (item) {
        const selected = item === button;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      galleryItems.forEach(function (item) {
        item.hidden = category !== 'all' && item.dataset.category !== category;
      });
    });
  });

  // Native dialog lightbox with keyboard and previous/next controls.
  const dialog = document.querySelector('.lightbox');
  if (dialog && galleryItems.length) {
    const image = dialog.querySelector('figure img');
    const title = dialog.querySelector('.lightbox-title');
    const source = dialog.querySelector('.lightbox-source');
    let activeIndex = 0;
    const visibleItems = function () { return galleryItems.filter(function (item) { return !item.hidden; }); };
    const show = function (index) {
      const items = visibleItems();
      activeIndex = (index + items.length) % items.length;
      const item = items[activeIndex];
      image.src = item.dataset.image;
      image.alt = item.querySelector('img').alt;
      title.textContent = item.dataset.title + ' · ' + item.dataset.credit;
      source.href = item.dataset.source;
      source.textContent = 'View original on Unsplash ↗';
    };
    galleryItems.forEach(function (item) {
      item.addEventListener('click', function () {
        const items = visibleItems();
        show(items.indexOf(item));
        dialog.showModal();
        dialog.querySelector('.lightbox-close').focus();
      });
    });
    dialog.querySelector('.lightbox-close').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('.previous').addEventListener('click', function () { show(activeIndex - 1); });
    dialog.querySelector('.next').addEventListener('click', function () { show(activeIndex + 1); });
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') show(activeIndex - 1);
      if (event.key === 'ArrowRight') show(activeIndex + 1);
    });
  }

  // Short page transition fallback for browsers without cross-document View Transitions.
  if (!('onpagereveal' in window) && !reducedMotion) {
    root.classList.add('fallback-vt');
    document.addEventListener('click', function (event) {
      const link = event.target.closest('a');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download') || !link.href || new URL(link.href).origin !== location.origin) return;
      if (link.pathname === location.pathname && link.hash) return;
      event.preventDefault();
      root.classList.add('leaving');
      window.setTimeout(function () { location.href = link.href; }, 190);
    });
    window.addEventListener('pageshow', function (event) { if (event.persisted) root.classList.remove('leaving'); });
  }
})();
