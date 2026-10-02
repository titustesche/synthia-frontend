import {DomRegister} from "../Static/DomRegister.js";
import {SidebarService} from "../Services/SidebarService.js";
import {Popup} from "../Components/Popup.js";
import {Conversation} from "../Components/Conversation.js";
import {Message} from "../Components/Message.js";
import {userService} from "../Services/UserService.js";
import {API_ADAPTER} from "../api-adapter.js";
import {PromptInput} from "./PromptInputManager.js";
import {Translations} from "../Static/i18n.js";

export class ConversationManager {
    static ChatContainer = DomRegister.chatContainer;
    static MessageContainer = DomRegister.messageContainer;
    static PromptInputContainer = DomRegister.promptInput.container;

    static _conversations = {};
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
    static _activeConversation = undefined;

    static SetModel(model) {
        if (this._activeConversation) this._activeConversation.selectedModel = model;
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
                PromptInput.Model  = conversation.selectedModel;
            }
            else {
                console.log(`No model selected for ${conversation.name}, using ${PromptInput.Model}`);
                conversation.selectedModel = PromptInput.Model;
            }

            this.Empty = conversation.messages.length === 0;
            const params = new URLSearchParams(window.location.search);
            if (params.get("conversation")) {
                params.set("conversation", conversationId);
                window.history.replaceState({}, "", `?${params.toString()}`);
            } else {
                window.history.pushState({}, "", `?conversation=${conversationId}`);
            }
            return;
        }

        throw new Error(Translations.conversation_does_not_exist);
    }

    static GetConversationFromId(conversationId) {
        return this._conversations[conversationId];
    }

    static async CreateConversation(conversation) {
        let conversationObject;
        await API_ADAPTER.createConversation(conversation)
            .then(response => {
                conversationObject = new Conversation(response);
            })
            .catch(reason => {
                Popup.error(Translations.could_not_create_conversation, reason);
                conversationObject = undefined;
            });

        if (!conversationObject) return undefined;

        this._conversations[conversationObject.id] = conversationObject;
        console.log(this.Conversations);
        SidebarService.setConversations(this.Conversations);
        return conversationObject;
    }

    static DeleteConversation(conversationId) {
        API_ADAPTER.deleteConversation(conversationId)
            .then(() => {
                const conversation = this._conversations[conversationId];
                if (this._activeConversation?.id === conversationId) this.ClearActiveConversation();
                delete this._conversations[conversationId];
                conversation.delete();
                SidebarService.setConversations(this.Conversations);
            })
            .catch(reason => {
                Popup.error(Translations.deleting_failed, reason);
            })
    }

    static async SendMessage(message, model) {
        if (!this._activeConversation) {
            // Returns an api response
            const conversation = await this.CreateConversation({
                name: Translations.generated_conversation,
                owner: userService.user,
            });

            if (!conversation) throw new Error(Translations.could_not_create_conversation);

            await this.SetActiveConversation(conversation.id);
            this.Empty = false;
        }

        message.conversation = this._activeConversation;

        const provider = model.provider;

        await API_ADAPTER.sendMessage(message.toApiMessage(), model, provider);
    }

    static async AddMessage(messageDto) {
        console.log("Need to create message")
        const conversation = this.GetConversationFromId(messageDto.Conversation.Id);
        if (!conversation) {
            Popup.error(Translations.could_not_find_conversation, messageDto.Conversation.Id);
            return;
        }

        const message = new Message({
            id: messageDto.Id,
            content: messageDto.Content,
            thoughts: messageDto.Thoughts,
            role: messageDto.Role,
            timestamp: messageDto.Timestamp,
        });

        conversation.addMessage(message);
    }

    static async UpdateMessage(messageDto) {
        const conversation = this.GetConversationFromId(messageDto.Conversation.Id);
        if (!conversation) {
            Popup.error(Translations.could_not_find_conversation, messageDto.Conversation.Id);
            return;
        }

        const message = conversation.messages.find(m => m.id === messageDto.Id);
        if (!message) return this.AddMessage(messageDto);

        messageDto.Conversation = conversation;
        message.update(messageDto);
    }
}