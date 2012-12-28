window.nomensaPlayer = window.nomensaPlayer || {};
window.nomensaPlayer.YoutubePlayer = function (config) {
  this.config = config;
};

window.nomensaPlayer.YoutubePlayer.prototype = {
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
      inst.player = new YT.Player('player-' + inst.config.id, {
        height: inst.config.playerStyles.height,
        width: inst.config.playerStyles.width,
        videoId: inst.config.media,
        events: {
          'onReady': function (event) {
            inst.onPlayerReady(event);
          },
          'onStateChange': function (event) {
            inst.onPlayerStateChange(event.data);
          }
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
  onPlayerReady : (function () {
    var actions = [],
        i;
    
    /**
     * If run without parameters, assume fired by event
     * If param is a function, add this to those run when fired
    */ 

    return function (param) {
      var actionsLen = actions.length;

      if (typeof param === 'function') {
        actions.push(param);
      } else {
        if (actionsLen === 0) { return false; }
        for (i = 0; i < actionsLen; i++) {
          actions[i].apply(this, arguments);
        }
      }
    };
  }()),
/*
 * Function that is called on Youtube player state change
 * We use this to listen for any play commands that have not been initialised
 * using the media player control panel (e.g. if the play button within the
 * actual flash element is activated).
 * 
 * @param state {int}: The state code for the player when this function is fired
 *   This code is set by the youtube api.  Can be one of:
 *     -> -1: Unstarted
 *     -> 0 : Ended
 *     -> 1 : Playing
 *     -> 2 : Paused
 *     -> 3 : Buffering
 *     -> 5 : Video Cued
 * 
 *---------------------------------------------------------------------------*/ 
  onPlayerStateChange : function (state) {
    if(state == 1){
      this.play();
      if(this.config.buttons.toggle){       // This seems pretty bad.  Can we not abstract this sort of logic further?
        this.$html.find('.play').removeClass('play').addClass('pause').text('Pause');
      }
    }else if(this.config.repeat && (state == 0)){ // The movie has ended and the config requires the video to repeat
      // Let's just start the movie again 
      this.play();
    }
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

    if (this.config.captionsOn && this.captions) {
      this.setCaptionTimeout();
    }
  },
  pause: function () {
    this.player.pauseVideo();
    this.clearSliderTimeout();

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
  cue: function () { this.player.cueVideoById(this.config.media); },
  toggleCaptions: function () {
    var self = this;
    var $c = this.$html.find('.captions');
    if ($c.hasClass('captions-off')) {
      $c.removeClass('captions-off').addClass('captions-on');
      self.getPreviousCaption();
      self.setCaptionTimeout();
      self.config.captionsOn = true;
    } else {
      $c.removeClass('captions-on').addClass('captions-off');
      self.clearCaptionTimeout();
      self.$html.find('.caption').remove();
      self.config.captionsOn = false;
    }
  }
};
