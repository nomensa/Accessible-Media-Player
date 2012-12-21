window.YoutubePlayer = function (config) {
  this.config = config;
};

window.YoutubePlayer.prototype = {
  /*
   * Initialisation function to be called when instance has all required methods (post decoration)
   */
  init : function ($holder) {
    var tag = document.createElement('script'),
    firstScriptTag = document.getElementsByTagName('script')[0],
    inst = this;

    tag.src = "//www.youtube.com/iframe_api";
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    this.$html = this.assembleHTML();

    if(this.config.captions){
            this.getCaptions();
    }
    $holder.html(this.$html);

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
    this.setSliderTimeout();
    this.onPlayerStateChange(this.state.playing);

    if (this.config.captionsOn && this.captions) {
      this.setCaptionTimeout();
    }
  },
  pause: function () {
    this.player.pauseVideo();
    this.clearSliderTimeout();
    this.onPlayerStateChange(this.state.paused);

    if (this.config.captionsOn && this.captions) {
      this.clearCaptionTimeout();
    }
  },
  ffwd: function () {
    var time = this.getCurrentTime() + this.config.playerSkip,
        duration = this.getDuration();

    if (time > duration) {
      time = duration;
    }
    this.seek(time);
  },
  rewd: function () {
    var time = this.getCurrentTime() - this.config.playerSkip;

    if (time < 0) {
      time = 0;
    }
    this.seek(time);
  },
  mute: function () {
    var $button = this.$html.find('button.mute');
    if (this.player.isMuted()) {
        this.player.unMute();
        if ($button.hasClass('muted')) {
            $button.removeClass('muted');
        }
    } else {
        this.player.mute();
        $button.addClass('muted');
    }
  },
  volup: function () {
    var currentVolume = this.player.getVolume();
    this.player.setVolume(currentVolume >= 100 ? 100 : currentVolume + this.config.volumeStep);
  },
  voldwn: function () {
    var currentVolume = this.player.getVolume();
    this.player.setVolume(currentVolume <= 0 ? 0 : currentVolume - this.config.volumeStep);
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
    if (this.config.captionsOn && this.captions) {
        this.$html.find('.caption').remove();
        this.clearCaptionTimeout();
        this.setCaptionTimeout();
        this.getPreviousCaption();
    }
  },
  cue: function () { this.player.cueVideoById(this.config.media); }
};
