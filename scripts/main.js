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

  game.settings.register("bossbar", "backgroundPath", {
    name: game.i18n.localize("bossbar.settings.backgroundPath.name"),
    hint: game.i18n.localize("bossbar.settings.backgroundPath.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "modules/bossbar/resources/background.webp",
    filePicker: true,
  });

  game.settings.register("bossbar", "foregroundPath", {
    name: game.i18n.localize("bossbar.settings.foregroundPath.name"),
    hint: game.i18n.localize("bossbar.settings.foregroundPath.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "modules/bossbar/resources/foreground.webp",
    filePicker: true,
  });
});

Hooks.once("ready", async function () {});

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
