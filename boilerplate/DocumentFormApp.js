import { MODULE_ID } from "../main.js";
import { HandlebarsApplication } from "../lib/utils.js";

export class DocumentFormApp extends HandlebarsApplication {
    constructor(document) {
        super();
        this.document = document;
    }

    static get DEFAULT_OPTIONS() {
        return mergeClone(super.DEFAULT_OPTIONS, {
            classes: [this.APP_ID],
            tag: "form",
            window: {
                title: `${MODULE_ID}.${this.APP_ID}.title`,
                icon: "",
                resizable: false,
                contentTag: "section",
            },
            form: {
                handler: this.#onSubmit,
                submitOnChange: false,
                closeOnSubmit: true,
            },
            position: {
                width: 560,
                height: "auto",
            },
        });
    }

    static get PARTS() {
        return {
            tabs: {
                template: "templates/generic/tab-navigation.hbs",
            },
            content: {
                template: `modules/${MODULE_ID}/templates/${this.APP_ID}.hbs`,
                classes: ["scrollable"],
                scrollable: [""],
            },

            footer: {
                template: "templates/generic/form-footer.hbs",
            },
        };
    }

    static get APP_ID() {
        return this.name
            .split(/(?=[A-Z])/)
            .join("-")
            .toLowerCase();
    }

    get APP_ID() {
        return this.constructor.APP_ID;
    }

    async _prepareContext(options) {
        return {
            ...this.document,
            buttons: [
                {
                    type: "submit",
                    action: "submit",
                    icon: "far fa-save",
                    label: "Save",
                },
            ],
        };
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = this.element;
    }

    static async #onSubmit(event, form, formData) {
        const data = foundry.utils.expandObject(formData.object);
        return await this.document.update(data);
    }

    _onClose(options) {
        super._onClose(options);
    }
}