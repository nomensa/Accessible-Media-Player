window.NOMENSA = window.NOMENSA || {};
window.NOMENSA.player = window.NOMENSA.player || {};
window.NOMENSA.player.YoutubePlayer = function (config) {
  this.config = config;
  this.config.playerVars = {
    controls: 0,
    showinfo: 0,
    origin: window.location.protocol + '//' + window.location.hostname,
    rel: 0
  };
};
/*
 * Static Boolean property to mark if YouTube API is loaded
 * Only relevant to Iframe API
 *---------------------------------------------------------*/
window.NOMENSA.player.YoutubePlayer.apiLoaded = false;

window.NOMENSA.player.YoutubePlayer.prototype = {
  getYTOptions : function () {
    var inst = this,
    options = {
      height: this.config.flashHeight,
      width: this.config.flashWidth,
      videoId: this.config.media,
      events: {
        'onReady': function (event) {
          // loaded player's id should match that in config, as with mediaplayer
          inst.$html.find("iframe").attr({"id" : inst.config.id, "role" : "presentation"});

          inst.onPlayerReady(event);
        },
        'onStateChange': function (event) {
          inst.onPlayerStateChange(event.data);
        }
      }
    };

    options.playerVars = this.config.playerVars;

    if (this.config.repeat) {
      options.playerVars.playlist = this.config.media;
    }

    return options;
  },
  /*
   * Initialisation function to be called when instance has all required methods (post decoration)
   * The final init function is decided by an initial test for window.postMessage.
   */
  init: function () {
    if (typeof window.postMessage !== 'undefined') { // iFrame requires window.postMessage
      return function ($holder) {
        var tag = document.createElement('script'),
        firstScriptTag = document.getElementsByTagName('script')[0],
        inst = this;

        this.$html = this.assembleHTML();

        if (this.config.captions) {
          this.getCaptions();
        }
        $holder.html(this.$html);

        // Add the player to the window.NOMENSA.player.PlayerDaemon
        window.NOMENSA.player.PlayerDaemon.addPlayer(this);

        // if API has not loaded, use playerDaemon to store players
        if (!window.NOMENSA.player.YoutubePlayer.apiLoaded) {
          // API callback will initiate all stored players
          if (typeof window.onYouTubeIframeAPIReady === 'undefined') {
            window.onYouTubeIframeAPIReady = function () {
              window.NOMENSA.player.PlayerDaemon.map(function (player) {
                if (typeof player.getYTOptions !== 'undefined') {
                  player.player = new YT.Player('player-' + player.config.id, player.getYTOptions());
                }
              });
              window.NOMENSA.player.YoutubePlayer.apiLoaded = true;
            };
            tag.src = "//www.youtube.com/iframe_api";
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          }
        } else {
          this.player = YT.Player('player-' + player.config.id, getOptions(player));
        }
      };
    } else {
      return function ($holder) {
        var inst = this;

        this.$html = this.assembleHTML();

        if (this.config.captions) {
          this.getCaptions();
        }

        $holder.html(this.$html);

        // Add the player to the window.NOMENSA.player.PlayerDaemon
        window.NOMENSA.player.PlayerDaemon.addPlayer(this);
        window.NOMENSA.player.stateHandlers[this.config.id] = function (state) {
          var player = window.NOMENSA.player.PlayerDaemon.getPlayer(inst.config.id);
          player.onPlayerStateChange(state);
        };
        /*
         * Global function called by YouTube when player is ready
         * We use this to get a reference to the player manager.  We can retrieve
         * The player instance from the window.NOMENSA.player.PlayerDaemon using the playerId
         *
         * @param playerId {string}: The id of the player object.  This is used to
         * retrieve the correct player instance from the window.NOMENSA.player.PlayerDaemon
         *---------------------------------------------------------------------------*/
        window.onYouTubePlayerReady = function (playerId) {
          var player = window.NOMENSA.player.PlayerDaemon.getPlayer(playerId);        // This is our initial object created by the mediaplayer plugin
          var myplayer = document.getElementById(player.config.id);     // This is a reference to the DOM element that we use as an interface through which to execute player commands
          player.player = myplayer;        // Pass the controller to our generated player object
          player.cue();
          /*
           * Add our player specific event listeners
           * This one listens for the onStateChange event and calls the
           * playerState function at the bottom of this document
           *---------------------------------------------------------*/
          player.getPlayer().addEventListener("onStateChange", "window.NOMENSA.player.stateHandlers." + inst.config.id);
          player.onPlayerReady();
        };
      };
    }
  }(),
  state: {
    "ended": 0,
    "playing": 1,
    "paused": 2,
    "unstarted":-1
  },
  onPlayerReady: (function () {
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
  onPlayerStateChange: function (state) {
    if (state == 1) {
      this.play();

      // This seems pretty bad. Can we not abstract this sort of logic further?
      if (this.config.buttons.toggle) {
        this.$html.find('.play').removeClass('play').addClass('pause').text('Pause');
      }
    } else if (this.config.repeat && (state == 0)) { // The movie has ended and the config requires the video to repeat
      // Let's just start the movie again
      this.play();
    }
  },
  /*
   * Get an object containing some flashvars
   * @return {obj}: A map of flashvariables
   *---------------------------------------------------------*/
  getFlashVars: function() {
    var flashvars = {
      controlbar: 'none',
      file: this.config.media
    };
    // Add extra properties to flashvars if they exist in the config
    if (this.config.image != '') { flashvars.image = this.config.image; }
    if (this.config.repeat) { flashvars.repeat = this.config.repeat; }
    return flashvars;
  },
  /*
   * Get an object containing some parameters for the flash movie
   * @return {obj}: A map of flash parameters
   *---------------------------------------------------------*/
  getFlashParams: function() {
    return {
      allowScriptAccess: "always",
      wmode: 'transparent'
    };
  },
  /*
   * Method for generating the flash component
   * for the media player
   * @return {obj}: A jQuery wrapped set
   *---------------------------------------------------------*/
  generateFlashPlayer: function($playerContainer) {
    var $self = this;
    /* Get our flash vars */
    var flashvars = this.getFlashVars();
    /* Create some parameters for the flash */
    var params = this.getFlashParams();
    /* Create some attributes for the flash */
    var atts = {
      id: this.config.id,
      name: this.config.id
    };
    /* Create our flash container with default content telling
     * the user to download flash if it is not installed
     */
    var $container = $('<'+this.config.flashContainer+' />')
      .attr('id', 'player-' + this.config.id)
      .addClass('flashReplace')
      .html('This content requires Macromedia Flash Player. You can <a href="http://get.adobe.com/flashplayer/">install or upgrade the Adobe Flash Player here</a>.');

    // Create our video container
    var $videoContainer = $('<span />').addClass('video');

    /* Get the url for the player */
    var url = this.getURL();
    /********************************************************************************************************
     *  set a timeout of 0, which seems to be enough to give IE time to update its
     *  DOM. Strangest manifested bug on the planet. Details on how it manifested itself
     *  in a project are below:
     *  - IE breaks flash loading if the img src is external (ie, begins with http://+ any single character)*
     *      AND
     *  - If the src is internal AND the content has an <li></li> in a <ul>
     ********************************************************************************************************/
    // This is where we embed our swf using swfobject
    setTimeout(function() {
      swfobject.embedSWF(url,
                         $container.attr('id'),
                         $self.config.flashWidth, $self.config.flashHeight,
                         "9.0.115", null, flashvars, params, atts, $self.config.swfCallback);

      // Dirty hack to remove element from tab index for versions of firefox that trap focus in flash
      if ($.browser.mozilla && (parseInt($.browser.version, 10) >= 2)) {
        $self.$html.find('object').attr("tabindex", '-1');
      }
    }, 0);
    // Create our entire player container
    $playerContainer.append($videoContainer.append($container));

    return $playerContainer;
  },
  generateVideoPlayer: function($playerContainer) {
    if (typeof window.postMessage === 'undefined') {
      return this.generateFlashPlayer($playerContainer);
    } else {
      var $video = $('<' + this.config.flashContainer + ' />')
        .attr('id', 'player-' + this.config.id);

      // Create our video container
      var $videoContainer = $('<span />').addClass('video');

      // Create our entire player container
      $playerContainer.append($videoContainer.append($video));

      return $playerContainer;
    }
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
    var vol = this.player.getVolume();

    if (vol >= 100) {
      vol = 100;
    } else {
      vol = vol + this.config.volumeStep;
    }

    this.player.setVolume(vol);
    this.updateVolume(vol);
  },
  voldwn: function () {
    var vol = this.player.getVolume();

    if (vol <= 0) {
      vol = 0;
    } else {
      vol = vol - this.config.volumeStep;
    }

    this.player.setVolume(vol);
    this.updateVolume(vol);
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
  cue: function () {
    this.player.cueVideoById(this.config.media);
  },
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
