(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    const slider = document.querySelector("[data-hero-slider]");
    if (slider) {
        const slides = selectAll("[data-hero-slide]", slider);
        const dots = selectAll("[data-hero-dot]", slider);
        let index = 0;

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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const next = Number(dot.getAttribute("data-hero-dot"));
                showSlide(next);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    const grids = selectAll("[data-card-grid]");
    const searchInputs = selectAll("[data-search-input]");
    const filterButtons = selectAll("[data-filter]");
    const query = new URLSearchParams(window.location.search).get("q") || "";
    let activeFilter = "all";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function getCards() {
        const cards = [];
        grids.forEach(function (grid) {
            selectAll("[data-search]", grid).forEach(function (card) {
                cards.push(card);
            });
        });
        return cards;
    }

    function currentTerm() {
        const input = searchInputs.find(function (item) {
            return item.value.trim() !== "";
        });
        return input ? input.value : "";
    }

    function applyFilter() {
        const term = normalize(currentTerm());
        const cards = getCards();
        cards.forEach(function (card) {
            const text = normalize(card.getAttribute("data-search"));
            const filterText = normalize(activeFilter);
            const matchSearch = !term || text.indexOf(term) !== -1;
            const matchFilter = activeFilter === "all" || text.indexOf(filterText) !== -1;
            card.classList.toggle("is-hidden-card", !(matchSearch && matchFilter));
        });
    }

    if (query) {
        searchInputs.forEach(function (input) {
            input.value = query;
        });
        applyFilter();
    }

    searchInputs.forEach(function (input) {
        input.addEventListener("input", applyFilter);
    });

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeFilter = button.getAttribute("data-filter") || "all";
            filterButtons.forEach(function (item) {
                item.classList.toggle("active", item === button);
            });
            applyFilter();
        });
    });

    selectAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            const input = form.querySelector("[data-search-input]");
            const term = input ? input.value.trim() : "";
            if (grids.length) {
                event.preventDefault();
                searchInputs.forEach(function (item) {
                    item.value = term;
                });
                applyFilter();
            }
        });
    });
}());
