(function () {
  var cachedHls = null;

  async function getHls() {
    if (window.Hls) {
      return window.Hls;
    }
    if (cachedHls) {
      return cachedHls;
    }
    try {
      var module = await import('./hls-dru42stk.js');
      cachedHls = module.H || module.default || null;
      return cachedHls;
    } catch (error) {
      return null;
    }
  }

  async function attachStream(video, source) {
    if (!video || !source || video.dataset.ready === 'true') {
      return;
    }
    video.dataset.ready = 'true';
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }
    var Hls = await getHls();
    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsController = hls;
      return;
    }
    video.src = source;
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    if (!video || !button) {
      return;
    }

    async function play() {
      await attachStream(video, options.source);
      button.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
  };
})();
