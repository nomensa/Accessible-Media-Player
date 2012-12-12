window.YoutubePlayer = function (config) {
  var tag = document.createElement('script'),
      firstScriptTag = document.getElementsByTagName('script')[0],
      inst = this;

  this.config = config;
  tag.src = "//www.youtube.com/iframe_api";
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player(config.id, {
      height: config.playerStyles.height,
      width: config.playerStyles.width,
      videoId: config.media,
      events: {
        'onReady': inst.onready
      }
    });
  };
};
window.YoutubePlayer.prototype = {
    onready: function (event) {
    },
    is_html5: false,
    play: function () {},
    pause: function () {},
    ffwd: function () {},
    rewd: function () {},
    mute: function () {},
    volup: function () {},
    voldwn: function () {},
    getDuration: function () {},
    getCurrentTime: function () {},
    getBytesLoaded: function () {},
    getBytesTotal: function () {},
    seek: function (time) {},
    cue: function () {}
};
