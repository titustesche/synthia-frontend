import {Button} from "./Button.js";
import {ICONS} from "../Static/Icons.js";
import {Translations} from "../Static/i18n.js";

export class ProviderSelect {
    _parentContainer;
    set parentContainer(value) { this._parentContainer = value; }

    _container;
    _listContainer;
    _addButton;

    _selectedProviders = [];
    get selectedProviders() { return this._selectedProviders; }

    constructor(parentContainer, details) {
        this._container = document.createElement("div");
        this._container.classList.add("provider-select-container");

        this._listContainer = document.createElement("div");
        this._listContainer.classList.add("provider-select-list-container");
        this._container.appendChild(this._listContainer);

        this._addButton = document.createElement("div");
        this._addButton.classList.add("provider-select-add-button");
        this._addButton.innerHTML = Translations.add_provider;
        this._addButton.addEventListener("click", () => {
            this.createProviderContainer({
                name: "",
                url: "",
                port: "",
                token: "",
                listEndpoint: "",
                chatEndpoint: "",
            });
        });
        this._container.appendChild(this._addButton);

        for (let provider of Object.keys(details.initialValue).map(key => details.initialValue[key])) {
            // Work on copies so cancelling the settings modal discards the edits
            this.createProviderContainer({...provider});
        }
    }

    createProviderContainer(provider) {
        this._selectedProviders.push(provider);
        const container = document.createElement("div");
        container.classList.add("provider-select-provider-container");

        const nameInput = document.createElement("input");
        nameInput.classList.add("provider-select-provider-name");
        nameInput.value = provider.name;
        nameInput.placeholder = Translations.provider_name_placeholder;
        nameInput.value = provider.name;
        nameInput.addEventListener("input", (e) => provider.name = e.target.value)

        const urlInput = document.createElement("input");
        urlInput.classList.add("provider-select-provider-url");
        urlInput.value = provider.url;
        urlInput.placeholder = Translations.provider_url_placeholder;
        urlInput.value = provider.url;
        urlInput.addEventListener("input", (e) => provider.url = e.target.value)

        const portInput = document.createElement("input");
        portInput.classList.add("provider-select-provider-port");
        portInput.value = provider.port;
        portInput.placeholder = Translations.provider_port_placeholder;
        portInput.value = provider.port;
        portInput.type = "number";
        portInput.addEventListener("input", (e) => provider.port = e.target.value)

        const tokenInput = document.createElement("input");
        tokenInput.classList.add("provider-select-provider-token");
        tokenInput.value = provider.token;
        tokenInput.placeholder = Translations.provider_token_placeholder;
        tokenInput.value = provider.token;
        tokenInput.addEventListener("input", (e) => provider.token = e.target.value)

        const listEndpointInput = document.createElement("input");
        listEndpointInput.classList.add("provider-select-provider-list-endpoint");
        listEndpointInput.value = provider.listEndpoint;
        listEndpointInput.placeholder = Translations.provider_list_endpoint_placeholder;
        listEndpointInput.value = provider.listEndpoint;
        listEndpointInput.addEventListener("input", (e) => provider.listEndpoint = e.target.value)

        const chatEndpointInput = document.createElement("input");
        chatEndpointInput.classList.add("provider-select-provider-chat-endpoint");
        chatEndpointInput.value = provider.chatEndpoint;
        chatEndpointInput.placeholder = Translations.provider_chat_endpoint_placeholder;
        chatEndpointInput.value = provider.chatEndpoint;
        chatEndpointInput.addEventListener("input", (e) => provider.chatEndpoint = e.target.value)

        const removeButton = new Button(container, {
            identifier: "provider-select-provider-remove-button",
            text: Translations.remove,
            icon: ICONS.TRASHCAN,
            className: "prominent-button centered secondary",
            onClick: (event) => {
                event?.stopPropagation();
                container.remove();
                this._selectedProviders = this._selectedProviders.filter(p => p !== provider);
            }
        })

        container.appendChild(nameInput);
        container.appendChild(urlInput);
        container.appendChild(portInput);
        container.appendChild(tokenInput);
        container.appendChild(listEndpointInput);
        container.appendChild(chatEndpointInput);
        removeButton.parentContainer = container;
        removeButton.render();

        this._listContainer.appendChild(container);
        return container;
    }

    render() {
        if (!this._parentContainer) throw new Error("Parent container needs to be set before rendering");
        this._parentContainer.appendChild(this._container);
    }
}