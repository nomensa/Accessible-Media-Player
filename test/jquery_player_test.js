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
    expect(document.querySelectorAll("#wrapper").length).toEqual(1);
  });

  describe("Youtube videos", function () {
    var videoLink, youtubeId;

    beforeEach(function () {
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
      expect(document.querySelectorAll("#wrapper a[href*='http://www.youtube.com/watch']").length).toEqual(1);
    });

    describe("create a jquery player", function () {
      var holder;

      beforeEach(function () {
        holder = $("<span></span>");
        holder.append(videoLink);
        $("#wrapper").append(holder);

        // Initialise the player.
        holder.player({
          id: 'youtube1',
          media: youtubeId
        });
      });

      afterEach(function () {
        holder.remove();
        wrapper.appendChild(videoLink);
      });

      it("should have a span holding the video link", function () {
        expect(document.querySelectorAll("#wrapper > span").length).toEqual(1);
      });

      it("should call the YoutubePlayer constructor", function () {
        expect(window.YoutubePlayer).toHaveBeenCalled();
      });

      it("should call the Youtube constructor with a single argument", function () {
        expect(window.YoutubePlayer.calls[0].args[0]).toBeDefined();
      });

      it("should call the Youtube constructor with an object", function () {
        expect(typeof window.YoutubePlayer.calls[0].args[0] === "object").toBe(true);
      });
    });
  });
});
