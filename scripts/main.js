Hooks.once("init", function () {
  game.settings.register("bossbar", "currentHpPath", {
    name: game.i18n.localize("bossbar.settings.currentHpPath.name"),
    hint: game.i18n.localize("bossbar.settings.currentHpPath.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "data.attributes.hp.value",
  });

  game.settings.register("bossbar", "maxHpPath", {
    name: game.i18n.localize("bossbar.settings.maxHpPath.name"),
    hint: game.i18n.localize("bossbar.settings.maxHpPath.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "data.attributes.hp.max",
  });

  game.settings.register("bossbar", "barHeight", {
    name: game.i18n.localize("bossbar.settings.barHeight.name"),
    hint: game.i18n.localize("bossbar.settings.barHeight.hint"),
    scope: "world",
    config: true,
    type: Number,
    default: 20,
  });

  game.settings.register("bossbar", "backgroundPath", {
    name: game.i18n.localize("bossbar.settings.backgroundPath.name"),
    hint: game.i18n.localize("bossbar.settings.backgroundPath.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "modules/bossbar/resources/Dark.webp",
    filePicker: true,
  });

  game.settings.register("bossbar", "foregroundPath", {
    name: game.i18n.localize("bossbar.settings.foregroundPath.name"),
    hint: game.i18n.localize("bossbar.settings.foregroundPath.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "modules/bossbar/resources/Blood.webp",
    filePicker: true,
  });
});

Hooks.on("updateScene", (scene, updates) => {
  if (updates.flags?.bossbar) {
    BossBar.create(canvas.tokens.get(updates.flags?.bossbar.bossBarActive));
  } else {
    BossBar.clear();
  }
});

Hooks.on("renderApplication", () => {
  if (canvas.scene) {
    let tId = canvas.scene.getFlag("bossbar", "bossBarActive");
    if (tId) {
      BossBar.create(canvas.tokens.get(tId));
    } else {
      BossBar.clear();
    }
  }
});

Hooks.on("getSceneControlButtons", (controls, b, c) => {
  let isBoss = canvas.scene.getFlag("bossbar", "bossBarActive") ? true : false;
  controls
    .find((c) => c.name == "token")
    .tools.push(
      {
        name: "toggleCylinder",
        title: game.i18n.localize("bossbar.controls.bossUI.name"),
        icon: "fas fa-pastafarianism",
        toggle: true,
        visible: game.user.isGM,
        active: isBoss,
        onClick: (toggle) => {
          if(toggle){
            if(canvas.tokens.controlled[0]){
              BossBar.create(canvas.tokens.controlled[0])
            }else{
              ui.notifications.warn(game.i18n.localize("bossbar.controls.bossUI.warn"))
            }
          }else{
            BossBar.remove()
          }
        }
      }
    );
});

Object.byString = function (o, s) {
  s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  s = s.replace(/^\./, ""); // strip a leading dot
  var a = s.split(".");
  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
};
