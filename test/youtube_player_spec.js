describe("Youtube Player", function() {
  var cleanUpYoutubeDOM = function () {
    var apiScripts = document.querySelectorAll("script[src='//www.youtube.com/iframe_api']"),
    wrapper = document.getElementById('wrapper');

    if (apiScripts.length) {
      var scriptsIdx = apiScripts.length,
          documentHead = document.getElementsByTagName('head')[0];

      while (scriptsIdx--) {
        documentHead.removeChild(apiScripts[scriptsIdx]);
      }
    }
    if (wrapper) {
      wrapper.parentNode.removeChild(wrapper);
    }
    window.YT = null;
  },
  defaultConfig = {
    id: 'wrapper',
    url: 'http://www.youtube.com/apiplayer?enablejsapi=1&version=3&playerapiid=',
    media: '8LiQ-bLJaM4',
    repeat: false,
    captions: null,
    captionsOn: true,
    flashWidth: '100%',
    flashHeight: '300px',
    playerStyles: {
      'height': '100%',
      'width': '100%'
    },
    sliderTimeout: 350,
    flashContainer: 'span',
    playerContainer: 'span',
    image: '',
    playerSkip: 10,
    volumeStep: 10,
    buttons: {
      forward: true,
      rewind: true,
      toggle: true
    },
    logoURL: 'http://www.nomensa.com?ref=logo',
    useHtml5: true,
    swfCallback: null
  },
  createWrapperDiv = function () {
    wrapper = document.createElement('div');
    wrapper.id = "wrapper";
    document.body.appendChild(wrapper);
  },
  youtubeAPISpy; 

  describe("Match public mediaplayer public interface", function () {
    var youtube;

    beforeEach(function () {
      youtube = new YoutubePlayer({});
    });

    afterEach(function () {
      youtube = null;

      cleanUpYoutubeDOM();
    });

    it("should follow the same API as mediaplayer()", function () {
      var methods = ["play", "pause", "ffwd", "rewd", "mute", "volup",
                     "voldwn", "getDuration", "getCurrentTime",
                     "getBytesLoaded", "getBytesTotal", "seek", "cue", "init"];

      var counter = methods.length;
      while (counter--) {
        var method = methods[counter];
        expect(youtube[method]).toBeDefined();
        expect(typeof youtube[method]).toBe("function");
      }
    });

    it("should possess the same public properties as mediaplayer()", function() {
      var props = ["config", "is_html5"];

      var counter = props.length;
      while (counter--) {
        var prop = props[counter];
        expect (typeof youtube[prop] !== "undefined").toBe(true);
      }
    });
  });

  describe("Initialising the YoutubePlayer object", function () {
    it("should add a script tag to the document head for the Youtube API", function () {
      var youtube,
          youtubePlayer;

      expect(document.querySelectorAll("script[src='//www.youtube.com/iframe_api']").length).toBe(0);
      youtubePlayer = new YoutubePlayer(defaultConfig);
      youtube = new YoutubeDecorator(youtubePlayer);
      youtube.init();
      expect(document.querySelectorAll("script[src='//www.youtube.com/iframe_api']").length).toBe(1);

      cleanUpYoutubeDOM();
    });

    it("should call the YoutubePlayer.onPlayerReady method", function () {
      var youtube,
          youtubePlayer;

      createWrapperDiv();
      spyOn(YoutubePlayer.prototype, "onPlayerReady");
      youtubePlayer = new YoutubePlayer(defaultConfig);
      youtube = new YoutubeDecorator(youtubePlayer);
      youtube.init();

      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        expect(YoutubePlayer.prototype.onPlayerReady).toHaveBeenCalled();

        cleanUpYoutubeDOM();
      });
    });
  });

  describe("Interacting with videos", function () {
    var youtube;

    // These states are taken directly from the YT API docs.
    // Link: https://developers.google.com/youtube/js_api_reference
    var state = {
      'ended': 0,
      'paused': 2,
      'playing': 1,
      'unstarted': -1
    }

    beforeEach(function () {
      createWrapperDiv();
      spyOn(YoutubePlayer.prototype, "onPlayerReady");
      youtube = new YoutubePlayer(defaultConfig);
      youtubeAPISpy = jasmine.createSpyObj('youtubeAPISpy', [
                           "playVideo", "pauseVideo", "seekTo", "mute",
                           "unMute", "isMuted", "setVolume", "getVolume", "getCurrentTime",
                           "getPlayerState", "getPlayer", "getVideoBytesLoaded",
                           "getVideoBytesTotal", "onPlayerReady", "getDuration",
                           "cueVideoById"
                          ]);
      youtube.player = youtubeAPISpy;
    });

    afterEach(function () {
      youtube = null;
      youtubeAPISpy = {};
    });

    it("should call equivalent method on YT player when getPlayer is called", function () {
      var player = youtube.getPlayer();
      expect(player).toBe(youtubeAPISpy);
      cleanUpYoutubeDOM();
    });

    it("should call playVideo method on YT player when play is called", function () {
      youtube.play();
      expect(youtube.player.playVideo).toHaveBeenCalled();
      cleanUpYoutubeDOM();
    });

    it("should call pauseVideo method on YT player when pause is called", function () {
      youtube.pause();
      expect(youtube.player.pauseVideo).toHaveBeenCalled();
      cleanUpYoutubeDOM();
    });

    it("should call onPlayerStateChange method when a video plays", function () {
      spyOn(youtube, 'onPlayerStateChange');
      youtube.play();
      expect(youtube.onPlayerStateChange).toHaveBeenCalled();
      expect(youtube.onPlayerStateChange.mostRecentCall.args[0]).toEqual(state.playing);
      cleanUpYoutubeDOM();
    });

    it("should call onPlayerStateChange method when a video is paused", function () {
      spyOn(youtube, 'onPlayerStateChange');
      youtube.pause();
      expect(youtube.onPlayerStateChange).toHaveBeenCalled();
      expect(youtube.onPlayerStateChange.mostRecentCall.args[0]).toEqual(state.paused);
      cleanUpYoutubeDOM();
    });

    it("should call eqivalent method on YT player when getCurrentTime is called", function () {
      youtube.getCurrentTime();
      expect(youtube.player.getCurrentTime).toHaveBeenCalled();
      cleanUpYoutubeDOM();
    });

    it("should call seekTo method on YT player when seek is called", function () {
      youtube.seek(10);
      expect(youtube.player.seekTo).toHaveBeenCalled();
      expect(youtube.player.seekTo.mostRecentCall.args[0]).toBe(10);
      cleanUpYoutubeDOM();
    });

    it("should call equivalent method on YT player when mute is called", function () {
      youtube.mute();
      expect(youtube.player.mute).toHaveBeenCalled();
      cleanUpYoutubeDOM();
    });

    it("should call unMute method on YT player when mute is called while muted", function () {
      youtube.player.isMuted = function () { return true; };
      youtube.mute();
      expect(youtube.player.unMute).toHaveBeenCalled();
      cleanUpYoutubeDOM();
    });

    it("should call equivalent method on YT player when getDuration is called", function () {
      youtube.getDuration();
      expect(youtube.player.getDuration).toHaveBeenCalled();
      cleanUpYoutubeDOM();
    });

    it("should call getVideoBytesLoaded method on YT player when getBytesLoaded is called", function () {
      youtube.getBytesLoaded();
      expect(youtube.player.getVideoBytesLoaded).toHaveBeenCalled();
      cleanUpYoutubeDOM();
    });

    it("should call getVideoBytesTotal method on YT player when getBytesTotal is called", function () {
      youtube.getBytesTotal();
      expect(youtube.player.getVideoBytesTotal).toHaveBeenCalled();
      cleanUpYoutubeDOM();
    });

    it("should move the time by +10 seconds when fast-forwarded", function () {
      youtube.player.getCurrentTime = function () { return 50; };

      youtube.ffwd();
      expect(youtube.player.seekTo.mostRecentCall.args[0]).toEqual(60);
      cleanUpYoutubeDOM();
    });

    it("should move the time by -10 seconds when rewound", function () {
      youtube.player.getCurrentTime = function () { return 50; };

      youtube.rewd();
      expect(youtube.player.seekTo.mostRecentCall.args[0]).toEqual(40);
      cleanUpYoutubeDOM();
    });

    it("should move the time by 0 seconds when fast-forwarded from end time", function () {
      youtube.player.getCurrentTime = function () { return 50; };
      youtube.player.getDuration = function () { return 50; };

      youtube.ffwd();
      expect(youtube.player.seekTo.mostRecentCall.args[0]).toEqual(50);
      cleanUpYoutubeDOM();
    });

    it("should move the time by 0 seconds when rewound from start time", function () {
      youtube.player.getCurrentTime = function () { return 0; };

      youtube.rewd();
      expect(youtube.player.seekTo.mostRecentCall.args[0]).toEqual(0);
      cleanUpYoutubeDOM();
    });

    it("should move the volume down by the correct amount", function () {
      youtube.player.getVolume = function () { return 50; };

      youtube.voldwn();
      expect(youtube.player.setVolume).toHaveBeenCalled();
      expect(youtube.player.setVolume.mostRecentCall.args[0]).toEqual(49);
      cleanUpYoutubeDOM();
    });

    it("should move the volume up by the correct amount", function () {
      youtube.player.getVolume = function () { return 50; };

      youtube.volup();
      expect(youtube.player.setVolume).toHaveBeenCalled();
      expect(youtube.player.setVolume.mostRecentCall.args[0]).toEqual(51);
      cleanUpYoutubeDOM();
    });

    it("should not move the volume up if at maximum", function () {
      youtube.player.getVolume = function () { return 100; };

      youtube.volup();
      expect(youtube.player.setVolume).toHaveBeenCalled();
      expect(youtube.player.setVolume.mostRecentCall.args[0]).toEqual(100);
      cleanUpYoutubeDOM();
    });

    it("should not move the volume down if at 0", function () {
      youtube.player.getVolume = function () { return 0; };

      youtube.voldwn();
      expect(youtube.player.setVolume).toHaveBeenCalled();
      expect(youtube.player.setVolume.mostRecentCall.args[0]).toEqual(0);
      cleanUpYoutubeDOM();
    });

    it("should call the cueVideoById method on YT player when cue is called", function () {
      youtube.cue();
      expect(youtube.player.cueVideoById).toHaveBeenCalled();
      expect(youtube.player.cueVideoById.mostRecentCall.args[0]).toEqual(youtube.config.media);
    });
  });
});
