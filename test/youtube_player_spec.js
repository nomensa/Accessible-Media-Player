describe("Youtube Player", function() {
  var cleanUpYoutubeDOM = function () {
    var apiScript = document.querySelectorAll("script[src='//www.youtube.com/iframe_api']")[0],
    wrapper = document.getElementById('wrapper');

    if (apiScript) {
      document.getElementsByTagName('head')[0].removeChild(apiScript);
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
  };

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
                     "getBytesLoaded", "getBytesTotal", "seek", "cue"];

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

  it("should add a script tag to the document head for the Youtube API", function () {
    var youtube;

    expect(document.querySelectorAll("script[src='//www.youtube.com/iframe_api']").length).toBe(0);
    youtube = new YoutubePlayer({});
    expect(document.querySelectorAll("script[src='//www.youtube.com/iframe_api']").length).toBe(1);

    cleanUpYoutubeDOM();
  });

  it("should call the YoutubePlayer.onPlayerReady method", function () {
    var youtube;

    createWrapperDiv();
    spyOn(YoutubePlayer.prototype, "onPlayerReady");
    youtube = new YoutubePlayer(defaultConfig);

    waitsFor(function() {
      return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
    }, "onPlayerReady function called", 10e3);

    runs(function () {
      expect(YoutubePlayer.prototype.onPlayerReady).toHaveBeenCalled();

      cleanUpYoutubeDOM();
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
    });

    afterEach(function () {
      youtube = null;
    });

    it("should return the YT player when getPlayer is called", function () {
      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        expect(youtube.getPlayer()).toBe(youtube.player);
        cleanUpYoutubeDOM();
      });
    });

    it("should change the YT player state to 'playing'", function () {
      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        expect(YoutubePlayer.prototype.onPlayerReady).toHaveBeenCalled();
        expect(youtube.getPlayer().getPlayerState()).toBe(state.unstarted);

        youtube.play();

        waitsFor(function () {
          return youtube.getPlayer().getPlayerState() > -1;
        }, "the player state has changed after registering the event change", 10e3);

        runs(function () {
          expect(youtube.getPlayer().getPlayerState()).toBe(state.playing);
          youtube.pause();
          cleanUpYoutubeDOM();
        });
      });
    });

    it("should change the YT player state to 'paused'", function () {
      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        expect(youtube.getPlayer().getPlayerState()).toBe(state.unstarted);
        youtube.play();

        waitsFor(function () {
          return youtube.getPlayer().getPlayerState() > -1;
        }, "the player state has changed after registering the event change", 10e3);

        runs(function () {
          expect(youtube.getPlayer().getPlayerState()).toBe(state.playing);
          youtube.pause();

          waitsFor(function () {
            return youtube.getPlayer().getPlayerState() !== state.playing;
          }, "the player state has changed away from playing", 10e3);

          runs(function () {
            expect(youtube.getPlayer().getPlayerState()).toBe(state.paused);
            cleanUpYoutubeDOM();
          });
        });
      });
    });

    it("should return the correct time", function () {
      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        var time,
            youtubeAPIObj = youtube.getPlayer();

        spyOn(youtubeAPIObj, "getCurrentTime").andCallThrough();
        time = youtube.getCurrentTime();
        expect(youtubeAPIObj.getCurrentTime).toHaveBeenCalled();
        expect(time).toBe(0);
        cleanUpYoutubeDOM();
      });
    });

    it("should seek to the required point in time", function () {
      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        expect(youtube.getCurrentTime()).toBe(0);

        youtube.seek(10);

        waitsFor(function () {
          return youtube.getPlayer().getPlayerState() == state.playing;
        }, "the player starts to play", 10e3);

        runs(function () {
          expect(youtube.getCurrentTime()).toBe(10);
          youtube.pause();
          cleanUpYoutubeDOM();
        });
      });
    });

    it("should change the YT player state to 'muted'", function () {
      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        var youtubeAPIObj = youtube.getPlayer();
        spyOn(youtubeAPIObj, 'mute').andCallThrough();
        expect(youtubeAPIObj.mute).not.toHaveBeenCalled();

        youtube.mute();
        expect(youtubeAPIObj.mute).toHaveBeenCalled();
        cleanUpYoutubeDOM();
      });
    });

    it("should change the YT player state to 'unmuted' when already set to 'mute'", function () {
      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        var youtubeAPIObj = youtube.getPlayer();
        spyOn(youtubeAPIObj, 'unMute').andCallThrough();
        expect(youtubeAPIObj.unMute).not.toHaveBeenCalled();

        youtube.mute();
        waitsFor(function () {
          return youtubeAPIObj.isMuted();
        }, "mute to be called", 10e3);

        runs(function () {
          youtube.mute();
          expect(youtubeAPIObj.unMute).toHaveBeenCalled();
          cleanUpYoutubeDOM();
        });
      });
    });

    it("should move the time by +10 seconds when fast-forwarded", function () {
      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        spyOn(youtube, 'seek');

        expect(youtube.getCurrentTime()).toBe(0);
        youtube.ffwd();
        expect(youtube.seek.mostRecentCall.args[0]).toEqual(10);
        cleanUpYoutubeDOM();
      });
    });

    it("should move the time by -10 seconds when rewound", function () {
      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        spyOn(youtube, 'seek').andCallThrough();
        expect(youtube.getCurrentTime()).toBe(0);

        youtube.seek(10);

        waitsFor(function () {
          return youtube.getPlayer().getPlayerState() == state.playing;
        }, "the player starts to play", 10e3);

        runs(function () {
          expect(youtube.getCurrentTime()).toBe(10);
          youtube.rewd();
          expect(youtube.seek.mostRecentCall.args[0]).toEqual(0);
          cleanUpYoutubeDOM();
        });
      });
    });

    it("should move the volume down by the correct amount", function () {
      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        var youtubeAPIObj = youtube.getPlayer();
        spyOn(youtubeAPIObj, "setVolume");
        expect(youtubeAPIObj.getVolume()).toBe(100);

        youtube.voldwn();
        expect(youtubeAPIObj.setVolume).toHaveBeenCalled();
        expect(youtubeAPIObj.setVolume.mostRecentCall.args[0]).toEqual(99);
        cleanUpYoutubeDOM();
      });
    });
  });
});
