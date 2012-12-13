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

    spyOn(window, "YoutubePlayer");

    holder = $("<span></span>");
    holder.append(videoLink);
    $("#wrapper").append(holder);

    // Initialise the player.
    holder.player({
      id: 'youtube1',
      media: youtubeId,
      url: videoLink.href
    });

    expect(window.YoutubePlayer).not.toHaveBeenCalled();

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

      spyOn(window, "YoutubePlayer");
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

        // Initialise the player.
        holder.player({
          id: 'youtube1',
          media: youtubeId
        });

        expectedConfig.id = 'youtube1';
        expectedConfig.media = youtubeId;
      });

      afterEach(function () {
        holder.remove();
        wrapper.appendChild(videoLink);
      });

      it("should have a span holding the video link", function () {
        expect(document.querySelectorAll("#wrapper > span").length).toBe(1);
      });

      it("should call the YoutubePlayer constructor", function () {
        expect(window.YoutubePlayer).toHaveBeenCalled();
      });

      describe("Call the YoutubePlayer constructor", function () {
        it("should recieve a single argument", function () {
          expect(window.YoutubePlayer.calls[0].args[0]).toBeDefined();
        });

        it("should recieve an object", function () {
          expect(typeof window.YoutubePlayer.calls[0].args[0] === "object").toBe(true);
        });

        it("should recieve the default config", function () {
          expect(window.YoutubePlayer.calls[0].args[0]).toEqual(expectedConfig);
        });
      });
    });
  });
});
