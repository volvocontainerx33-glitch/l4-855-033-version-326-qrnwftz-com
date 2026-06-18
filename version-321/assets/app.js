(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function initFilterChips() {
    var group = document.querySelector("[data-filter-group]");
    var list = document.querySelector("[data-filter-list]");
    if (!group || !list) {
      return;
    }
    var chips = Array.prototype.slice.call(group.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll(".searchable-card"));
    var empty = document.querySelector("[data-empty-state]");

    function apply(value) {
      var needle = normalize(value);
      var visible = 0;
      cards.forEach(function (card) {
        var tags = normalize(card.getAttribute("data-tags") || card.getAttribute("data-search"));
        var ok = needle === "all" || tags.indexOf(needle) !== -1;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      chips.forEach(function (chip) {
        chip.classList.toggle("is-active", chip.getAttribute("data-filter-value") === value);
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        apply(chip.getAttribute("data-filter-value"));
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(results.querySelectorAll(".searchable-card"));
    var empty = document.querySelector("[data-empty-state]");
    if (input) {
      input.value = query;
      input.addEventListener("input", function () {
        apply(input.value);
      });
    }

    function apply(value) {
      var needle = normalize(value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var ok = !needle || haystack.indexOf(needle) !== -1;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    apply(query);
  }

  window.setupPlayer = function (videoId, buttonId, mediaUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !mediaUrl) {
      return;
    }
    var loaded = false;
    var hls = null;

    function hideButton() {
      button.classList.add("is-hidden");
    }

    function showButton() {
      if (video.paused) {
        button.classList.remove("is-hidden");
      }
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          showButton();
        });
      }
    }

    function loadMedia() {
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            video.src = mediaUrl;
            video.load();
            playVideo();
          }
        });
        return;
      }
      video.src = mediaUrl;
      video.load();
      playVideo();
    }

    button.addEventListener("click", function () {
      hideButton();
      loadMedia();
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        hideButton();
        loadMedia();
      }
    });
    video.addEventListener("play", hideButton);
    video.addEventListener("pause", showButton);
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilterChips();
    initSearchPage();
  });
})();
