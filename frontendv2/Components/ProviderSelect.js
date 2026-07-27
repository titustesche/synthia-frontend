import {Button} from "./Button.js";
import {ICONS} from "../Static/Icons.js";

export class ProviderSelect {
    _parentContainer;
    set parentContainer(value) { this._parentContainer = value; }

    _container;
    _listContainer;
    _addButton;

    _providerContainers = [];

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
        this._addButton.innerHTML = "Add Provider";
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
            this.createProviderContainer(provider);
        }
    }

    createProviderContainer(provider) {
        const container = document.createElement("div");
        container.classList.add("provider-select-provider-container");

        const nameInput = document.createElement("input");
        nameInput.classList.add("provider-select-provider-name");
        nameInput.value = provider.name;
        nameInput.placeholder = "Provider Name";
        nameInput.value = provider.name;

        const urlInput = document.createElement("input");
        urlInput.classList.add("provider-select-provider-url");
        urlInput.value = provider.url;
        urlInput.placeholder = "http://localhost";
        urlInput.value = provider.url;

        const portInput = document.createElement("input");
        portInput.classList.add("provider-select-provider-port");
        portInput.value = provider.port;
        portInput.placeholder = "11434";
        portInput.value = provider.port;
        portInput.type = "number";

        const tokenInput = document.createElement("input");
        tokenInput.classList.add("provider-select-provider-token");
        tokenInput.value = provider.token;
        tokenInput.placeholder = "Token";
        tokenInput.value = provider.token;

        const listEndpointInput = document.createElement("input");
        listEndpointInput.classList.add("provider-select-provider-list-endpoint");
        listEndpointInput.value = provider.listEndpoint;
        listEndpointInput.placeholder = "api/tags";
        listEndpointInput.value = provider.listEndpoint;

        const chatEndpointInput = document.createElement("input");
        chatEndpointInput.classList.add("provider-select-provider-chat-endpoint");
        chatEndpointInput.value = provider.chatEndpoint;
        chatEndpointInput.placeholder = "api/chat";
        chatEndpointInput.value = provider.chatEndpoint;

        const removeButton = new Button(container, {
            identifier: "provider-select-provider-remove-button",
            text: "Remove",
            icon: ICONS.TRASHCAN,
            className: "prominent-button centered secondary",
            onClick: (event) => {
                event?.stopPropagation();
                container.remove();
                delete this._providerContainers[provider.name];
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
        this._providerContainers[provider.name] = container;
        return container;
    }

    render() {
        if (!this._parentContainer) throw new Error("Parent container needs to be set before rendering");
        this._parentContainer.appendChild(this._container);
    }
}