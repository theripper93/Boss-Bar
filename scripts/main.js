import { initConfig } from "./config.js";
import { registerSettings } from "./settings.js";
import { BossBar } from "./BossBar.js";
import { Socket } from "./lib/socket.js";
import {setBossBarHooks} from "./app/BossBar.js";

export const MODULE_ID = "bossbar";

export const BAR_STYLES = {
    CLASSIC: 0,
    MATCHING_IMAGES: 1,
};

export const BAR_STYLE_SELECT = {
    0: "bossbar.settings.barStyle.classic",
    1: "bossbar.settings.barStyle.matchingImages",
};

Hooks.on("init", () => {
    initConfig();
    registerSettings();
    setBossBarHooks();
});

Hooks.once("ready", function () {
    ui.BossBar = BossBar;

    Socket.register("cameraPan", ({ uuid, scale, duration }) => {
        const token = fromUuidSync(uuid);
        if (token.parent !== canvas?.scene) return;
        canvas.animatePan({
            x: token.center.x,
            y: token.center.y,
            scale: scale,
            duration: duration,
        });
    });

    Hooks.on("renderApplication", (app) => {
        if (app.id == "controls" || app.id == "navigation" || app.id == "camera-views") {
            BossBar.renderBossBar();
        }
    });
    BossBar.renderBossBar();
});

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
                    canvas.scene._bossBars[id].draw(game.settings.get("bossbar", "barHeight"));
                    return;
                } else {
                    await BossBar.create(canvas.tokens.get(id));
                }
            }
        }
    }
});
