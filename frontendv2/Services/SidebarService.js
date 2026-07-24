import {DomRegister} from "./DomRegister.js";
import {TextInput} from "../Components/TextInput.js";
import {Modal} from "../Components/Modal.js";
import {Button} from "../Components/Button.js";
import {API_ADAPTER} from "../api-adapter.js";
import {Popup} from "../Components/Popup.js";
import {ICONS} from "../Static/Icons.js";

export const SidebarService = {
    controlsContainer: undefined,
    conversationContainer: null,
    conversations: [],

    setupSidebar: () => {
        if (!DomRegister.sidebarContainer) throw new Error("Sidebar container not found");
        SidebarService.controlsContainer = document.createElement("div");
        SidebarService.controlsContainer.classList.add("sidebar-controls");
        const createConversationButton = new Button(SidebarService.controlsContainer, {
            icon: ICONS.createIcon,
            identifier: "create-conversation",
            text: "New Conversation",
            onClick: async () => {
                await new Promise(resolve => setTimeout(resolve, 1));
                const name = new TextInput(undefined, {
                    identifier: "conversation-name",
                    placeholder: "Conversation Name",
                    censorInput: false
                });

                const modal = new Modal("Create Conversation", [name, new Button(undefined,{
                    identifier: "submit",
                    text: "Create",
                    onClick: async () => {
                        try {
                            if (!name.value) throw new Error("Name is required");
                            API_ADAPTER.createConversation(name.value)
                                .then(() => {
                                    // SidebarService.setConversations([...SidebarService.conversations, conversations]);
                                    modal.destroy();
                                })
                                .catch((reason) => {
                                    Popup.error("Could not create conversation", reason);
                                })
                        }
                        catch (e) {
                            Popup.error("Could not create conversation", e.message);
                        }
                    }
                })], {
                    canBeClosedManually: true
                });
                await modal.render();
            }
        });
        createConversationButton.render();

        DomRegister.sidebarContainer.appendChild(SidebarService.controlsContainer);

        SidebarService.conversationContainer = document.createElement("div");
        SidebarService.conversationContainer.classList.add("conversation-container");
        DomRegister.sidebarContainer.appendChild(SidebarService.conversationContainer);
    },

    setConversations: (conversations) => {
        if (!SidebarService.conversationContainer) throw new Error("Conversation container not found, did you forget to call setupSidebar()?");
        SidebarService.conversationContainer.innerHTML = "";

        const anyConversations = conversations.length > 0;
        SidebarService.conversationContainer.classList.toggle("empty", !anyConversations);

        if (!anyConversations) SidebarService.conversationContainer.innerHTML = "<p class='sidebar-info-text'>No conversations found</p>";

        conversations.forEach(conversation => {
            const conversationElement = document.createElement("div");
            conversationElement.classList.add("conversation-entry");
            conversationElement.innerText = conversation.name;
            SidebarService.conversationContainer.appendChild(conversationElement);

            SidebarService.conversations.push(conversation);
        });
    }
};