
(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
            var index = 0;

            function showSlide(nextIndex) {
                if (!slides.length) {
                    return;
                }

                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                });
            });

            showSlide(0);
            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(index + 1);
                }, 5600);
            }
        });

        document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var select = scope.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-empty-state]");
            var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var activeFilter = "all";

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function applyFilter() {
                var keyword = normalize(input ? input.value : "");
                var year = select ? select.value : "all";
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardGenre = normalize(card.getAttribute("data-genre"));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchYear = year === "all" || cardYear === year;
                    var matchFilter = activeFilter === "all" || cardGenre.indexOf(activeFilter) !== -1 || haystack.indexOf(activeFilter) !== -1;
                    var shouldShow = matchKeyword && matchYear && matchFilter;

                    card.style.display = shouldShow ? "" : "none";
                    if (shouldShow) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("visible", visibleCount === 0);
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (select) {
                select.addEventListener("change", applyFilter);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (other) {
                        other.classList.remove("active");
                    });
                    chip.classList.add("active");
                    activeFilter = normalize(chip.getAttribute("data-filter-value"));
                    applyFilter();
                });
            });
            applyFilter();
        });
    });
})();

function setupMoviePlayer(sourceUrl) {
    function init() {
        var video = document.getElementById("movie-player");
        var starter = document.querySelector("[data-player-start]");
        var hlsInstance = null;
        var loaded = false;

        if (!video || !sourceUrl) {
            return;
        }

        function loadAndPlay() {
            if (!loaded) {
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = sourceUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
            }

            if (starter) {
                starter.classList.add("is-hidden");
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (starter) {
                        starter.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (starter) {
            starter.addEventListener("click", loadAndPlay);
        }

        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                loadAndPlay();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}
