import {Popup} from "./Popup.js";

export class Conversation {
    _id;
    get id() { return this._id; }
    set id(value) { this._id = value; }

    _name;
    get name() { return this._name; }
    set name(value) { this._name = value; }

    _messages = [];
    get messages() { return this._messages; }
    set messages(value) { this._messages = value; }

    _owner;
    get owner() { return this._owner; }
    set owner(value) { this._owner = value; }

    _sharedWith = [];
    get sharedWith() { return this._sharedWith; }
    set sharedWith(value) { this._sharedWith = value; }

    constructor(conversation) {
        try {
            this.id = conversation.id;
            this.name = conversation.name;
            this.messages = conversation.messages;
            this.owner = conversation.owner;
            this.sharedWith = conversation.sharedWith;
        } catch (e) {
            Popup.debug("Could not parse conversation", e);
        }
    }


}