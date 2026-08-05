import {Modal} from "../Components/Modal.js";
import {TextInput} from "../Components/TextInput.js";
import {Button} from "../Components/Button.js";
import {API_ADAPTER} from "../api-adapter.js";
import {Popup} from "../Components/Popup.js";

export class LlmProviderManager {
    static _providers = {};
    static get Providers() { return LlmProviderManager._providers; }
    static set Providers(value) { LlmProviderManager._providers = value; }

    static async loadProviders() {
        const providers = await API_ADAPTER.getLlmProviders();
        for (let provider of providers)
            LlmProviderManager.Providers[provider.id] = provider;
    }
}