(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".nav-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll("[data-search-form]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "./search.html";
                window.location.href = target + (query ? "?q=" + encodeURIComponent(query) : "");
            });
        });
    }

    function setupFilters() {
        var root = document.querySelector("[data-filter-root]");
        if (!root) {
            return;
        }
        var keyword = document.querySelector("[data-filter-input]");
        var region = document.querySelector("[data-region-filter]");
        var year = document.querySelector("[data-year-filter]");
        var type = document.querySelector("[data-type-filter]");
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
        var empty = document.querySelector("[data-empty-state]");

        function applyFilter() {
            var key = normalize(keyword && keyword.value);
            var regionValue = normalize(region && region.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.tags,
                    card.textContent
                ].join(" "));
                var matched = true;

                if (key && haystack.indexOf(key) === -1) {
                    matched = false;
                }
                if (regionValue && normalize(card.dataset.region).indexOf(regionValue) === -1) {
                    matched = false;
                }
                if (yearValue && normalize(card.dataset.year) !== yearValue) {
                    matched = false;
                }
                if (typeValue && normalize(card.dataset.type) !== typeValue) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        [keyword, region, year, type].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", applyFilter);
            control.addEventListener("change", applyFilter);
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && keyword) {
            keyword.value = query;
        }
        applyFilter();
    }

    window.setupMoviePlayer = function (videoId, buttonId, streamUrl) {
        ready(function () {
            var video = document.getElementById(videoId);
            var button = document.getElementById(buttonId);
            var hlsInstance = null;
            var started = false;

            if (!video || !button || !streamUrl) {
                return;
            }

            function start() {
                if (started) {
                    video.play();
                    return;
                }
                started = true;
                video.controls = true;
                button.classList.add("is-hidden");

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    video.play();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play();
                    });
                    return;
                }

                video.src = streamUrl;
                video.play();
            }

            button.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (!started) {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    };

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupFilters();
    });
})();
