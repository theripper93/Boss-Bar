class BossBar {
  constructor() {
    this.actor;
    this.token;
    this.bgPath = game.settings.get("bossbar", "backgroundPath");
    this.fgPath = game.settings.get("bossbar", "foregroundPath");
    this.tempBarColor = game.settings.get("bossbar", "tempBarColor");
    this.textSize = game.settings.get("bossbar", "textSize");
    this.position = game.settings.get("bossbar", "position");
  }

  static async create(token, render = true) {
    let instance = new BossBar();
    instance.actor = token.actor;
    instance.token = token;
    let bgFlag = token.document.getFlag("bossbar", "bgTex");
    let fgFlag = token.document.getFlag("bossbar", "fgTex");
    if (bgFlag) instance.bgPath = bgFlag;
    if (fgFlag) instance.fgPath = fgFlag;
    this.addBossBar(instance);
    if (render) instance.draw(game.settings.get("bossbar", "barHeight"));
    if (game.user.isGM) {
      let oldBars = canvas.scene.getFlag("bossbar", "bossBarActive");
      if (Array.isArray(oldBars)) {
        oldBars.push(token.id);
      } else {
        oldBars = [token.id];
      }
      await canvas.scene.setFlag("bossbar", "bossBarActive", oldBars);
    }
    this.hookId = Hooks.on("updateActor", (actor, updates) => {
      if (
        actor.id == instance.actor.id &&
        Object.byString(updates.system, game.settings.get("bossbar", "currentHpPath")) !== undefined
      ) {
        instance.update();
      }
    });
    return instance;
  }

  draw(h) {
    if ($("body").find(`div[id="bossBar-${this.id}"]`).length > 0) return; //#navigation
    let bossBarContainer = `<div id="bossBarContainer"></div>`;
    let bossBarHtml = `<div style="flex-basis: 100%;height: 0px;" id="bossBarSpacer-${
      this.id
    }"></div><div id="bossBar-${this.id}" class="bossBar">
    <a class="bossBarName" style="font-size: ${this.textSize}px;">${
      this.name
    }</a>
    <div id ="bossBarBar-${this.id}" style="z-index: 1000;">
      <div id="bossBarMax-${
        this.id
      }" class="bossBarMax" style="background-image:url('${
      this.bgPath
    }');height:${h}px;"></div>
      <div id="bossBarTemp-${
        this.id
      }" class="bossBarTemp" style="background-color:${
      this.tempBarColor
    };height:${h}px;width:${this.hpPercent}%"></div>
      <div id="bossBarCurrent-${
        this.id
      }" class="bossBarCurrent" style="background-image:url('${
      this.fgPath
    }');height:${h}px;width:${this.hpPercent}%"></div>
    </div>
  </div>
  <div style="flex-basis: 100%;height: ${
    this.textSize + 3
  }px;" id ="bossBarSpacer-${this.id}"></div>
  `;
    switch (this.position) {
      case 0:
        $("#ui-top").append(bossBarHtml);
        break;
      case 1:
        const cameraContainerW = $("#camera-views").width();
        if ($("#bossBarContainer").length == 0) {
          $("#ui-bottom").find("div").first().prepend(bossBarContainer);
        }
        $("#bossBarContainer").append(bossBarHtml);
        $("#bossBarContainer").css({
          position: "fixed",
          bottom:
            $("#hotbar").outerHeight(true) +
            $(".bossBar").outerHeight(true) +
            10,
          width: `calc(100% - 330px - ${cameraContainerW}px)`,
          left: 15 + cameraContainerW,
        });
        break;
      default:
        $("#ui-top").append(bossBarHtml);
    }



    this.update();
  }

  update() {
    const isBar = document.getElementById(`bossBarCurrent-${this.id}`)
    if(!isBar) return;
    document
      .getElementById(`bossBarCurrent-${this.id}`)
      .style.setProperty("width", `${this.hpPercent}%`);
    document
      .getElementById(`bossBarTemp-${this.id}`)
      .style.setProperty("width", `${this.hpPercent}%`);
  }

  clear() {
    $("body").find(`div[id="bossBar-${this.id}"]`).remove();
  }

  async destroy() {
    const flag = canvas.scene.getFlag("bossbar", "bossBarActive");
    let newFlag = [];
    for (let id of flag) {
      if (id == this.token.id) continue;
      newFlag.push(id);
    }
    await canvas.scene.setFlag("bossbar", "bossBarActive", newFlag);
    this.unHook();
  }

  static clearAll() {
    if (!canvas.scene._bossBars) return;
    for (let bar of Object.entries(canvas.scene._bossBars)) {
      $("body").find(`div[id="bossBar-${bar[1].id}"]`).remove();
      $("body").find(`div[id="bossBarSpacer-${bar[1].id}"]`).remove();
    }
  }

  static async remove() {
    await canvas.scene.unsetFlag("bossbar", "bossBarActive");
    canvas.scene._bossBars = {};
    this.clearAll();
  }

  unHook() {
    Hooks.off(this.hookId);
    this.clear();
  }

  static addBossBar(bossBar) {
    if (!canvas.scene._bossBars) {
      canvas.scene._bossBars = {};
    }
    canvas.scene._bossBars[bossBar.id] = bossBar;
  }

  static cameraPan(tokenId, scale, duration) {
    const token = canvas.tokens.get(tokenId);
    canvas.animatePan({
      x: token.center.x,
      y: token.center.y,
      scale: scale,
      duration: duration,
    });
  }

  static panCamera(token, scale = 1.8, duration = 1000) {
    _BossBarSocket.executeForEveryone("cameraPan", token.id, scale, duration);
  }

  static async renderBossBar() {
    if (canvas.scene) {
      BossBar.clearAll();
      const ids = canvas.scene.getFlag("bossbar", "bossBarActive");
      if (!ids) return;
      for (let id of ids) {
        if (canvas.scene._bossBars && canvas.scene._bossBars[id]) {
          canvas.scene._bossBars[id].draw(
            game.settings.get("bossbar", "barHeight")
          );
        } else {
          await BossBar.create(canvas.tokens.get(id));
        }
      }
    }
  }

  get currentHp() {
    return Object.byString(
      this.actor.system,
      game.settings.get("bossbar", "currentHpPath")
    );
  }

  get maxHp() {
    return Object.byString(
      this.actor.system,
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
    return this.token.document.name;
  }

  get id() {
    return this.token.id;
  }
}
