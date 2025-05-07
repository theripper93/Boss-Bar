import { BossBarConfiguration } from "./app/BossBarConfiguration.js";

export function initConfig() {
    Hooks.on("getSceneControlButtons", (controls) => {
        console.log("Boss Bar | getSceneControlButtons", controls);
        controls.tokens.tools.bossBar = {
                name: "bossBar",
                title: "bossbar.controls.bossUI.name",
                icon: "fas fa-pastafarianism",
                visible: game.user.isGM,
                button: true,
                onClick: async () => {
                    await BossBarConfiguration.cleanUpActors();
                    new BossBarConfiguration().render(true);
                },
            };
    });
}
