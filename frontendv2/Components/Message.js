import {Conversation} from "./Conversation.js";

export class Message {
    //region DOM Objects
    _container;

    _parentContainer;
    set parentContainer(value) {
        value.appendChild(this._container);
        this._parentContainer = value;
    }
    //endregion

    _id;
    _chatRole;
    _content;
    _conversation;
    set conversation(value) {
        this.parentContainer = value.getContainer();
        this._conversation = value;
    }
    _timestamp;

    constructor(message) {
        this._id = message.id;
        this._chatRole = message.chatRole;
        this._content = message.content;
        if (typeof message.conversation === Conversation)
        this.conversation = message.conversation;


    }
}