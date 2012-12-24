describe("MediaPlayerDecorator", function () {
  var player;

  var state = {
    'ended': 0,
    'paused': 2,
    'playing': 1,
    'unstarted': -1
  };

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
  };

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
    player = jasmine.createSpyObj('youtubeAPISpy', [
                         "playVideo", "pauseVideo", "seekTo", "mute",
                         "unMute", "isMuted", "setVolume", "getVolume", "getCurrentTime",
                         "getPlayerState", "getPlayer", "getVideoBytesLoaded",
                         "getVideoBytesTotal", "onPlayerReady", "getDuration",
                         "cueVideoById"
                        ]);
  });

  afterEach(function () {
    cleanUpYoutubeDOM();
  });

  describe("Exposing the Youtube Player", function () {
    var decorator;

    beforeEach(function () {
      decorator = new window.nomensaPlayer.MediaplayerDecorator(player);
    });

    afterEach(function () {
      decorator = null;
    });

    it("should have all of the functions that YoutubePlayer has", function () {
      for (var method in player) {
        if (typeof player[method] === "function") {
          expect(decorator[method]).toBeDefined();
        }
      }
    });

    it("should pass the method calls down to the YoutubePlayer", function () {
      for(var method in player) {
        if (typeof player[method] === "function") {
          decorator[method]();
          expect(player[method]).toHaveBeenCalled();
        }
      }
    });
  });
});
