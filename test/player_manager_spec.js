window.NOMENSA.player = window.NOMENSA.player || {};
describe("window.NOMENSA.player.PlayerManager", function () {
  var manager;

  beforeEach(function () {
    manager = new window.NOMENSA.player.PlayerManager();
  });

  it("should have window.NOMENSA.player.PlayerManager defined", function () {
    expect(window.NOMENSA.player.PlayerManager).toBeDefined();
  });

  it("should not have an unknown player", function () {
    expect(manager.getPlayer(123)).toEqual(null);
  });

  describe("Getting and setting a player", function () {
    beforeEach(function () {
      examplePlayer = {
        config: {
          id: 123
        }
      };
    });

    afterEach(function () {
      examplePlayer = null;
    });

    it("should be able to set a player", function () {
      expect(manager.getPlayer(123)).toEqual(null);
      manager.addPlayer(examplePlayer);
      expect(manager.getPlayer(123)).toEqual(examplePlayer);
    });

    it("should be able to map a function", function () {
      var total = 0,
      examplePlayer2 = {
        config: {
          id: 1
        }
      };

      manager.addPlayer(examplePlayer);
      manager.addPlayer(examplePlayer2);
      manager.map(function (player) {
        total += player.config.id;
      })
      expect(total).toEqual(124);
    });
  });
});
