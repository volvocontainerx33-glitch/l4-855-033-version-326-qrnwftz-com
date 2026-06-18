(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        var isHidden = mobileMenu.hasAttribute('hidden');
        if (isHidden) {
          mobileMenu.removeAttribute('hidden');
          menuButton.textContent = '×';
        } else {
          mobileMenu.setAttribute('hidden', '');
          menuButton.textContent = '☰';
        }
      });
    }

    document.querySelectorAll('.search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    }

    if (slides.length) {
      showSlide(0);
      startHero();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
        showSlide(index);
        restartHero();
      });
    });

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
      var searchInput = filterPanel.querySelector('[data-filter-search]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
      var state = {
        type: 'all',
        year: 'all',
        category: 'all'
      };

      function normalize(value) {
        return String(value || '').toLowerCase();
      }

      function applyFilters() {
        var term = searchInput ? normalize(searchInput.value.trim()) : '';
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-card-text'));
          var matched = true;
          if (term && text.indexOf(term) === -1) {
            matched = false;
          }
          Object.keys(state).forEach(function (key) {
            if (state[key] !== 'all' && card.getAttribute('data-' + key) !== state[key]) {
              matched = false;
            }
          });
          card.style.display = matched ? '' : 'none';
        });
      }

      filterPanel.querySelectorAll('[data-filter-button]').forEach(function (button) {
        button.addEventListener('click', function () {
          var key = button.getAttribute('data-filter-key');
          var value = button.getAttribute('data-filter-value');
          state[key] = value;
          filterPanel.querySelectorAll('[data-filter-key="' + key + '"]').forEach(function (peer) {
            peer.classList.toggle('is-active', peer === button);
          });
          applyFilters();
        });
      });

      if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
      }
    }
  });
})();
