describe("PlayerManager", function () {
  var manager;

  beforeEach(function () {
    manager = new PlayerManager();
  });

  it("should have PlayerManager defined", function () {
    expect(PlayerManager).toBeDefined();
  });

  it("should not have an unknown player", function () {
    expect(manager.getPlayer(123)).toEqual(null);
  });

  describe("getting and setting a player", function () {
    beforeEach(function () {
      examplePlayer = {
        config: {
          id: 123
        }
      };
    });

    it("should be able to set a player", function () {
      expect(manager.getPlayer(123)).toEqual(null);
      manager.addPlayer(examplePlayer);
      expect(manager.getPlayer(123)).toEqual(examplePlayer);
    });
  });
});
