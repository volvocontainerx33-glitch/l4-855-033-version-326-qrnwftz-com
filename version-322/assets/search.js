(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    return [
      '<article class="movie-card group">',
      '  <a href="' + escapeHtml(movie.url) + '" class="movie-card-link">',
      '    <div class="movie-card-cover">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="movie-chip region-chip">' + escapeHtml(movie.region) + '</span>',
      '      <span class="movie-play">▶</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="movie-meta-line">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '        <span>' + escapeHtml(movie.category) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function runSearch() {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var data = window.SEARCH_INDEX || [];

    if (input) {
      input.value = q;
    }

    if (!results || !q) {
      return;
    }

    var lower = q.toLowerCase();
    var matched = data.filter(function (movie) {
      return String(movie.text || '').toLowerCase().indexOf(lower) !== -1;
    });

    if (!matched.length) {
      results.innerHTML = '<div class="empty-result"><h2>未找到匹配影片</h2><p>可以尝试更换片名、地区、类型或标签关键词。</p></div>';
      return;
    }

    results.innerHTML = matched.map(card).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runSearch);
  } else {
    runSearch();
  }
})();
