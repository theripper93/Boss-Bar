import { BarStyleConfiguration } from "./app/BarStyleConfiguration.js";
import { BossBar } from "./app/BossBar.js";
import { BAR_STYLES, MODULE_ID } from "./main.js";

const SETTING_CACHE = {};
const DEFAULT_CACHE = false;

export const DEFAULT_BAR_STYLE = {
    name: "Classic - Red",
    id: "default",
    background: "modules/bossbar/resources/Dark.webp",
    foreground: "modules/bossbar/resources/Blood.webp",
    tempBarColor: "#7e7e7e",
    tempBarAlpha: 0.5,
    barHeight: 20,
    textSize: 20,
    type: 0,
};

const PREDEFINED_BAR_STYLES = [
    {
        ...DEFAULT_BAR_STYLE,
        id: "default-ice",
        foreground: "modules/bossbar/resources/Ice.webp",
    },
    {
        ...DEFAULT_BAR_STYLE,
        id: "default-grass",
        foreground: "modules/bossbar/resources/Grass.webp",
    },
    {
        ...DEFAULT_BAR_STYLE,
        id: "default-oak",
        foreground: "modules/bossbar/resources/Oak.webp",
    }
]

export function registerSettings() {
    const settings = {
        barStyles: {
            scope: "world",
            config: false,
            type: Array,
            default: [{ ...DEFAULT_BAR_STYLE }, ...PREDEFINED_BAR_STYLES],
            onChange: () => BossBar.update(),
        },

        barPosition: {
            scope: "client",
            type: Object,
            default: {},
        },

        handlePosition: {
            scope: "client",
            config: true,
            type: String,
            default: "bottom",
            choices: {
                bottom: `${MODULE_ID}.settings.handlePosition.bottom`,
                top: `${MODULE_ID}.settings.handlePosition.top`,
            },
        },

        resetPosition: {
            scope: "client",
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => {
                if (value) BossBar.resetPosition();
            }
        },

        currentHpPath: {
            scope: "world",
            config: true,
            type: String,
            default: "attributes.hp.value",
        },
        maxHpPath: {
            scope: "world",
            config: true,
            type: String,
            default: "attributes.hp.max",
        },
    };

    registerSettingsArray(settings);

    game.settings.registerMenu(MODULE_ID, "BarStyleConfiguration", {
        name: "bossbar.settings.BarStyleConfiguration.name",
        label: "bossbar.settings.BarStyleConfiguration.label",
        icon: "fas fa-paint-brush",
        type: BarStyleConfiguration,
        restricted: true,
    });
}

export function getSetting(key) {
    return SETTING_CACHE[key] ?? game.settings.get(MODULE_ID, key);
}

export async function setSetting(key, value) {
    return await game.settings.set(MODULE_ID, key, value);
}

function registerSettingsArray(settings) {
    for (const [key, value] of Object.entries(settings)) {
        if (!value.name) value.name = `${MODULE_ID}.settings.${key}.name`;
        if (!value.hint) value.hint = `${MODULE_ID}.settings.${key}.hint`;
        if (value.useCache === undefined) value.useCache = DEFAULT_CACHE;
        if (value.useCache) {
            const unwrappedOnChange = value.onChange;
            if (value.onChange)
                value.onChange = (value) => {
                    SETTING_CACHE[key] = value;
                    if (unwrappedOnChange) unwrappedOnChange(value);
                };
        }
        game.settings.register(MODULE_ID, key, value);
        if (value.useCache) SETTING_CACHE[key] = getSetting(key);
    }
}
