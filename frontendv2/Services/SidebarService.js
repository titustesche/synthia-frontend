import {DomRegister} from "../Static/DomRegister.js";
import {TextInput} from "../Components/TextInput.js";
import {Modal} from "../Components/Modal.js";
import {Button} from "../Components/Button.js";
import {API_ADAPTER} from "../api-adapter.js";
import {Popup} from "../Components/Popup.js";
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
            icon: ICONS.createIcon,
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

                /*
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
                 */
            }
        });

        const settingsButton = new Button(SidebarService.controlsContainer, {
            icon: ICONS.settingsIcon,
            identifier: "settings-button",
            className: "prominent-button secondary",
            text: "Settings",
            onClick: async () => {
                await new Promise(resolve => setTimeout(resolve, 1));
                const providerUrlInput = new TextInput(undefined, {
                    identifier: "provider-url",
                    placeholder: "Provider URLs divided by ,",
                    initialValue: SettingsManager.providerUrls.join(", "),
                    censorInput: false,
                    initialState: SettingsManager.providerUrls.join(", ")
                })
                const settingsModal = new Modal("Settings", [
                    providerUrlInput,
                new Button(undefined, {
                    identifier: "settings-modal-submit",
                    className: "prominent-button tertiary",
                    text: "Save settings",
                    onClick: () => {
                        const urls = providerUrlInput.value.split(",").map(url => url.trim());
                        SettingsManager.setProviderUrls(urls);
                        settingsModal.destroy();
                    }
                })]);

                await settingsModal.render();
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