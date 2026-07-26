import {Conversation} from "./Conversation.js";

export const CHAT_ROLES = {
    USER: 0,
    ASSISTANT: 1,
    SYSTEM: 2,
}

export class Message {
    //region DOM Objects
    _container;

    _contentElement;
    _timestampElement;
    _controlsElement;

    _parentContainer;
    set parentContainer(value) {
        if (this._container) value.appendChild(this._container);
        this._parentContainer = value;
    }
    //endregion

    _id;
    _role;
    _content;
    _conversation;
    set conversation(value) {
        this.parentContainer = value.messageContainer;
        this._conversation = value;
    }

    _timestamp;
    get timestamp() { return this._timestamp; }
    set timestamp(value) { this._timestamp = value; }

    constructor(message) {
        this._id = message.id;
        this._role = message.role;
        this._content = message.content;
        this._timestamp = message.timestamp;

        if (typeof message.conversation === Conversation)
        this.conversation = message.conversation;
    }

    createDomElement() {
        if (this._container) return this._container;
        this._container = document.createElement("div");
        this._container.classList.add("message-container");
        this._container.classList.add(`message-role-${this._role}`);
        this._container.id = `message-container-${this._id}`;

        this._contentElement = document.createElement("div");
        this._contentElement.classList.add("message-content");
        this._contentElement.innerText = this._content;
        this._container.appendChild(this._contentElement);

        this._timestampElement = document.createElement("div");
        this._timestampElement.classList.add("message-timestamp");
        this._timestampElement.innerText = new Date(this._timestamp).toLocaleDateString("de-DE", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).replace(",", "");
        this._container.appendChild(this._timestampElement);

        this._controlsElement = document.createElement("div");
        this._controlsElement.classList.add("message-controls");
        this._container.appendChild(this._controlsElement);

        return this._container;
    }

    load() {
        this.parentContainer.appendChild(this._container);
    }
    unload() {
        this._container.remove();
    }

    toApiMessage() {
        return {
            id: this._id,
            chatRole: this._role,
            content: this._content,
            timestamp: new Date(this._timestamp).toISOString(),
            conversation: {
                id: this._conversation.id,
                name: this._conversation.name,
                owner: this._conversation.owner,
                sharedWith: this._conversation.sharedWith,
            },
        }
    }

    static fromPrompt(prompt) {
        return new Message({
            chatRole: CHAT_ROLES.USER,
            content: prompt,
            timestamp: new Date().toISOString(),
        });
    }
}