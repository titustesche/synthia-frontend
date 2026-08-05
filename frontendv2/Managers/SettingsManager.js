import {API_ADAPTER} from "../api-adapter.js";
import {Popup} from "../Components/Popup.js";
import {GridLayout} from "../Components/GridLayout.js";
import {Button} from "../Components/Button.js";
import {WebSocketManager} from "./WebSocketManager.js";
import {LlmProviderManager} from "./LLMProviderManager.js";
import {ProviderSelect} from "../Components/ProviderSelect.js";
import {BodyText} from "../Components/BodyText.js";
import {TextInput} from "../Components/TextInput.js";
import {userService} from "../Services/UserService.js";
import {ICONS} from "../Static/Icons.js";
import {Modal} from "../Components/Modal.js";
import {PageLayout} from "../Components/PageLayout.js";

export class SettingsManager {
    static accentColor = undefined;
    static _debugMode;
    static providers = [];

    static get debugMode() { return SettingsManager._debugMode; }
    static set debugMode(value) {
        localStorage.setItem("debug-mode", value);
        SettingsManager._debugMode = value;
    }

    static setAccentColor(color) {
        SettingsManager.accentColor = color;
        localStorage.setItem("accent-color", color);
        document.documentElement.style.setProperty("--accent-color", color);
    }

    static setProviders(providers) {
        const newProviders = providers.filter(provider => !SettingsManager.providers.includes(provider));
        SettingsManager.providers = providers;
        API_ADAPTER.addLlmProviders(newProviders)
            .then(() => {
                Popup.debug("Success", "New providers have been added to database");
            })
            .catch(reason => {
                Popup.error("Could not add providers", reason);
            })
        localStorage.setItem("provider-urls", JSON.stringify(providers));
    }

    static loadSettings() {
        const accentColor = localStorage.getItem("accent-color");
        const providerUrls = localStorage.getItem("provider-urls");
        const debugMode = localStorage.getItem("debug-mode") ?? false;

        if (accentColor) SettingsManager.accentColor = accentColor;
        if (providerUrls) SettingsManager.providers = JSON.parse(providerUrls);
        SettingsManager._debugMode = debugMode;

        SettingsManager.applySettings();
    }

    static applySettings() {
        if (SettingsManager.accentColor) document.documentElement.style.setProperty("--accent-color", SettingsManager.accentColor);
    }

    static async openSettingsModal(options) {
        await new Promise(resolve => setTimeout(resolve, 1));

        const usernameInput = new TextInput(undefined, {
            identifier: "username",
            placeholder: "Username",
            initialValue: userService.user.username,
            label: "Username",
        })

        const providerInput = new ProviderSelect(undefined, {
            identifier: "provider-select",
            placeholder: "Provider",
            initialValue: LlmProviderManager.Providers,
        });

        const pingDisplay = new BodyText(undefined, {
            // TODO: live updates would be nice
            text: `Last Ping: ${WebSocketManager.ping}ms`,
        });

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

        const requestNotificationButton = new Button(undefined, {
            identifier: "request-notification-button",
            text: "Request Notification",
            onClick: async () => {
                WebSocketManager.send("notification", undefined);
            }
        })

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
                components: [pingDisplay, clearCacheButton, requestNotificationButton]
            }
        ], options);

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
                                SettingsManager.setProviders(providers);
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
}