(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function imageFallback(root) {
    root.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.style.opacity = "0";
      }, { once: true });
    });
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("active");
    });
  }

  function renderSuggestion(movie) {
    return [
      "<a class=\"search-suggestion\" href=\"" + movie.url + "\">",
      "<img src=\"" + movie.cover + "\" alt=\"" + movie.title.replace(/\"/g, "&quot;") + "\">",
      "<span><strong>" + movie.title + "</strong><em>" + movie.year + " · " + movie.region + "</em></span>",
      "</a>"
    ].join("");
  }

  function findMovies(query, limit) {
    var q = normalize(query);
    if (!q || !Array.isArray(window.MOVIE_INDEX)) {
      return [];
    }
    return window.MOVIE_INDEX.filter(function (movie) {
      return normalize(movie.title + " " + movie.tags + " " + movie.year + " " + movie.region).indexOf(q) !== -1;
    }).slice(0, limit || 8);
  }

  function initHeaderSearch() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var panel = form.querySelector("[data-search-panel]");
      if (!input || !panel) {
        return;
      }
      input.addEventListener("input", function () {
        var results = findMovies(input.value, 8);
        if (!results.length) {
          panel.classList.remove("active");
          panel.innerHTML = "";
          return;
        }
        panel.innerHTML = results.map(renderSuggestion).join("");
        panel.classList.add("active");
        imageFallback(panel);
      });
      form.addEventListener("submit", function (event) {
        var results = findMovies(input.value, 1);
        if (results.length) {
          event.preventDefault();
          window.location.href = results[0].url;
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("active");
        }
      });
    });
  }

  function initPageFilter() {
    var filter = document.querySelector("[data-page-filter]");
    if (!filter) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    filter.addEventListener("input", function () {
      var q = normalize(filter.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags"));
        card.classList.toggle("is-hidden", q && haystack.indexOf(q) === -1);
      });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
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
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector("script[src='" + url + "']");
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      var script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initPlayer() {
    var panel = document.querySelector("[data-player]");
    if (!panel) {
      return;
    }
    var video = panel.querySelector("video");
    var overlay = panel.querySelector(".player-overlay");
    if (!video || !overlay) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return Promise.resolve();
      }
      function attachHls() {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      if (window.Hls) {
        attachHls();
        return Promise.resolve();
      }
      return loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js").then(attachHls).catch(function () {
        video.src = stream;
      });
    }

    function startPlayback() {
      panel.classList.add("is-active");
      attach().then(function () {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            video.controls = true;
          });
        }
      });
    }

    overlay.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      panel.classList.add("is-active");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-page-input]");
    var resultsNode = document.querySelector("[data-search-results]");
    if (!form || !input || !resultsNode) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function draw() {
      var results = findMovies(input.value, 60);
      resultsNode.innerHTML = results.map(function (movie) {
        return [
          "<article class=\"movie-card\">",
          "<a class=\"poster-link\" href=\"" + movie.url + "\"><img src=\"" + movie.cover + "\" alt=\"" + movie.title.replace(/\"/g, "&quot;") + "\"><span class=\"poster-glow\"></span><span class=\"watch-badge\">播放</span></a>",
          "<div class=\"movie-card-body\"><div class=\"card-tags\"><span>" + movie.year + "</span><span>" + movie.region + "</span></div><h3><a href=\"" + movie.url + "\">" + movie.title + "</a></h3><p>" + movie.desc + "</p></div>",
          "</article>"
        ].join("");
      }).join("");
      imageFallback(resultsNode);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      window.history.replaceState(null, "", q ? "./search.html?q=" + encodeURIComponent(q) : "./search.html");
      draw();
    });
    input.addEventListener("input", draw);
    draw();
  }

  ready(function () {
    imageFallback(document);
    initMenu();
    initHeaderSearch();
    initPageFilter();
    initHeroSlider();
    initPlayer();
    initSearchPage();
  });
})();
