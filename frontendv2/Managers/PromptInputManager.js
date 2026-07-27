import {DomRegister} from "../Static/DomRegister.js";
import {API_ADAPTER} from "../api-adapter.js";
import {ConversationManager} from "./ConversationManager.js";
import {Popup} from "../Components/Popup.js";
import {Message} from "../Components/Message.js";

export class PromptInput {
    static container = DomRegister.promptInput.container;
    static input = DomRegister.promptInput.input;
    static modelSelect = DomRegister.promptInput.modelSelect;
    static sendButton = DomRegister.promptInput.sendButton;

    static InputMaxHeight = 250;

    static Models = {};

    static GetSelectedModel() {
        return PromptInput.Models[PromptInput.modelSelect.value] ?? undefined;
    }

    static SetModel(modelName) {
        if (!modelName) this.modelSelect.selectedIndex = 0;
        this.modelSelect.value = modelName;
    }

    static UpdateSendButtonState() {
        const input = this.input.value;
        const selectedModel = this.GetSelectedModel();

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

        this.input.addEventListener("input", (e) => {
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

        this.modelSelect.addEventListener("change", (e) => {
            const modelName = e.target.value;
            if (modelName in PromptInput.Models)
                ConversationManager.SetModel(PromptInput.Models[modelName]);
            this.UpdateSendButtonState();
        })

        this.UpdateSendButtonState();
        this.container.classList.add("centered");
    }

    static async send() {
        const prompt = this.input.value;
        if (!prompt) throw new Error("Prompt cannot be empty");
        if (this.GetSelectedModel() === undefined) throw new Error("No model selected");

        const message = Message.fromPrompt(prompt);
        await ConversationManager.SendMessage(message, this.GetSelectedModel());
    }

    static async populateModelSelect(){
        const models = await API_ADAPTER.getModels();
        models.forEach(model => {
            const option = document.createElement("option");
            option.value = model.name;
            option.innerText = model.name;
            PromptInput.modelSelect.appendChild(option);
            PromptInput.Models[model.name] = model;
        });
    }
}