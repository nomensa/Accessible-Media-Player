describe("YoutubeDecorator", function () {
  var player;

  var state = {
    'ended': 0,
    'paused': 2,
    'playing': 1,
    'unstarted': -1
  }

  var defaultConfig = {
    id: 'wrapper-decorator',
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
  }

  var cleanUpYoutubeDOM = function () {
    var apiScript = document.querySelectorAll("script[src='//www.youtube.com/iframe_api']")[0],
    wrapperDiv = document.getElementById(defaultConfig.id);

    if (apiScript) {
      document.getElementsByTagName('head')[0].removeChild(apiScript);
    }

    if (wrapperDiv) {
      wrapperDiv.parentNode.removeChild(wrapperDiv);
    }

    window.YT = null;
  }

  var createWrapperDiv = function () {
    wrapperDiv = document.createElement('div');
    wrapperDiv.id = defaultConfig.id;
    document.body.appendChild(wrapperDiv);
  };

  beforeEach(function () {
    createWrapperDiv();
    spyOn(YoutubePlayer.prototype, "onPlayerReady");
    player = new YoutubePlayer(defaultConfig);
  });

  afterEach(function () {
    waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
    }, "onPlayerReady function called", 10e3);

    runs(function () {
      cleanUpYoutubeDOM();
    });

    player = null;
  });

  describe("Exposing the Youtube Player", function () {
    var decorator;

    beforeEach(function () {
      decorator = new YoutubeDecorator(player);
    });

    afterEach(function () {
      decorator = null;
    });

    it("should have all of the functions that YoutubePlayer has", function () {
      for (var method in player) {
        if (typeof method === "function") {
          expect(decorator[method]).toBeDefined();
          expect(decorator[method]).toBe(player[method]);
        }
      }
    });

    // Disabled as this test block doesn't work as expected.
    xit("should pass the method calls down to the YoutubePlayer", function () {
      waitsFor(function() {
        return YoutubePlayer.prototype.onPlayerReady.callCount > 0;
      }, "onPlayerReady function called", 10e3);

      runs(function () {
        expect(player.getPlayer().getPlayerState()).toBe(state.unstarted);
        decorator.play();

        waitsFor(function () {
          return player.getPlayer().getPlayerState() === state.playing;
        }, "the player is playing", 10e3);

        runs(function () {
          expect(player.getPlayer().getPlayerState()).toBe(state.playing);
          decorator.pause();

          waitsFor(function () {
            return player.getPlayer().getPlayerState() === state.paused;
          }, "the player is paused", 10e3);

          runs(function () {
            cleanUpYoutubeDOM();
          });
        });
      });
    });
  });
});
