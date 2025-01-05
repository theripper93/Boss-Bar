import { BAR_STYLE_SELECT, MODULE_ID, TEXT_ALIGN } from "../main.js";
import { HandlebarsApplication, l } from "../lib/utils.js";
import {DEFAULT_BAR_STYLE, getSetting, setSetting} from "../settings.js";
import {mergeClone, confirm} from "../lib/utils.js";
import {FormBuilder} from "../lib/formBuilder.js";

export class BarStyleConfiguration extends HandlebarsApplication {
    constructor() {
        super();
    }

    static get DEFAULT_OPTIONS() {
        return mergeClone(super.DEFAULT_OPTIONS, {
            classes: [this.APP_ID],
            id: this.APP_ID,
            window: {
                title: `${MODULE_ID}.${this.APP_ID}.title`,
                icon: "fas fa-paint-brush",
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
                scrollable: [],
            },
        };
    }

    async _prepareContext(options) {
        return {
            styles: getSetting("barStyles"),
        }
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = this.element;
        html.querySelectorAll(".edit-style").forEach((button) => {
            button.addEventListener("click", (event) => {
                const styleId = event.currentTarget.dataset.styleId;
                this._onEdit(styleId);
            });
        });
        html.querySelectorAll(".delete-style").forEach((button) => {
            button.addEventListener("click", (event) => {
                const styleId = event.currentTarget.dataset.styleId;
                this._onDelete(styleId);
            });
        });
        html.querySelector(".add-style").addEventListener("click", (event) => {
            this._onAdd();
        });
    }


    async _onEdit(id) {
        const style = getSetting("barStyles").find((style) => style.id === id);
        if (!style) return;
        const data = await new FormBuilder().title(l(`${MODULE_ID}.${this.APP_ID}.edit`) + `: ${style.name}`).object(style)
            .text({name: "name", label: "Name"})
            .file({name: "background", label: `${MODULE_ID}.${this.APP_ID}.background`})
            .file({name: "bar", label: `${MODULE_ID}.${this.APP_ID}.bar`})
            .file({name: "foreground", label: `${MODULE_ID}.${this.APP_ID}.foreground`})
            .color({name: "tempBarColor", label: `${MODULE_ID}.${this.APP_ID}.tempBarColor`})
            .number({name: "tempBarAlpha", label: `${MODULE_ID}.${this.APP_ID}.tempBarAlpha`, min: 0, max: 1, step: 0.01})
            .number({name: "barHeight", label: `${MODULE_ID}.${this.APP_ID}.barHeight`, min: 5, max: 100, step: 1})
            .number({name: "textSize", label: `${MODULE_ID}.${this.APP_ID}.textSize`, min: 5, max: 100, step: 1})
            .select({name: "textAlign", label: `${MODULE_ID}.${this.APP_ID}.textAlign`, options: TEXT_ALIGN})
            .select({name: "type", label: `${MODULE_ID}.${this.APP_ID}.type`, hint: `${MODULE_ID}.${this.APP_ID}.type-hint`, options: BAR_STYLE_SELECT})
            .render();
        if (!data) return;
        const styles = getSetting("barStyles");
        const current = styles.find((style) => style.id === id);
        Object.keys(data).forEach((key) => {
            current[key] = data[key];
        });
        await setSetting("barStyles", styles);
        this.render();
    }
    
    async _onDelete(id) {
        const confirmed = await confirm(`${MODULE_ID}.${this.APP_ID}.delete-title`, `${MODULE_ID}.${this.APP_ID}.delete-confirm`);
        if (!confirmed) return;
        const styles = getSetting("barStyles");
        await setSetting("barStyles", styles.filter((style) => style.id != id));
        this.render();
    }

    async _onAdd() {
        const data = await new FormBuilder().size({width: 400}).title(`${MODULE_ID}.${this.APP_ID}.add`).text({name: "name", label: "Name"}).render();
        if (!data || !data.name) return;
        const styles = getSetting("barStyles");
        styles.push(mergeClone(DEFAULT_BAR_STYLE, {id: randomID(), ...data}));
        await setSetting("barStyles", styles);
        this.render();
    }

    _onClose(options) {
        super._onClose(options);
    }
}