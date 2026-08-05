import {DomRegister} from "../Static/DomRegister.js";
import {TextInput} from "../Components/TextInput.js";
import {Button} from "../Components/Button.js";
import {ICONS} from "../Static/Icons.js";
import {SettingsManager} from "../Managers/SettingsManager.js";
import {ConversationManager} from "../Managers/ConversationManager.js";

export const SidebarService = {
    controlsContainer: undefined,
    conversationContainer: null,
    conversations: [],

    setupSidebar: () => {
        if (!DomRegister.sidebarContainer) throw new Error("Sidebar container not found");
        SidebarService.controlsContainer = document.createElement("div");
        SidebarService.controlsContainer.classList.add("sidebar-controls");

        const createConversationButton = new Button(SidebarService.controlsContainer, {
            icon: ICONS.CREATE,
            identifier: "create-conversation-button",
            text: "New Conversation",
            className: "prominent-button",
            onClick: async () => {
                await new Promise(resolve => setTimeout(resolve, 1));
                const name = new TextInput(undefined, {
                    identifier: "conversation-name",
                    placeholder: "Conversation Name",
                    censorInput: false
                });

                ConversationManager.ClearActiveConversation();
            }
        });

        const settingsButton = new Button(SidebarService.controlsContainer, {
            icon: ICONS.SETTINGS,
            identifier: "settings-button",
            className: "prominent-button secondary",
            text: "Settings",
            onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                SettingsManager.openSettingsModal();
            }
        });

        settingsButton.render();
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

        if (!anyConversations) return SidebarService.conversationContainer.innerHTML = "<p class='sidebar-info-text'>No conversations found</p>";

        conversations.sort((a, b) => b.lastInteraction - a.lastInteraction);

        conversations.forEach(conversation => {
            SidebarService.conversationContainer.appendChild(conversation.createSidebarEntry());
            SidebarService.conversations.push(conversation);
        });
    }
};