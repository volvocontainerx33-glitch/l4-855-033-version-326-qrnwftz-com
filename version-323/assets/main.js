(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var button = select('.mobile-toggle');
    var nav = select('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var carousel = select('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = selectAll('.hero-slide', carousel);
    var dots = selectAll('.hero-dot', carousel);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  function setupLocalFilters() {
    var panel = select('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var input = select('#local-filter');
    var region = select('#region-filter');
    var year = select('#year-filter');
    var cards = selectAll('.filter-grid .movie-card');
    var empty = select('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var text = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = true;
        if (text && haystack.indexOf(text) === -1) {
          ok = false;
        }
        if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
          ok = false;
        }
        if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, year].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
  }

  function renderSearch() {
    var results = select('#search-results');
    var summary = select('#search-summary');
    var pageInput = select('#search-page-input');
    if (!results || !summary || !window.SITE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (pageInput) {
      pageInput.value = query;
    }
    if (!query) {
      return;
    }
    var q = query.toLowerCase();
    var matches = window.SITE_SEARCH_INDEX.filter(function (item) {
      return [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.tags,
        item.oneLine
      ].join(' ').toLowerCase().indexOf(q) !== -1;
    }).slice(0, 160);
    summary.textContent = matches.length ? '关键词“' + query + '”的相关内容' : '未找到匹配内容';
    results.innerHTML = matches.map(function (item) {
      return [
        '<article class="movie-card">',
        '<a class="movie-link" href="' + item.file + '">',
        '<span class="poster-frame">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.style.display=\'none\'">',
        '<span class="year-badge">' + escapeHtml(item.year) + '</span>',
        '<span class="hover-play">▶</span>',
        '</span>',
        '<span class="movie-info">',
        '<strong>' + escapeHtml(item.title) + '</strong>',
        '<em>' + escapeHtml(item.oneLine) + '</em>',
        '<span class="meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></span>',
        '</span>',
        '</a>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupLocalFilters();
    renderSearch();
  });
})();
