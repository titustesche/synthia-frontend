import {Popup} from "./Popup.js";
import {ConversationManager} from "../Managers/ConversationManager.js";
import {DomRegister} from "../Static/DomRegister.js";
import {API_ADAPTER} from "../api-adapter.js";
import {Message} from "./Message.js";
import {ContextMenu} from "./ContextMenu.js";
import {ICONS} from "../Static/Icons.js";

export class Conversation {
    _container;

    _containerText;

    _messageContainer;
    get messageContainer() { return this._messageContainer; }
    set messageContainer(value) { this._messageContainer = value; }

    _synchronized = false;
    get synchronized() { return this._synchronized; }
    set synchronized(value) { this._synchronized = value; }

    _id;
    get id() { return this._id; }
    set id(value) { this._id = value; }

    _name;
    get name() { return this._name; }
    set name(value) {
        if (this._containerText) this._containerText.innerText = value;
        this._name = value;
    }

    // Todo:
    //      - Obviously update the private array
    //      - for each new message, check if it already exists based on id - hash map?
    //          - if it does, update content
    //          - else create and append
    _messages = [];
    get messages() { return this._messages; }
    set messages(value) {
        console.log(value);
        if (value.length > 0) {
            this._messageContainer.innerHTML = "";
            for (let message of value) {
                this._messageContainer.appendChild(message.createDomElement());
            }
        }
        if (ConversationManager._activeConversation?.id === this.id) {
            ConversationManager.Empty = value.length <= 0;
        }
        this._messages = value;
    }

    _owner;
    get owner() { return this._owner; }
    set owner(value) { this._owner = value; }

    _sharedUsers = [];
    get sharedUsers() { return this._sharedUsers; }
    set sharedUsers(value) { this._sharedUsers = value; }

    _lastInteraction;
    get lastInteraction() { return this._lastInteraction; }
    set lastInteraction(value) { this._lastInteraction = value; }

    _selectedModel;
    get selectedModel() { return this._selectedModel; }
    set selectedModel(value) { this._selectedModel = value; }

    constructor(conversation) {
        try {
            this.id = conversation.id;
            this.name = conversation.name;
            this.owner = conversation.owner;
            this.sharedUsers = conversation.sharedUsers;
            this.lastInteraction = new Date(conversation.lastInteraction);

            this.messageContainer = document.createElement("div");
            this.messageContainer.classList.add(`conversation-message-container`);
            this.messageContainer.id = `conversation-message-container-${this.id}`;
        } catch (e) {
            Popup.debug("Could not parse conversation", e);
        }
    }

    createSidebarEntry() {
        if (this._container) return this._container;
        this._container = document.createElement("div");
        this._container.classList.add("conversation-entry");

        this._containerText = document.createElement("div");
        this._containerText.classList.add("conversation-entry-text");
        this._containerText.innerText = this.name;
        this._container.appendChild(this._containerText);

        const optionsMenu = document.createElement("div");
        optionsMenu.classList.add("conversation-entry-options");
        optionsMenu.classList.add("icon-container");
        optionsMenu.innerHTML = ICONS.DOTTED_MENU;
        optionsMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            const menu = new ContextMenu(optionsMenu, {
                sections: [
                    {
                        name: "basic",
                        items: [
                            {
                                text: "Delete",
                                onClick: async () => {
                                    ConversationManager.DeleteConversation(this.id);
                                }
                            },
                            {
                                text: "Rename",
                                onClick: async () => {
                                    console.log(`Conversation ${this._id} needs to be renamed`);
                                }
                            }
                        ]
                    }
                ]
            });

            menu.position = { x: e.clientX, y: e.clientY };
            menu.render();
        })
        this._container.appendChild(optionsMenu);

        this._container.addEventListener("click", () => ConversationManager.SetActiveConversation(this.id));
        return this._container;
    }

    async fetchMessages() {
        try {
            const messages = await API_ADAPTER.getMessages(this.id);
            if (messages.length > 0) {
                for (const message of messages) {
                    const newMessage = new Message(message);
                    this.messages.push(newMessage);
                    this._messageContainer.appendChild(newMessage.createDomElement());
                }
            }
            this.synchronized = true;
        }

        catch (e) {
            Popup.debug("Could not fetch messages", e);
        }
    }

    async load() {
        if (!this.synchronized) await this.fetchMessages();
        if (!this._container) this.createSidebarEntry();

        console.log(this);
        DomRegister.messageContainer.appendChild(this._messageContainer);
        this._container.classList.add("active");
    }

    unload() {
        DomRegister.messageContainer.removeChild(this._messageContainer);
        this._container.classList.remove("active");
    }

    delete() {
        this._container.remove();
    }
}