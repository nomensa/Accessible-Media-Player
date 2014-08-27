describe("jquery.player tests (integration)", function () {
  var wrapper;

  beforeEach(function () {
    wrapper = document.createElement("div");
    wrapper.id = "wrapper";
    document.body.appendChild(wrapper);
  });

  afterEach(function () {
    wrapper.parentNode.removeChild(wrapper);
  });

  it("should have a #wrapper div to hold our HTML fixtures", function () {
    expect(document.querySelectorAll("#wrapper").length).toBe(1);
  });

  it("should not call the YoutubePlayer constructor when using Vimeo", function () {
    var videoLink, youtubeId;

    videoLink = document.createElement("a");
    videoLink.href = "http://vimeo.com/36579366";
    youtubeId = videoLink.href.split("=")[1];
    wrapper.appendChild(videoLink);
    spyOn(window.NOMENSA.player, "YoutubePlayer");
    holder = $("<span></span>");
    holder.append(videoLink);
    $("#wrapper").append(holder);

    // Initialise the player.
    holder.player({
      id: 'youtube1',
      media: youtubeId,
      url: videoLink.href
    });

    expect(window.NOMENSA.player.YoutubePlayer).not.toHaveBeenCalled();
    holder.remove();
    wrapper.appendChild(videoLink);
  });

  describe("Youtube videos", function () {
    var videoLink, youtubeId;

    beforeEach(function () {
      defaultConfig = {
        id: 'media_player',
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

      videoLink = document.createElement("a");
      videoLink.href = "http://www.youtube.com/watch?v=qySFp3qnVmM";
      wrapper.appendChild(videoLink);
      youtubeId = videoLink.href.split("=")[1];
    });

    afterEach(function () {
      videoLink.parentNode.removeChild(videoLink);
    });

    it("should have a single youtube link on the page", function () {
      expect(document.querySelectorAll("#wrapper a[href*='http://www.youtube.com/watch']").length).toBe(1);
    });

    describe("Create a Youtube Player", function () {
      var holder;

      beforeEach(function () {
        expectedConfig = defaultConfig;
        holder = $("<span></span>");
        holder.append(videoLink);
        $("#wrapper").append(holder);
        expectedConfig.id = 'youtube1';
        expectedConfig.media = youtubeId;
        expectedConfig.url = 'http://www.youtube.com/watch?v=0yIniSJIego';
      });

      afterEach(function () {
        holder.remove();
        wrapper.appendChild(videoLink);
      });

      it("should have a span holding the video link", function () {
        expect(document.querySelectorAll("#wrapper > span").length).toBe(1);
      });

      describe("Call the YoutubePlayer constructor", function () {
        beforeEach(function () {
          spyOn(window.NOMENSA.player, "YoutubePlayer").andCallFake(function () {
            // methods do not need to be spys so just stub
            return {
              init : function () {},
              onPlayerReady : function () {},
              onPlayerStateChange : function () {}
            };
          });

          // Initialise the player.
          holder.player({
            id: 'youtube1',
            media: youtubeId,
            url: 'http://www.youtube.com/watch?v=0yIniSJIego'
          });
        });

        it("should call the constructor", function () {
          expect(window.NOMENSA.player.YoutubePlayer).toHaveBeenCalled();
        });

        it("should recieve a single argument", function () {
          expect(window.NOMENSA.player.YoutubePlayer.calls[0].args[0]).toBeDefined();
        });

        it("should recieve an object", function () {
          expect(typeof window.NOMENSA.player.YoutubePlayer.calls[0].args[0] === "object").toBe(true);
        });

        it("should recieve the default config", function () {
          expect(window.NOMENSA.player.YoutubePlayer.calls[0].args[0]).toEqual(expectedConfig);
        });
      });

      it("should call the MediaplayerDecorator constructor", function () {
        spyOn(window.NOMENSA.player, "MediaplayerDecorator").andCallFake(function () {
          // methods do not need to be spys so just stub
          return {
            init : function () {},
            onPlayerReady : function () {},
            onPlayerStateChange : function () {}
          }
        });

        // Initialise the player.
        holder.player({
          id: 'youtube1',
          media: youtubeId,
          url: 'http://www.youtube.com/watch?v=0yIniSJIego'
        });
        expect(window.NOMENSA.player.MediaplayerDecorator).toHaveBeenCalled();
      });

      it("should call the MediaplayerDecorator constructor with an instance of YoutubePlayer", function () {
        var config = defaultConfig,
        youTubePlayerCopy;

        spyOn(window.NOMENSA.player, "MediaplayerDecorator").andCallFake(function () {
          // methods do not need to be spys so just stub
          return {
            init : function () {},
            onPlayerReady : function () {},
            onPlayerStateChange : function () {}
          };
        });

        // Initialise the player.
        holder.player({
          id: 'youtube1',
          media: youtubeId,
          url: 'http://www.youtube.com/watch?v=0yIniSJIego'
        });

        config.id = 'youtube1';
        config.media = youtubeId;
        youTubePlayerCopy = new window.NOMENSA.player.YoutubePlayer(config);
        expect(window.NOMENSA.player.MediaplayerDecorator.mostRecentCall.args[0]).toEqual(youTubePlayerCopy);
      });

      it("should call the init method of the returned instance", function () {
        var spyInst = jasmine.createSpyObj("spyInst", ["init", "onPlayerReady", "onPlayerChange"]);

        spyOn(window.NOMENSA.player, "MediaplayerDecorator").andCallFake(function () {
          return spyInst;
        });

        // Initialise the player.
        holder.player({
          id: 'youtube1',
          media: youtubeId,
          url: 'http://www.youtube.com/watch?v=0yIniSJIego'
        });

        expect(spyInst.init).toHaveBeenCalled();
      });
    });
  });
});
