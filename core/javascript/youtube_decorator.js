window.YoutubeDecorator = function (youtubePlayer) {
  var player = youtubePlayer;

  /**
   * The current 'mediaplayer' object requires all of the functions
   * to be accessible from a single point. This is a first stab at
   * unifying our interfaces to one place. The only reason this is
   * being done is so that we don't end up heavily refactoring the
   * library.
   */
  for (var method in player) {
    if (typeof player[method] === "function") {
      this[method] = function() {
        player[method].apply(player, arguments);
      }
    }
  }
};
