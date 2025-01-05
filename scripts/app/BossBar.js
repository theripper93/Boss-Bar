import { MODULE_ID } from "../main.js";
import { HandlebarsApplication } from "../lib/utils.js";

export class BossBar extends HandlebarsApplication {
    constructor() {
        super();
    }

    static get DEFAULT_OPTIONS() {
        return mergeClone(super.DEFAULT_OPTIONS, {
            classes: [this.APP_ID],
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
                classes: [],
                scrollable: [],
            },
        };
    }

    async _prepareContext(options) {
        const data = {};
        return { data };
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = this.element;
    }

    _onClose(options) {
        super._onClose(options);
    }
}