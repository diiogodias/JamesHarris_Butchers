/* James A Harris & Son Quality Butchers — site behaviour.
   Plain ES5-compatible JavaScript, no dependencies. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Swap the homepage's transparent bar for the solid one once the hero has
     started to scroll away. */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header--overlay');

    if (!header) {
      return;
    }

    function update() {
      header.classList.toggle('is-scrolled', window.pageYOffset > 60);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* Hamburger menu, used below 768px. */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');

    if (!toggle || !nav) {
      return;
    }

    var header = toggle.closest('.site-header');

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      /* Forces a solid background behind the open menu. */
      if (header) {
        header.classList.toggle('is-open', open);
      }
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    /* Close again once a destination has been chosen. */
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setOpen(false);
      }
    });

    /* Reset state if the viewport grows past the breakpoint while open. */
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768 && nav.classList.contains('is-open')) {
        setOpen(false);
      }
    });
  }

  /* Footer copyright year. */
  function setYear() {
    var el = document.getElementById('year');
    if (el) {
      el.textContent = new Date().getFullYear();
    }
  }

  /* Which day it is at the shop, not in the visitor's own timezone, so someone
     browsing from abroad still sees the correct row highlighted. Falls back to
     the local day if Intl or the timezone database is unavailable. */
  function shopDayIndex() {
    var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    try {
      var today = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        weekday: 'long'
      }).format(new Date());

      var index = names.indexOf(today);
      if (index !== -1) {
        return index;
      }
    } catch (error) {
      /* Drop through to the local reading below. */
    }

    return new Date().getDay();
  }

  /* Highlight today's row in the opening hours table. Rows carry data-day using
     JavaScript's numbering, 0 = Sunday, so Sunday is the last row. */
  function highlightToday() {
    var table = document.querySelector('[data-hours]');
    if (!table) {
      return;
    }

    var row = table.querySelector('tr[data-day="' + shopDayIndex() + '"]');
    if (!row) {
      return;
    }

    row.classList.add('is-today');
    row.setAttribute('aria-current', 'date');

    var dayCell = row.querySelector('th');
    if (dayCell) {
      var note = document.createElement('span');
      note.className = 'sr-only';
      note.textContent = ' (today)';
      dayCell.appendChild(note);
    }
  }

  /* Product photography is dropped into images/products/ later on. Until a file
     exists the browser would draw a broken-image icon, so hide the image and
     let the neutral placeholder panel show through instead. */
  function markMissingPhotos() {
    var images = document.querySelectorAll('.product-card > img');
    var i;

    function flag() {
      if (this.parentNode) {
        this.parentNode.classList.add('is-missing');
      }
    }

    for (i = 0; i < images.length; i++) {
      /* A cached failure may already have happened before this script ran. */
      if (images[i].complete) {
        if (!images[i].naturalWidth) {
          flag.call(images[i]);
        }
      } else {
        images[i].addEventListener('error', flag);
      }
    }
  }

  /* Fade sections in as they scroll into view. */
  function revealOnScroll() {
    var targets = document.querySelectorAll('.reveal');
    var i;

    if (!targets.length) {
      return;
    }

    /* Show everything at once if animation is unwanted or unsupported. */
    if (reduceMotion || !('IntersectionObserver' in window)) {
      for (i = 0; i < targets.length; i++) {
        targets[i].classList.add('is-visible');
      }
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          entries[j].target.classList.add('is-visible');
          observer.unobserve(entries[j].target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    for (i = 0; i < targets.length; i++) {
      observer.observe(targets[i]);
    }
  }

  function init() {
    initHeaderScroll();
    initNav();
    setYear();
    highlightToday();
    markMissingPhotos();
    revealOnScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
