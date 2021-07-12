class BossBar {
  constructor() {
    this.actor;
    this.bgPath = game.settings.get("bossbar", "backgroundPath");
    this.fgPath = game.settings.get("bossbar", "foregroundPath");
  }

  static create(actor, render = true) {
    let instance = new BossBar();
    instance.actor = actor;
    if (render) instance.draw(1000, 50);
    return instance;
  }

  draw(maxW, h) {
    $("body").append(
      `<div id ="bossBar" class="bossBar">
        <a class="bossBarName">${this.name}</a>
        <div id ="bossBarBar" style="z-index: 1000;">
          <img id="bossBarMax" class="bossBarMax" src="${this.bgPath}" alt="test" width="100%" height="${h}">
          <img id="bossBarCurrent" class="bossBarCurrent" src="${this.fgPath}" alt="test" width="100%" height="${h}">
        </div>
      </div>
      `
    );
    this.update();
    const bossBar = this;
    Hooks.on("updateToken", (token, updates) => {
      if (
        token.actor.id == this.actor.id &&
        updates.actorData &&
        Object.byString(
          updates.actorData,
          game.settings.get("bossbar", "currentHpPath")
        )
      ) {
        bossBar.update();
      }
    });
  }

  set visible(visible) {
    this.bossBarGraphics.visible = visible;
  }

  update() {
    document
      .getElementById("bossBarCurrent")
      .setAttribute("style", `width:${this.hpPercent}%;`);
  }

  get currentHp() {
    return Object.byString(
      this.actor.data,
      game.settings.get("bossbar", "currentHpPath")
    );
  }

  get maxHp() {
    return Object.byString(
      this.actor.data,
      game.settings.get("bossbar", "maxHpPath")
    );
  }

  get hpPercent() {
    return Math.round((100 * this.currentHp) / this.maxHp);
  }

  get hpPercentAsString() {
    return String(this.hpPercent);
  }

  get name() {
    return this.actor.data.name;
  }
}
