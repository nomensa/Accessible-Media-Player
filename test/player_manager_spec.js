window.nomensaPlayer = window.nomensaPlayer || {};
describe("window.nomensaPlayer.PlayerManager", function () {
  var manager;

  beforeEach(function () {
    manager = new window.nomensaPlayer.PlayerManager();
  });

  it("should have window.nomensaPlayer.PlayerManager defined", function () {
    expect(window.nomensaPlayer.PlayerManager).toBeDefined();
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
