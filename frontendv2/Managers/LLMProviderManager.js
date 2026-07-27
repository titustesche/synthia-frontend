import {Modal} from "../Components/Modal.js";
import {TextInput} from "../Components/TextInput.js";
import {Button} from "../Components/Button.js";
import {API_ADAPTER} from "../api-adapter.js";
import {Popup} from "../Components/Popup.js";

export class LlmProviderManager {
    static _providers = {};
    static get Providers() { return LlmProviderManager._providers; }

    static async createProvider() {
        const nameInput = new TextInput(undefined, {
            identifier: "provider-name-input",
            placeholder: "Name",
        });
        const urlInput = new TextInput(undefined, {
            identifier: "provider-url-input",
            placeholder: "URL",
        });
        const portInput = new TextInput(undefined, {
            identifier: "provider-port-input",
            placeholder: "Port",
        });
        const apiKeyInput = new TextInput(undefined, {
            identifier: "provider-api-key-input",
            placeholder: "API Key",
            censorInput: true,
        });
        const addProviderModal = new Modal("Add Provider", [
            nameInput,
            urlInput,
            portInput,
            apiKeyInput,
            new Button(undefined, {
                identifier: "add-provider-button",
                text: "Add Provider",
                onClick: async () => {
                    const name = nameInput.value;
                    const url = urlInput.value;
                    const port = portInput.value;
                    const apiKey = apiKeyInput.value;

                    if (!name || !url || !port) throw new Error("Please fill in all required fields");

                    await API_ADAPTER.createLlmProvider({name, url, port, apiKey,})
                        .then(provider => {
                            LlmProviderManager.Providers[provider.id] = provider;
                            addProviderModal.destroy();
                        })
                        .catch(reason => {
                            Popup.error("Could not add provider", reason);
                        })
                }
            })
        ]);
        await addProviderModal.render();
    }

    static async loadProviders() {
        const providers = await API_ADAPTER.getLlmProviders();
        for (let provider of providers)
            LlmProviderManager.Providers[provider.id] = provider;
    }
}