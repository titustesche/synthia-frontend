import {Modal} from "./Components/Modal.js";
import {userService as UserService} from "./Services/UserService.js";
import {API_ADAPTER} from "./api-adapter.js";
import {TextInput} from "./Components/TextInput.js";
import {Button} from "./Components/Button.js";
import { Popup } from "./Components/Popup.js";
import {SidebarService} from "./Services/SidebarService.js";
import {ICONS} from "./Static/Icons.js";
import {HeaderService} from "./Services/HeaderService.js";
import {SettingsManager} from "./Managers/SettingsManager.js";
import {Conversation} from "./Components/Conversation.js";
import {PromptInput} from "./Managers/PromptInputManager.js";
import {ConversationManager} from "./Managers/ConversationManager.js";
import {LlmProviderManager} from "./Managers/LLMProviderManager.js";
import {WebSocketManager} from "./Managers/WebSocketManager.js";
import {BodyText} from "./Components/BodyText.js";
import {Translations} from "./Static/i18n.js";

window.onload = async () => {
    let httpOk = await API_ADAPTER.ensureBackendConnection();
    let wsOk = false;

    SettingsManager.loadSettings();

    try {

        if (!httpOk) throw new Error("HTTP connection failed");
        await WebSocketManager.connectOrFail();
        wsOk = true;
    }
    catch (e) {
        await new Modal(Translations.could_not_connect_to_backend, [
            new BodyText(undefined, {
                identifier: "http-status",
                text: httpOk ? Translations.http_ok : Translations.http_unreachable,
                className: "http-status"
            }),
            new BodyText(undefined, {
                identifier: "ws-status",
                text: wsOk ? Translations.ws_ok : Translations.ws_disconnected,
                className: "ws-status"
            })
        ], { canBeClosedManually: false }).render();
        return;
    }

    SidebarService.setupSidebar();
    HeaderService.setupHeader();

    await UserService.ensureLogin();
    if (!UserService.isLoggedIn) {
        const emailInput = new TextInput(undefined, {
            identifier: "email",
            placeholder: Translations.email_placeholder,
            censorInput: false
        });
        const passwordInput = new TextInput(undefined, {
            identifier: "password",
            placeholder: Translations.password_placeholder,
            censorInput: true
        });
        Popup.debug(Translations.not_logged_in, Translations.not_logged_in_message);
        const modal =  new Modal(Translations.login_modal_title, [emailInput, passwordInput,
            new Button(undefined, {
                icon: ICONS.CREATE,
                identifier: "submit",
                text: Translations.login,
                onClick: async () => {
                    const email = emailInput.value;
                    const password = passwordInput.value;

                    if (!email || !password) {
                        Popup.error(Translations.invalid_credentials, Translations.invalid_credentials_message);
                        return;
                    }

                    await UserService.login(emailInput.value, passwordInput.value);

                    if (UserService.isLoggedIn) {
                        modal.destroy();
                    }
                }
            })
        ], { canBeClosedManually: false });
        await modal.render();
    }

    await LlmProviderManager.loadProviders();

    console.log(`Providers count: ${Object.keys(LlmProviderManager.Providers).length}`);
    console.log(LlmProviderManager.Providers);
    if (Object.keys(LlmProviderManager.Providers).length === 0) {
        await SettingsManager.openSettingsModal({
            selectedPage: Translations.provider_settings,
            canBeClosedManually: false,
        });
    }

    try {
        let conversations = await API_ADAPTER.getConversations();
        conversations = conversations.map((conversation) => new Conversation(conversation));
        ConversationManager.Conversations = conversations;

        let params = new URLSearchParams(window.location.search);
        if (params.has("conversation")) {
            await ConversationManager.SetActiveConversation(params.get("conversation"));
        }

        await PromptInput.init();
        await PromptInput.loadModels(SettingsManager.providers);
    }

    catch (e) {
        Popup.debug(Translations.initialization_failed, e.message);
    }
}