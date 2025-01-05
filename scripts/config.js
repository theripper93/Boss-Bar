import { BossBarConfiguration } from "./app/BossBarConfiguration.js";

export function initConfig() {
    Hooks.on("getSceneControlButtons", (controls) => {
        controls
            .find((c) => c.name === "token")
            .tools.push({
                name: "bossBar",
                title: "bossbar.controls.bossUI.name",
                icon: "fas fa-pastafarianism",
                visible: game.user.isGM,
                button: true,
                onClick: async () => {
                    await BossBarConfiguration.cleanUpActors();
                    new BossBarConfiguration().render(true);
                },
            });
    });
}
