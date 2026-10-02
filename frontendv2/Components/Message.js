import {Conversation} from "./Conversation.js";
import {ConversationManager} from "../Managers/ConversationManager.js";
import {Translations} from "../Static/i18n.js";

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
    get id() { return this._id; }
    _role;
    get role() { return this._role; }
    set role(value) { this._role = value; }
    _content;
    get content() { return this._content; }
    set content(value) {
        this._content = value;
        this._contentElement.innerText = value;
    }

    _thoughts = "";
    get thoughts() { return this._thoughts; }
    set thoughts(value) {
        this._thoughts = value;
        this._thoughtElement.innerText = this._thoughtsVisible ? value : Translations.thinking;
    }

    _thoughtsVisible = false;
    get thoughtsVisible() { return this._thoughtsVisible; }
    set thoughtsVisible(value) {
        this._thoughtsVisible = value;
        this._thoughtElement.innerText = value ? this._thoughts : Translations.thinking;
    }

    _conversation;
    set conversation(value) {
        if (this._parentContainer === value.messageContainer) return;
        this.parentContainer = value.messageContainer;
        this._conversation = value;
    }
    get conversation() { return this._conversation; }

    _timestamp;
    get timestamp() { return this._timestamp; }
    set timestamp(value) { this._timestamp = value; }

    constructor(message) {
        this._id = message.id;
        this._role = message.role;
        this._content = message.content;
        this._timestamp = message.timestamp;

        this._container = document.createElement("div");
        this._container.classList.add("message-container");
        this._container.classList.add(`message-role-${this._role}`);
        this._container.id = `message-container-${this._id}`;

        this._thoughtElement = document.createElement("div");
        this._thoughtElement.classList.add("message-thought");
        this._thoughtElement.innerText = this._thoughts;
        this._thoughtElement.addEventListener("click", () => this.thoughtsVisible = !this.thoughtsVisible);
        this._container.appendChild(this._thoughtElement);

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
    }

    getContainer() {
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
            thoughts: this._thoughts,
            timestamp: new Date(this._timestamp).toISOString(),
            conversation: {
                id: this._conversation.id,
                name: this._conversation.name,
                owner: this._conversation.owner,
                sharedWith: this._conversation.sharedWith,
            },
        }
    }

    update(message) {
        this._id = message.Id;
        this.role = message.Role;
        this.content = message.Content ?? "";
        this.thoughts = message.Thoughts ?? "";
        this.timestamp = message.Timestamp ?? new Date().toISOString();
        const conversation = ConversationManager.Conversations.find(c => c.id === message.Conversation.id);
        if (conversation) {
            this.conversation = conversation;
            conversation.lastInteraction = new Date(this.timestamp);
            conversation._updateHeight(true);
        }
    }

    static fromPrompt(prompt) {
        return new Message({
            role: CHAT_ROLES.USER,
            content: prompt,
            timestamp: new Date().toISOString(),
        });
    }
}