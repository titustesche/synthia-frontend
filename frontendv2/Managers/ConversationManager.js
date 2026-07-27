import {DomRegister} from "../Static/DomRegister.js";
import {SidebarService} from "../Services/SidebarService.js";
import {Popup} from "../Components/Popup.js";
import {Conversation} from "../Components/Conversation.js";
import {Message} from "../Components/Message.js";
import {userService} from "../Services/UserService.js";
import {API_ADAPTER} from "../api-adapter.js";
import {PromptInput} from "./PromptInputManager.js";

export class ConversationManager {
    static ChatContainer = DomRegister.chatContainer;
    static MessageContainer = DomRegister.messageContainer;
    static PromptInputContainer = DomRegister.promptInput.container;

    static _conversations = {};
    static _activeConversation = undefined;

    static SetModel(model) {
        if (this._activeConversation) this._activeConversation.selectedModel = model;
    }

    static set Conversations(value) {
        SidebarService.setConversations(value);
        this._conversations = value.reduce((acc, conversation) => {
            acc[conversation.id] = conversation;
            return acc;
        }, {});
    }

    static get Conversations() {
        // Return a copy of the conversations array
        return Object.values(this._conversations);
    }

    static _empty = false;
    static set Empty(value) {
        switch (value) {
            case true:
                this.ChatContainer.classList.add("empty");
                this.PromptInputContainer.classList.add("centered");
                this.PromptInputContainer.classList.remove("bottom");
                this._empty = true;
                break;

            case false:
                this.ChatContainer.classList.remove("empty");
                this.PromptInputContainer.classList.remove("centered");
                this.PromptInputContainer.classList.add("bottom");
                this._empty = false;
                break;
        }
    }

    static ClearActiveConversation() {
        if (this._activeConversation) {
            this._activeConversation.unload();
            this._activeConversation = undefined;
            this.Empty = true;
        }
    }

    static async SetActiveConversation(conversationId) {
        if (this._activeConversation) this._activeConversation.unload();

        if (this._conversations[conversationId]) {
            const conversation = this._conversations[conversationId];
            await conversation.load();
            this._activeConversation = conversation;

            if (conversation.selectedModel) {
                console.log(`Setting model for ${conversation.name} to ${conversation.selectedModel?.name}`);
                PromptInput.SetModel(conversation.selectedModel.name);
            }
            else {
                console.log(`No model selected for ${conversation.name}, using ${PromptInput.GetSelectedModel()}`);
                conversation.selectedModel = PromptInput.GetSelectedModel();
            }

            this.Empty = conversation.messages.length === 0;
            return;
        }

        throw new Error("Conversation does not exist");
    }

    static async CreateConversation(conversation) {
        let conversationObject;
        await API_ADAPTER.createConversation(conversation)
            .then(response => {
                conversationObject = new Conversation(response);
            })
            .catch(reason => {
                Popup.error("Could not create conversation", reason);
                conversationObject = undefined;
            });

        if (!conversationObject) console.log("Conversation object was undefined");

        this._conversations[conversationObject.id] = conversationObject;
        console.log(this.Conversations);
        SidebarService.setConversations(this.Conversations);
        return conversationObject;
    }

    static async SendMessage(message, model) {
        if (!this._activeConversation) {
            // Returns an api response
            const conversation = await this.CreateConversation({
                name: "Generated Conversation",
                owner: userService.user,
            });

            if (!conversation) return Popup.debug("Debug", "Conversation Object was undefined");

            await this.SetActiveConversation(conversation.id);
            this.Empty = false;
        }

        message.conversation = this._activeConversation;

        const provider = this._activeConversation.selectedModel?.provider;

        await API_ADAPTER.sendMessage(message.toApiMessage(), model, provider)
            .then(response => {
                message = new Message(response);
                this._activeConversation.messages = [...this._activeConversation.messages, message];
                this._activeConversation.lastInteraction = new Date(message.timestamp);
                SidebarService.setConversations(this.Conversations);
                this.Empty = false;
            })
            .catch(reason => {
                Popup.error("Could not send message", reason);
            })
    }
}