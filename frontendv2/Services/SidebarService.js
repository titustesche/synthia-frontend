import {DomRegister} from "../Static/DomRegister.js";
import {TextInput} from "../Components/TextInput.js";
import {Modal} from "../Components/Modal.js";
import {Button} from "../Components/Button.js";
import {API_ADAPTER} from "../api-adapter.js";
import {Popup} from "../Components/Popup.js";
import {ICONS} from "../Static/Icons.js";
import {SettingsManager} from "../Managers/SettingsManager.js";
import {ConversationManager} from "../Managers/ConversationManager.js";
import {PageLayout} from "../Components/PageLayout.js";
import {userService} from "./UserService.js";
import {GridLayout} from "../Components/GridLayout.js";
import {ProviderSelect} from "../Components/ProviderSelect.js";
import {LlmProviderManager} from "../Managers/LLMProviderManager.js";
import {WebSocketManager} from "../Managers/WebSocketManager.js";

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
            icon: ICONS.SETTINGS,
            identifier: "settings-button",
            className: "prominent-button secondary",
            text: "Settings",
            onClick: async () => {
                await new Promise(resolve => setTimeout(resolve, 1));

                const usernameInput = new TextInput(undefined, {
                    identifier: "username",
                    placeholder: "Username",
                    initialValue: userService.user.username,

                })

                const providerInput = new ProviderSelect(undefined, {
                    identifier: "provider-select",
                    placeholder: "Provider",
                    initialValue: LlmProviderManager.Providers,
                })

                const clearCacheButton = new Button(undefined, {
                    identifier: "test-http-connection-button",
                    text: "Check Backend Availability",
                    onClick: async () => {
                        const httpOk = await API_ADAPTER.ensureBackendConnection();
                        if (httpOk) Popup.debug("Connected", "Backend is reachable");
                        else Popup.error("Unreachable", "Backend is unreachable");

                        try {
                            WebSocketManager.connectOrFail();
                            Popup.debug("Connected", "WebSocket is reachable");
                        } catch (e) {
                            Popup.error("Unreachable", "WebSocket is unreachable");
                        }
                    }
                });

                const layout = new PageLayout([
                    {
                        icon: ICONS.SETTINGS,
                        name: "General Settings",
                        title: "General",
                        components: [usernameInput]
                    },
                    {
                        icon: ICONS.SERVER,
                        name: "Provider Settings",
                        title: "Providers",
                        components: [providerInput]
                    },
                    {
                        icon: ICONS.DEVELOPER_SETTINGS,
                        name: "Developer Settings",
                        title: "Developer",
                        components: [clearCacheButton]
                    }
                ]);

                const settingsModal = new Modal("Settings", [
                    layout,
                    new GridLayout(undefined, {
                        identifier: "settings-buttons-grid",
                        columns: 2,
                        rows: 1,
                        components: [
                            new Button(undefined, {
                                identifier: "settings-modal-submit",
                                className: "prominent-button tertiary centered",
                                text: "Save settings",
                                onClick: () => {
                                    const providers = providerInput.selectedProviders;
                                    SettingsManager.setProviderUrls(providers);
                                    SettingsManager.applySettings();
                                    settingsModal.destroy();
                                }
                            }),
                            new Button(undefined, {
                                identifier: "settings-modal-cancel",
                                className: "prominent-button secondary centered",
                                text: "Cancel",
                                onClick: () => {
                                    settingsModal.destroy();
                                }
                            })
                        ]})
                    ]
                    );

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