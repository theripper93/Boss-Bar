class BossBar {
  constructor() {
    this.actor;
    this.bgPath = game.settings.get("bossbar", "backgroundPath");
    this.fgPath = game.settings.get("bossbar", "foregroundPath");
  }

  static create(token, render = true) {
    this.clear()
    let instance = new BossBar();
    instance.actor = token.actor;
    if (render) instance.draw(game.settings.get("bossbar", "barHeight"));
    canvas.scene.setFlag("bossbar","bossBarActive",token.id)
    return instance;
  }

  draw(h) {
    $("#navigation").append(
      `<div style="flex-basis: 100%;height: 0;"></div><div id ="bossBar" class="bossBar">
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
    Hooks.on("updateActor", (actor, updates) => {
      if (
        actor.id == this.actor.id &&
        Object.byString(
          updates,
          game.settings.get("bossbar", "currentHpPath")
        )
      ) {
        bossBar.update();
      }
    });
  }

  update() {
    document
      .getElementById("bossBarCurrent")
      .setAttribute("style", `width:${this.hpPercent}%;`);
  }

  static clear(){
    $("body").find('div[id="bossBar"]').remove();
  }

  static remove(){
    canvas.scene.unsetFlag("bossbar","bossBarActive").then(()=>{BossBar.clear()})
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
