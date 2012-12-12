describe("Youtube Player", function() {
  var cleanUpYoutubeDOM = function () {
    var apiScript = document.querySelectorAll("script[src='//www.youtube.com/iframe_api']")[0];
    document.getElementsByTagName('head')[0].removeChild(apiScript);
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

    youtube = new YoutubePlayer({});
    spyOn(youtube, 'onready');
    expect(youtube.onready).toHaveBeenCalled();
  });
});
