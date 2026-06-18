(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.getElementById("mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function textOf(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initFilters() {
    var filters = document.querySelectorAll(".site-filter");
    filters.forEach(function (filter) {
      var scope = filter.closest(".filter-scope") || document;
      var input = filter.querySelector(".filter-input");
      var year = filter.querySelector(".year-filter");
      var region = filter.querySelector(".region-filter");
      var category = filter.querySelector(".category-filter");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
      var empty = scope.querySelector(".empty-state");

      function apply() {
        var query = textOf(input && input.value);
        var yearValue = textOf(year && year.value);
        var regionValue = textOf(region && region.value);
        var categoryValue = textOf(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = textOf(card.getAttribute("data-meta"));
          var cardYear = textOf(card.getAttribute("data-year"));
          var cardRegion = textOf(card.getAttribute("data-region"));
          var cardCategory = textOf(card.getAttribute("data-category"));
          var match = true;

          if (query && haystack.indexOf(query) === -1) {
            match = false;
          }
          if (yearValue && cardYear !== yearValue) {
            match = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            match = false;
          }
          if (categoryValue && cardCategory !== categoryValue) {
            match = false;
          }

          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, region, category].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
    });
  }

  function initHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
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

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    if (slides.length > 1) {
      start();
    }
  }

  function initPlayer() {
    var config = document.getElementById("player-config");
    var video = document.getElementById("movie-player");
    var layer = document.querySelector(".player-layer");
    if (!config || !video || !layer) {
      return;
    }

    var playUrl = "";
    try {
      playUrl = JSON.parse(config.textContent || "{}").url || "";
    } catch (error) {
      playUrl = "";
    }
    if (!playUrl) {
      return;
    }

    var prepared = false;
    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playUrl;
      } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(playUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = playUrl;
      }
    }

    function play() {
      prepare();
      layer.classList.add("is-hidden");
      video.controls = true;
      video.play().catch(function () {});
    }

    layer.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!prepared) {
        play();
      }
    });
  }

  ready(function () {
    initMobileNav();
    initFilters();
    initHero();
    initPlayer();
  });
})();
