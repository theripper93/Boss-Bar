import { initConfig } from "./config.js";
import { registerSettings, setSetting } from "./settings.js";
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

export const TEXT_ALIGN = {
    "left": "bossbar.settings.textAlign.left",
    "center": "bossbar.settings.textAlign.center",
    "right": "bossbar.settings.textAlign.right",
};

Hooks.on("init", () => {
    initConfig();
    registerSettings();
    setBossBarHooks();
});