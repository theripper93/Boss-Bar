class BossBar {
  constructor() {
    this.actor;
    this.bossBarGraphics = new PIXI.Container();
  }

  static create(actor, render = true) {
    let instance = new BossBar();
    instance.actor = actor;
    if (render) instance.render();
    return instance;
  }

  static draw(maxW, h) {
    const hpPercent = this.currentHp / this.maxHp;
    let c = this.bossBarGraphics;
    c.name = "bossBarGraphics";
    let g = new PIXI.Graphics();
    g.beginFill()
      .drawRect(0, 0, maxW, h)
      .endFill()
      .beginFill()
      .drawRect(0, 0, maxW * hpPercent, h)
      .endFill();
    c.addChild(g);
    canvas.controls.debug.addChild(c);
  }

  set visible(visible) {
    this.bossBarGraphics.visible = visible;
  }

  static update() {}

  static get currentHp() {
    return Object.byString(
      this.actor,
      game.settings.register("bossbar", "currentHpPath")
    );
  }

  static get maxHp() {
    return Object.byString(
      this.actor,
      game.settings.register("bossbar", "maxHpPath")
    );
  }
}
