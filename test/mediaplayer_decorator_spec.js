describe("MediaPlayerDecorator", function () {
  var player,
  decorator;

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

  var sharedMethods = [ "generatePlayerContainer", "assembleHTML", "getURL", "createButton",
                        "getFuncControls", "getVolControls", "getSliderBar", "getSlider",
                        "setSliderTimeout", "clearSliderTimeout", "updateSlider",
                        "updateLoaderBar", "formatTime", "updateTime", "updateVolume",
                        "getCaptions", "toggleCaptions", "syncCaptions", "insertCaption",
                        "getPreviousCaption", "destroyPlayerInstance", "setCaptionTimeout",
                        "clearCaptionTimeout" ];

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
    player = jasmine.createSpyObj('player', ["play", "pause", "ffwd", "rewd", "mute",
                                             "volup", "voldwn", "getDuration", "getCurrentTime",
                                             "getBytesLoaded", "getBytesTotal", "seek", "cue", "init"]),
    decorator = new window.NOMENSA.player.MediaplayerDecorator(player);
  });

  afterEach(function () {
    var decorator = null;

    cleanUpYoutubeDOM();
  });

  it("should have all the shared functions", function () {
    var method;

    for (var idx = 0; idx < sharedMethods.length; idx++) {
      method = sharedMethods[idx];
      expect(decorator[method]).toBeDefined();
    }
  });

  describe("Exposing the Youtube Player", function () {
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
