import { BAR_STYLES, MODULE_ID } from "../main.js";
import { getProperty, HandlebarsApplication, mergeClone } from "../lib/utils.js";
import {DEFAULT_BAR_STYLE, getSetting} from "../settings.js";

export function setBossBarHooks() {
    Hooks.on("updateScene", (scene, updates) => {
        if (updates.flags?.bossbar && scene === game.scenes.viewed) BossBar.update();
    });
    Hooks.on("canvasReady", () => BossBar.update());
    Hooks.on("updateActor", (actor, updates) => {
        ui.bossBar?._onActorUpdate(actor);
    });
}

export class BossBar extends HandlebarsApplication {
    constructor(scene) {
        super();
        if (ui.bossBar) ui.bossBar.close();
        ui.bossBar = this;
        this.scene = scene ?? game.scenes.viewed;
    }

    static update() {
        const current = ui.bossBar;
        const scene = game.scenes.viewed;
        const actors = scene.getFlag(MODULE_ID, "actors") ?? [];
        if (!actors.length && current) return current.close();
        if (actors.length) return new BossBar(scene).render(true);
    }

    static get DEFAULT_OPTIONS() {
        return mergeClone(super.DEFAULT_OPTIONS, {
            classes: [this.APP_ID],
            id: this.APP_ID,
            window: {
                title: `${MODULE_ID}.${this.APP_ID}.title`,
                icon: "",
                resizable: true,
            },
            position: {
                width: 560,
                height: "auto",
            },
        });
    }

    static get PARTS() {
        return {
            content: {
                template: `modules/${MODULE_ID}/templates/${this.APP_ID}.hbs`,
                classes: [],
                scrollable: [],
            },
        };
    }

    async _prepareContext(options) {
        const actors = this.scene.getFlag(MODULE_ID, "actors") ?? [];
        const bars = actors.map(a => new Bar(fromUuidSync(a.uuid), a.style, a.hideName));
        this.actors = new Set(actors.map(a => fromUuidSync(a.uuid)));
        this.bars = bars;
        return {
            bars: bars,
        }
    }

    _onActorUpdate(actor) {
        if(!this.actors.has(actor)) return;
        this.updateBars();
    }

    updateBars() {
        this.bars.forEach(b => {
            const element = this.element.querySelector(`.bar-list-item[data-uuid="${b.actor.uuid}"]`);
            if (!element) return;
            element.style.setProperty("--bar-percent", `${b.hpPercent}%`);
        })
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = this.element;
    }

    setPosition(...args) {
        const r = super.setPosition(...args);
        const barContainerOuterWidth = this.element.querySelector(".bar-list-item").offsetWidth;
        this.element.style.setProperty("--bar-container-outer-width", `${barContainerOuterWidth}px`);
        return r;
    }

    _onClose(options) {
        super._onClose(options);
    }
}

class Bar {
    constructor (actor, style, hideName) {
        this.#actor = actor;
        this.#style = getSetting("barStyles").find(s => s.id === style) ?? getSetting("barStyles")[0] ?? DEFAULT_BAR_STYLE;
        this.hideName = hideName;
    }
    
    #actor;
    
    #style;
    
    get actor() {
        return this.#actor;
    }
    
    get style() {
        return this.#style;
    }

    get currentHp() {
        return getProperty(this.actor.system, getSetting("currentHpPath"));
    }

    get maxHp() {
        return getProperty(this.actor.system, getSetting("maxHpPath"));
    }

    get hpPercent() {
        return Math.max(0, Math.round((100 * this.currentHp) / this.maxHp));
    }

    get name() {
        if(this.hideName) return "";
        return this.actor.name;
    }

    get isClassic() {
        return this.style.type == BAR_STYLES.CLASSIC;
    }

    get isMatchingImages() {
        return this.style.type == BAR_STYLES.MATCHING_IMAGES;
    }

    get cssClass() {
        if (this.isClassic) return "classic";
        else if (this.isMatchingImages) return "matching-images";
        return "classic";
    }
}
