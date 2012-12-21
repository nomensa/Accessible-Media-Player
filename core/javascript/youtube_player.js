window.YoutubePlayer = function (config) {
  this.config = config;
};

window.YoutubePlayer.prototype = {
  /*
   * Initialisation function to be called when instance has all required methods (post decoration)
   */
  init : function () {
    var tag = document.createElement('script'),
    firstScriptTag = document.getElementsByTagName('script')[0],
    inst = this;

    tag.src = "//www.youtube.com/iframe_api";
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    this.$html = this.assembleHTML();

    window.onYouTubeIframeAPIReady = function () {
      inst.player = new YT.Player(inst.config.id, {
        height: inst.config.playerStyles.height,
        width: inst.config.playerStyles.width,
        videoId: inst.config.media,
        events: {
          'onReady': inst.onPlayerReady,
          'onStateChange': inst.onPlayerStateChange
        }
      });
    };
  },
  state : {
    "ended": 0,
    "playing": 1,
    "paused": 2,
    "unstarted":-1  
  },
  onPlayerReady : function (event) {
  },
  onPlayerStateChange : function (event) {
  },
  generateVideoPlayer : function($playerContainer){
    var $video = $('<'+this.config.flashContainer+' />').attr('id', 'player-' + this.config.id);
    /* Create our video container */
    var $videoContainer = $('<span />').addClass('video');
    // Create our entire player container
    $playerContainer.append($videoContainer.append($video));
    return $playerContainer;
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
    this.onPlayerStateChange(this.state.playing);

    if (this.config.captionsOn && this.captions) {
      this.setCaptionTimeout();
    }
  },
  pause: function () {
    this.player.pauseVideo();
    this.onPlayerStateChange(this.state.paused);

    if (this.config.captionsOn && this.captions) {
      this.clearCaptionTimeout();
    }
  },
  ffwd: function () {
    var time = this.getCurrentTime() + 10,
        duration = this.getDuration();

    if (time > duration) {
      time = duration;
    }
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
  cue: function () { this.player.cueVideoById(this.config.media); }
};
