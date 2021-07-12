class BossBar {
  constructor() {
    this.actor;
    this.token;
    this.bgPath = game.settings.get("bossbar", "backgroundPath");
    this.fgPath = game.settings.get("bossbar", "foregroundPath");
    this.textSize = game.settings.get("bossbar", "textSize")
  }

  static async create(token,render = true) {
    let instance = new BossBar();
    instance.actor = token.actor;
    instance.token = token
    let bgFlag = token.document.getFlag("bossbar", "bgTex")
    let fgFlag = token.document.getFlag("bossbar", "fgTex")
    if(bgFlag) instance.bgPath = bgFlag
    if(fgFlag) instance.fgPath = fgFlag
    this.addBossBar(instance)
    if (render) instance.draw(game.settings.get("bossbar", "barHeight"));
    if (game.user.isGM){
      let oldBars = canvas.scene.getFlag("bossbar", "bossBarActive")
      if(Array.isArray(oldBars)){oldBars.push(token.id)}else{oldBars=[token.id]}
      await canvas.scene.setFlag("bossbar", "bossBarActive", oldBars);
      if(game.settings.get("bossbar", "cameraPan"))BossBar.panCamera(token)
    }
    this.hookId = Hooks.on("updateActor", (actor, updates) => {
      if (
        actor.id == instance.actor.id &&
        Object.byString(updates, game.settings.get("bossbar", "currentHpPath"))
      ) {
        instance.update();
      }
    });
    return instance;
  }

  draw(h) {
    if($("body").find(`div[id="bossBar-${this.id}"]`).length > 0) return
    $("#navigation").append(
      `<div style="flex-basis: 100%;height: 0px;" id ="bossBarSpacer-${this.id}"></div><div id ="bossBar-${this.id}" class="bossBar">
        <a class="bossBarName" style="font-size: ${this.textSize}px;">${this.name}</a>
        <div id ="bossBarBar-${this.id}" style="z-index: 1000;">
          <img id="bossBarMax-${this.id}" class="bossBarMax" src="${this.bgPath}" alt="test" width="100%" height="${h}">
          <img id="bossBarCurrent-${this.id}" class="bossBarCurrent" src="${this.fgPath}" alt="test" width="100%" height="${h}">
        </div>
      </div>
      <div style="flex-basis: 100%;height: ${this.textSize+3}px;" id ="bossBarSpacer-${this.id}"></div>
      `
    );
    this.update();
  }

  update() {
    document
      .getElementById(`bossBarCurrent-${this.id}`)
      .setAttribute("style", `width:${this.hpPercent}%;`);
  }

  clear() {
    $("body").find(`div[id="bossBar-${this.id}"]`).remove();
  }

  static clearAll(){
    if(!canvas.scene._bossBars) return
    for(let bar of Object.entries(canvas.scene._bossBars)){
      $("body").find(`div[id="bossBar-${bar[1].id}"]`).remove();
      $("body").find(`div[id="bossBarSpacer-${bar[1].id}"]`).remove();
    }

  }

  static remove() {
    canvas.scene.unsetFlag("bossbar", "bossBarActive").then(() => {
      canvas.scene._bossBars={}
      this.clearAll();
    });
  }

  static addBossBar(bossBar) {
    if (!canvas.scene._bossBars) {
      canvas.scene._bossBars = {};
    }
    canvas.scene._bossBars[bossBar.id] = bossBar;
  }

  static cameraPan(tokenId,scale,duration){
    const token = canvas.tokens.get(tokenId)
    canvas.animatePan({
      x: token.center.x,
      y: token.center.y,
      scale: scale,
      duration: duration,
    });
  }

  static panCamera(token,scale=1.8,duration=1000){
    _BossBarSocket.executeForEveryone("cameraPan", token.id,scale,duration);
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
    return this.token.data.name;
  }

  get id() {
    return this.token.id;
  }
}
