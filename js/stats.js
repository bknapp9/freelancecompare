(function() {
  'use strict';

  /* ── IntersectionObserver for scroll animations ── */
  function createObserver(selector, staggerMs) {
    const items = document.querySelectorAll(selector);
    if (!items.length) return;

    function callback(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;

        const children = entry.target.querySelectorAll(selector);
        children.forEach((child, i) => {
          setTimeout(() => {
            child.classList.add('animate-in');
          }, i * staggerMs);
        })
      }
    )
  }

    const observer = new IntersectionObserver(callback, { threshold: 0.15 });

    const parents = new Set();
    items.forEach(function(item) {
      parents.add(item.parentElement);
    });
    parents.forEach(function(parent) {
      observer.observe(parent);
    });
  }

  /* ── Animate bar widths after elements become visible ── */
  function animateBars(containerSelector, barSelector, dataAttr) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    function callback(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;

        const bars = entry.target.querySelectorAll(barSelector);
        bars.forEach(function(bar, i) {
          setTimeout(function() {
            bar.style.width = bar.getAttribute(dataAttr) + '%';
          }, i * 100);
        });

        observer.unobserve(entry.target);
      });
    };

    const observer = new IntersectionObserver(callback, { threshold: 0.15 })
      
    observer.observe(container);
  }

  /* ── Init animations ── */
  createObserver('.pop-bar-item', 100);
  animateBars('.popularity-chart', '.pop-bar-fill', 'data-width');

  createObserver('.category-card', 80);
  animateBars('.category-grid', '.cat-bar-fill', 'data-width');

  createObserver('.skill-pill', 50);

})();
