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
import {Languages, setTranslations, Translations} from "../Static/i18n.js";

export class SettingsManager {
    static accentColor = undefined;
    static _debugMode;
    static providers = [];
    static _language = "en";
    static get language() { return SettingsManager._language; }
    static set language(value) {
        if (!Languages.includes(value)) {
            Popup.error(Translations.invalid_language, Translations.language_not_supported);
            value = "en";
        }
        SettingsManager._language = value;
        localStorage.setItem("language", value);
        setTranslations(value);
    }

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
        // Providers loaded from the backend carry an id, rows added in the settings modal don't
        const newProviders = providers.filter(provider => !provider.id);
        SettingsManager.providers = providers;
        if (newProviders.length === 0) return;
        API_ADAPTER.addLlmProviders(newProviders)
            .then(() => LlmProviderManager.loadProviders())
            .then(() => {
                Popup.debug(Translations.success, Translations.providers_added);
            })
            .catch(reason => {
                Popup.error(Translations.could_not_add_providers, reason);
            })
        localStorage.setItem("provider-urls", JSON.stringify(providers));
    }

    static loadSettings() {
        const language = localStorage.getItem("language") ?? "en";
        const accentColor = localStorage.getItem("accent-color") ?? "";
        const providers = JSON.parse(localStorage.getItem("provider-urls") ?? "[]");
        const debugMode = localStorage.getItem("debug-mode") === "true";

        SettingsManager.language = language;
        setTranslations(language);
        SettingsManager.accentColor = accentColor;
        SettingsManager.providers = providers;
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
            placeholder: Translations.username,
            initialValue: userService.user.username,
            label: Translations.username,
        })

        const providerInput = new ProviderSelect(undefined, {
            identifier: "provider-select",
            placeholder: Translations.provider_placeholder,
            initialValue: LlmProviderManager.Providers,
        });

        const pingDisplay = new BodyText(undefined, {
            // TODO: live updates would be nice
            text: `${Translations.last_ping}: ${WebSocketManager.ping}ms`,
        });

        const clearCacheButton = new Button(undefined, {
            identifier: "test-http-connection-button",
            text: Translations.check_backend_availability,
            onClick: async () => {
                const httpOk = await API_ADAPTER.ensureBackendConnection();
                if (httpOk) Popup.debug(Translations.connected, Translations.backend_reachable);
                else Popup.error(Translations.unreachable, Translations.backend_unreachable);

                try {
                    await WebSocketManager.connectOrFail();
                    Popup.debug(Translations.connected, Translations.websocket_reachable);
                } catch (e) {
                    Popup.error(Translations.unreachable, Translations.websocket_unreachable);
                }
            }
        });

        const requestNotificationButton = new Button(undefined, {
            identifier: "request-notification-button",
            text: Translations.request_notification,
            onClick: async () => {
                WebSocketManager.send("notification", undefined);
            }
        })

        const layout = new PageLayout([
            {
                icon: ICONS.SETTINGS,
                name: Translations.general_settings,
                title: Translations.general,
                components: [usernameInput]
            },
            {
                icon: ICONS.SERVER,
                name: Translations.provider_settings,
                title: Translations.providers,
                components: [providerInput]
            },
            {
                icon: ICONS.DEVELOPER_SETTINGS,
                name: Translations.developer_settings,
                title: Translations.developer,
                components: [pingDisplay, clearCacheButton, requestNotificationButton]
            }
        ], options);

        const settingsModal = new Modal(Translations.settings, [
                layout,
                new GridLayout(undefined, {
                    identifier: "settings-buttons-grid",
                    columns: 2,
                    rows: 1,
                    components: [
                        new Button(undefined, {
                            identifier: "settings-modal-submit",
                            className: "prominent-button tertiary centered",
                            text: Translations.save_settings,
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
                            text: Translations.cancel,
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