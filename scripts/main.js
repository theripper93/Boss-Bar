Hooks.once("ready", function () {
  game.settings.register("bossbar", "currentHpPath", {
    name: game.i18n.localize("bossbar.settings.currentHpPath.name"),
    hint: game.i18n.localize("bossbar.settings.currentHpPath.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "attributes.hp.value",
  });

  game.settings.register("bossbar", "maxHpPath", {
    name: game.i18n.localize("bossbar.settings.maxHpPath.name"),
    hint: game.i18n.localize("bossbar.settings.maxHpPath.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "attributes.hp.max",
  });

  game.settings.register("bossbar", "barHeight", {
    name: game.i18n.localize("bossbar.settings.barHeight.name"),
    hint: game.i18n.localize("bossbar.settings.barHeight.hint"),
    scope: "world",
    config: true,
    type: Number,
    default: 20,
  });

  game.settings.register("bossbar", "textSize", {
    name: game.i18n.localize("bossbar.settings.textSize.name"),
    hint: game.i18n.localize("bossbar.settings.textSize.hint"),
    scope: "world",
    config: true,
    type: Number,
    default: 20,
  });

  game.settings.register("bossbar", "cameraPan", {
    name: game.i18n.localize("bossbar.settings.cameraPan.name"),
    hint: game.i18n.localize("bossbar.settings.cameraPan.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("bossbar", "position", {
    name: game.i18n.localize("bossbar.settings.position.name"),
    hint: game.i18n.localize("bossbar.settings.position.hint"),
    scope: "world",
    config: true,
    type: Number,
    choices: {
      0: game.i18n.localize("bossbar.settings.position.opt0"),
      1: game.i18n.localize("bossbar.settings.position.opt1"),
    },
    default: 0,
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

  new window.Ardittristan.ColorSetting("bossbar", "tempBarColor", {
    name: game.i18n.localize("bossbar.settings.tempBarColor.name"),
    hint: game.i18n.localize("bossbar.settings.tempBarColor.hint"),
    label: game.i18n.localize("bossbar.settings.tempBarColor.label"),
    restricted: true,
    defaultColor: "#7e7e7e",
    scope: "world",
  });

  Hooks.on("renderApplication", (app) => {
    if (app.id == "controls" || app.id =="navigation" || app.id == "camera-views") {
      BossBar.renderBossBar();
    }
  });
  BossBar.renderBossBar();
});

Hooks.once("ready", function () {});

Hooks.on("updateScene", async (scene, updates) => {
  if (!game.user.isGM) {
    if (updates.flags?.bossbar) {
      const ids = canvas.scene.getFlag("bossbar", "bossBarActive");
      if (!ids) {
        if (canvas.scene._bossBars) {
          for (let bar of Object.entries(canvas.scene._bossBars)) {
            bar[1].unHook();
          }
          delete canvas.scene._bossBars;
        }
        return;
      }
      for (let id of ids) {
        if (canvas.scene._bossBars && canvas.scene._bossBars[id]) {
          canvas.scene._bossBars[id].draw(
            game.settings.get("bossbar", "barHeight")
          );
          return;
        } else {
          await BossBar.create(canvas.tokens.get(id));
        }
      }
    } else {
      //BossBar.clearAll();
    }
  }
});

Hooks.on("getSceneControlButtons", (controls, b, c) => {
  if (!canvas.scene) return;
  let isBoss = canvas.scene.getFlag("bossbar", "bossBarActive") ? true : false;
  controls
    .find((c) => c.name == "token")
    .tools.push({
      name: "bossBar",
      title: game.i18n.localize("bossbar.controls.bossUI.name"),
      icon: "fas fa-pastafarianism",
      toggle: true,
      visible: game.user.isGM,
      active: isBoss,
      onClick: async (toggle) => {
        if (toggle) {
          if (canvas.tokens.controlled[0]) {
            for (let token of canvas.tokens.controlled) {
              await BossBar.create(token);
              if (game.settings.get("bossbar", "cameraPan"))
                BossBar.panCamera(token);
            }
          } else {
            ui.notifications.warn(
              game.i18n.localize("bossbar.controls.bossUI.warn")
            );
          }
        } else {
          await canvas.scene.unsetFlag("bossbar", "bossBarActive");
          BossBar.remove();
        }
      },
    });
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



