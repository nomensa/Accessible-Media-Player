window.YoutubePlayer = function (config) {
  var tag = document.createElement('script'),
  firstScriptTag = document.getElementsByTagName('script')[0],
  inst = this;

  this.config = config;
  tag.src = "//www.youtube.com/iframe_api";
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = function () {
    inst.player = new YT.Player(config.id, {
      height: config.playerStyles.height,
      width: config.playerStyles.width,
      videoId: config.media,
      events: {
        'onReady': inst.onPlayerReady,
        'onStateChange': inst.onPlayerStateChange
      }
    });
  };
};

window.YoutubePlayer.prototype = {
  onPlayerReady: function (event) {
  },
  onPlayerStateChange: function (event) {
  },
  getPlayer: function () {
    return this.player;
  },

  /**
    * Past this point, functions are implemented keeping with the
    * Nomensa accessibility API.
    */
  is_html5: false,
  play: function () {
    this.player.playVideo();
    this.playing = true;
    // this.setSliderTimeout();

    if (this.config.captionsOn && this.captions) {
      this.setCaptionTimeout();
    }
  },
  pause: function () {
    this.player.pauseVideo();
    // this.clearSliderTimeout();

    if (this.config.captionsOn && this.captions) {
      this.clearCaptionTimeout();
    }
  },
  ffwd: function () {
    var time = this.getCurrentTime() + 10;
    this.seek(time);
  },
  rewd: function () {
    var time = this.getCurrentTime() - 10;

    if (time < 0) {
      time = 0;
    }
    this.seek(time);
  },
  mute: function () {
    if (!this.player.isMuted()) {
      this.player.mute();
    } else {
      this.player.unMute();
    }
  },
  volup: function () {
    var currentVolume = this.player.getVolume();
    this.player.setVolume(currentVolume >= 100 ? 100 : currentVolume + 1);
  },
  voldwn: function () {
    var currentVolume = this.player.getVolume();
    this.player.setVolume(currentVolume <= 0 ? 0 : currentVolume - 1);
  },
  getDuration: function () {
    return this.player.getDuration();
  },
  getCurrentTime: function () {
    return this.player.getCurrentTime();
  },
  getBytesLoaded: function () {
    return this.player.getVideoBytesLoaded();
  },
  getBytesTotal: function () {
    return this.player.getVideoBytesTotal();
  },
  seek: function (time) {
    this.player.seekTo(time, true);
  },
  cue: function () { return; }
};
