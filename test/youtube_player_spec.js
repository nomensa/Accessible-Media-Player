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

  it("should call the YoutubePlayer.onready method", function () {
    var youtube;

    createWrapperDiv();
    spyOn(YoutubePlayer.prototype, "onready");
    youtube = new YoutubePlayer(defaultConfig);

    waitsFor(function(){
      return YoutubePlayer.prototype.onready.callCount > 0;
    }, "onready function called", 10e5);
    
    runs(function () {
      expect(YoutubePlayer.prototype.onready).toHaveBeenCalled();

      cleanUpYoutubeDOM();
    });
  });
});
