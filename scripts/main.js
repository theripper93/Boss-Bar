import { initConfig } from "./config.js";
import { registerSettings } from "./settings.js";
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