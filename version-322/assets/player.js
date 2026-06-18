(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var player = document.querySelector('.watch-player');
    if (!player) {
      return;
    }

    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-trigger]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var hls = null;
    var started = false;

    function start() {
      if (!video || !stream) {
        return;
      }

      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = stream;
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
