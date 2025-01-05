import { MODULE_ID } from "../main.js";
import { HandlebarsApplication, l, mergeClone } from "../lib/utils.js";
import {getSetting} from "../settings.js";

export class BossBarConfiguration extends HandlebarsApplication {
    constructor(scene) {
        super();
        this.#scene = scene ?? game.scenes.viewed;
        if (!this.#scene) ui.notifications.error(`${MODULE_ID}.${this.APP_ID}.no-scene`);
        this.prepareActors();
    }

    prepareActors() {
        const actorsData = (this.scene.getFlag(MODULE_ID, "actors") ?? []).filter(a => fromUuidSync(a.uuid));
        this.actors = JSON.parse(JSON.stringify(actorsData));
        this.actors.forEach(a => {
            a.document = fromUuidSync(a.uuid);
        });
    }

    #scene;

    get scene() {
        return this.#scene;
    }

    get title() {
        return l(`${MODULE_ID}.${this.APP_ID}.title`) + `: ${this.#scene.name}`;
    }

    static get DEFAULT_OPTIONS() {
        return mergeClone(super.DEFAULT_OPTIONS, {
            classes: [this.APP_ID],
            id: this.APP_ID,
            window: {
                title: `${MODULE_ID}.${this.APP_ID}.title`,
                icon: "",
                resizable: false,
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
                classes: ["standard-form"],
                scrollable: [""],
            },
        };
    }

    async _prepareContext(options) {
        const controlled = canvas?.tokens?.controlled?.map(t => t.actor) ?? [];
        const actorOptions = (controlled.length ? controlled : this.scene.tokens.map(t => t.actor)).filter(a => !this.actors.find(ac => ac.document === a));
        if(!actorOptions.length && !this.actors.length) return ui.notifications.error(`${MODULE_ID}.${this.APP_ID}.no-actors`);
        const barStyles = getSetting("barStyles");
        const barStyleOptions = barStyles.reduce((acc, style) => {
            acc[style.id] = style.name;
            return acc;
        }, {});
        const data = {
            actors: this.actors,
            actorOptions: actorOptions.map(a => ({uuid: a.uuid, style: barStyles[0].id, document: a})),
            barStyleOptions: barStyleOptions,
        }
        console.log(data);
        return data

    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = this.element;
        html.querySelectorAll("#add").forEach((button) => {
            button.addEventListener("click", (event) => {
                const li = event.currentTarget.closest("li");
                const actor = li.dataset.uuid;
                const style = li.querySelector("select").value;
                this.actors.push({uuid: actor, style: style, document: fromUuidSync(actor)});
                this.render();
            });
        });
        html.querySelectorAll("#delete").forEach((button) => {
            button.addEventListener("click", (event) => {
                const li = event.currentTarget.closest("li");
                const actor = li.dataset.uuid;
                this.actors = this.actors.filter(a => a.uuid !== actor);
                this.render();
            });
        });
        html.querySelector("#save").addEventListener("click", (event) => {
            const actors = this.actors.map(a => ({uuid: a.uuid, style: a.style}));
            this.scene.setFlag(MODULE_ID, "actors", actors);
            this.close();
        });
    }

    _onClose(options) {
        super._onClose(options);
    }

    static async cleanUpActors(scene) {
        scene ??= game.scenes.viewed;
        const actors = scene.getFlag(MODULE_ID, "actors") ?? [];
        const cleaned = actors.filter(a => fromUuidSync(a.uuid));
        if (cleaned.length !== actors.length) {
            return scene.setFlag(MODULE_ID, "actors", cleaned);
        }
        return null;
    }
}