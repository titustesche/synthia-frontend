import {DomRegister} from "../Static/DomRegister.js";
import {API_ADAPTER} from "../api-adapter.js";
import {ConversationManager} from "./ConversationManager.js";
import {Popup} from "../Components/Popup.js";
import {Message} from "../Components/Message.js";
import {Modal} from "../Components/Modal.js";
import {ModelSelect} from "../Components/ModelSelect.js";
import {TextInput} from "../Components/TextInput.js";

export class PromptInput {
    static container = DomRegister.promptInput.container;
    static input = DomRegister.promptInput.input;
    static modelSelect = DomRegister.promptInput.modelSelect;
    static sendButton = DomRegister.promptInput.sendButton;

    static ModelSelectModal = undefined;

    static InputMaxHeight = 250;

    static _models = {};
    static get Models() { return this._models; }
    static set Models(value) { this._models = value; }

    static _model;

    static set Model(value) {
        this._model = value;
        this.modelSelect.innerText = value.name;
        ConversationManager.SetModel(value);
    }
    static get Model() { return this._model; }

    static UpdateSendButtonState() {
        const input = this.input.value;
        const selectedModel = this.Model;

        if (input.length > 0 && selectedModel) {
            this.sendButton.classList.remove("disabled");
        } else {
            this.sendButton.classList.add("disabled");
        }
    }

    static UpdateInputHeight() {
        this.input.style.height = "";
        if (this.input.value.trim() === "") {
            this.input.style.height = "";
        } else {
            this.input.style.height = `${Math.min(this.input.scrollHeight, this.InputMaxHeight)}px`;
        }
    }

    static async init() {
        this.sendButton.addEventListener("click", async () => {
            try {
                await this.send();
            } catch (e) {
                Popup.error("Could not send message", e);
            }
        });

        this.input.addEventListener("input", () => {
            this.UpdateInputHeight();
            this.UpdateSendButtonState()
        });
        this.input.addEventListener("keydown", async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                try {
                    await this.send();
                } catch (e) {
                    Popup.error("Could not send message", e);
                    this.container.classList.add("shake");
                    setTimeout(() => this.container.classList.remove("shake"), 200);
                }
            }
        })

        this.modelSelect.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (this.ModelSelectModal) this.ModelSelectModal.destroy();
            this.ModelSelectModal = new Modal("Select Model", [
                new ModelSelect(undefined, {
                    identifier: "model-select",
                    placeholder: "Model",
                    models: PromptInput.Models,
                    selectedModel: PromptInput.Model ?? undefined,
                    onModelChange: (model) => {
                        PromptInput.Model = model;
                        this.UpdateSendButtonState();
                    }
                })
            ], { canBeClosedManually: true });
            await this.ModelSelectModal.render();
        })

        this.UpdateSendButtonState();
        this.container.classList.add("centered");
    }

    static async send() {
        const prompt = this.input.value;
        if (!prompt) throw new Error("Prompt cannot be empty");
        if (this.Model === undefined) throw new Error("No model selected");

        const message = Message.fromPrompt(prompt);
        await ConversationManager.SendMessage(message, this.Model);
    }

    static async loadModels(){
        const models = await API_ADAPTER.getModels();
        this.Models = models.reduce((acc, model) => {
            acc[model.name] = model;
            return acc;
        }, {})
    }
}