Hooks.once('init', function() {

    game.settings.register("bossbar", "currentHpPath", {
        name: game.i18n.localize("bossbar.settings.currentHpPath.name"),
        hint: game.i18n.localize("bossbar.settings.currentHpPath.hint"),
        scope: "world",
        config: true,
        type: String,
        default: "data.data.attributes.hp.value",
      });

      game.settings.register("bossbar", "maxHpPath", {
        name: game.i18n.localize("bossbar.settings.maxHpPath.name"),
        hint: game.i18n.localize("bossbar.settings.maxHpPath.hint"),
        scope: "world",
        config: true,
        type: String,
        default: "data.data.attributes.hp.max",
      });

});

Hooks.once('ready', async function() {

});

Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
  }