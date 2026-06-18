(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      mobileButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
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
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showSlide(0);
    startHero();
  }

  var filterList = document.querySelector('[data-filter-list]');
  var filterInput = document.querySelector('[data-filter-input]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var emptyState = document.querySelector('[data-empty-state]');

  if (filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    function fillSelect(select, attr) {
      if (!select) {
        return;
      }
      var values = cards
        .map(function (card) {
          return card.getAttribute(attr) || '';
        })
        .filter(Boolean)
        .filter(function (value, index, list) {
          return list.indexOf(value) === index;
        })
        .sort(function (a, b) {
          return b.localeCompare(a, 'zh-CN');
        });
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function filterCards() {
      var query = (filterInput && filterInput.value ? filterInput.value : '').trim().toLowerCase();
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var visible = true;

        if (query && text.indexOf(query) === -1) {
          visible = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          visible = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          visible = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          visible = false;
        }

        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = shown !== 0;
      }
    }

    fillSelect(regionSelect, 'data-region');
    fillSelect(yearSelect, 'data-year');
    fillSelect(typeSelect, 'data-type');

    [filterInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  }

  var playerBoxes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  var hlsLoading = false;
  var hlsCallbacks = [];

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsCallbacks.push(callback);
    if (hlsLoading) {
      return;
    }
    hlsLoading = true;
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.onload = function () {
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn();
      });
    };
    script.onerror = function () {
      hlsCallbacks.splice(0).forEach(function (fn) {
        fn(new Error('hls-load-failed'));
      });
    };
    document.head.appendChild(script);
  }

  function startPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var message = box.querySelector('[data-player-message]');
    var source = box.getAttribute('data-video-url');

    if (!video || !source) {
      if (message) {
        message.textContent = '播放源暂不可用';
      }
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    if (message) {
      message.textContent = '正在载入播放源...';
    }

    function play() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (message) {
            message.textContent = '请再次点击播放器开始播放';
          }
        });
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = source;
      }
      video.addEventListener('loadedmetadata', play, { once: true });
      video.load();
      return;
    }

    loadHls(function (error) {
      if (error || !window.Hls || !window.Hls.isSupported()) {
        if (message) {
          message.textContent = '当前浏览器不支持 HLS 播放';
        }
        if (button) {
          button.classList.remove('is-hidden');
        }
        return;
      }

      if (!box._hlsInstance) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        box._hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (message) {
            message.textContent = '';
          }
          play();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (message) {
            message.textContent = data.type === window.Hls.ErrorTypes.NETWORK_ERROR ? '网络异常，正在重试' : '播放异常，正在恢复';
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else {
        play();
      }
    });
  }

  playerBoxes.forEach(function (box) {
    var button = box.querySelector('[data-play-button]');
    var video = box.querySelector('video');
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(box);
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!video.src) {
          startPlayer(box);
        }
      });
    }
  });

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.SEARCH_DATA) {
    var form = searchPage.querySelector('[data-search-form]');
    var input = searchPage.querySelector('[data-search-input]');
    var results = searchPage.querySelector('[data-search-results]');
    var meta = searchPage.querySelector('[data-search-meta]');
    var params = new URLSearchParams(window.location.search);

    function movieCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '  <a class="card-cover" href="' + escapeHtml(movie.url) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
        '    <span class="card-badge">' + escapeHtml(movie.year) + '</span>',
        '    <span class="play-dot">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
        '    <p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
        '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="card-tags">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function runSearch(query) {
      var q = (query || '').trim().toLowerCase();
      if (!q) {
        results.innerHTML = '';
        meta.textContent = '请输入关键词开始搜索。';
        return;
      }
      var matched = window.SEARCH_DATA.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine]
          .join(' ')
          .toLowerCase()
          .indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(movieCard).join('');
      meta.textContent = matched.length ? '为你展示相关搜索结果。' : '没有找到匹配内容。';
    }

    if (params.get('q')) {
      input.value = params.get('q');
      runSearch(input.value);
    } else {
      meta.textContent = '请输入关键词开始搜索。';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch(input.value);
      var url = new URL(window.location.href);
      url.searchParams.set('q', input.value.trim());
      window.history.replaceState(null, '', url.toString());
    });
  }
})();
