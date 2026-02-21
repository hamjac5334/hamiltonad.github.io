/**
 * Hamilton A&D – Scroll reveal, hero arrow, header scroll, and micro-interactions
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll-triggered reveal with stagger support
  var observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('is-visible');
      observer.unobserve(el);
    });
  }, observerOptions);

  function observeAll(selector) {
    var nodes = document.querySelectorAll(selector);
    nodes.forEach(function (node) { observer.observe(node); });
  }

  /** Hero scroll arrow: inject SVG and scroll to #stats on click/key */
  function initHeroScrollArrow() {
    var arrowEl = document.getElementById('hero-scroll-arrow');
    if (!arrowEl) return;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M19 12l-7 7-7-7"/>';
    arrowEl.appendChild(svg);

    if (prefersReducedMotion) {
      arrowEl.classList.add('reduced-motion');
    }

    function scrollToNext() {
      var target = document.getElementById('stats');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    arrowEl.addEventListener('click', scrollToNext);
    arrowEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToNext();
      }
    });
  }

  /** Header: add .header-scrolled when user has scrolled for a stronger shadow */
  function initHeaderScroll() {
    var header = document.querySelector('.header');
    if (!header) return;

    var scrollThreshold = 60;
    function updateHeader() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }

    window.addEventListener('scroll', function () {
      if (prefersReducedMotion) return;
      requestAnimationFrame(updateHeader);
    }, { passive: true });
    updateHeader();
  }

  /** Smooth scroll for in-page anchor links */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /** Optional count-up for stats (elements with data-count) */
  function initCountUps() {
    var statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (!statNumbers.length) return;

    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;
        var duration = 1400;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var easeOut = 1 - Math.pow(1 - progress, 2);
          el.textContent = Math.floor(easeOut * target);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.3 });

    statNumbers.forEach(function (el) { countObserver.observe(el); });
  }

  function init() {
    observeAll('.animate-on-scroll');
    observeAll('.animate-on-scroll-stagger');
    observeAll('.stat-item');
    initCountUps();
    initSmoothScroll();
    initHeroScrollArrow();
    initHeaderScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
