(function () {
  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
      if (slides.length <= 1) {
        return;
      }
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        thumbs.forEach(function (thumb, thumbIndex) {
          thumb.classList.toggle('is-active', thumbIndex === current);
        });
      }

      function play() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function pause() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      thumbs.forEach(function (thumb, index) {
        thumb.addEventListener('click', function () {
          pause();
          show(index);
          play();
        });
      });

      hero.addEventListener('mouseenter', pause);
      hero.addEventListener('mouseleave', play);
      play();
    });
  }

  function setupSearch() {
    document.querySelectorAll('[data-search-area]').forEach(function (area) {
      var input = area.querySelector('[data-search-input]');
      var region = area.querySelector('[data-filter-region]');
      var year = area.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(area.querySelectorAll('[data-movie-card]'));
      if (!cards.length) {
        return;
      }

      function apply() {
        var keyword = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
          var matchYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
          card.classList.toggle('is-hidden', !(matchKeyword && matchRegion && matchYear));
        });
      }

      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-button]');
      var source = player.getAttribute('data-source');
      var loaded = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function loadSource() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            player.classList.add('is-ready');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              }
            }
          });
        } else {
          video.src = source;
          player.classList.add('is-ready');
        }
      }

      function startPlayback() {
        loadSource();
        var promise = video.play();
        if (promise && typeof promise.then === 'function') {
          promise.then(function () {
            player.classList.add('is-playing');
          }).catch(function () {
            video.controls = true;
          });
        } else {
          player.classList.add('is-playing');
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          startPlayback();
        });
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      video.addEventListener('loadedmetadata', function () {
        player.classList.add('is-ready');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
