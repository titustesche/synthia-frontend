import {Modal} from "./Components/Modal.js";
import {userService as UserService} from "./Services/UserService.js";
import {API_ADAPTER} from "./api-adapter.js";
import {TextInput} from "./Components/TextInput.js";
import {Button} from "./Components/Button.js";
import { Popup } from "./Components/Popup.js";
import {SidebarService} from "./Services/SidebarService.js";
import {ICONS} from "./Static/Icons.js";
import {HeaderService as HeaderServide} from "./Services/HeaderService.js";
import {SettingsManager} from "./Services/SettingsManager.js";

window.onload = async () => {
    try { await API_ADAPTER.ensureBackendConnection(); }
    catch (e) {
        await new Modal("Could not connect to backend", [], { canBeClosedManually: false }).render();
        return;
    }

    SettingsManager.loadSettings();
    SidebarService.setupSidebar();
    HeaderServide.setupHeader();

    await UserService.ensureLogin();
    if (!UserService.isLoggedIn) {
        const emailInput = new TextInput(undefined, {
            identifier: "email",
            placeholder: "Email Address",
            censorInput: false
        });
        const passwordInput = new TextInput(undefined, {
            identifier: "password",
            placeholder: "Password",
            censorInput: true
        });
        Popup.debug("Not logged in", "You need to login first to access this page");
        const modal =  new Modal("You need to log in", [emailInput, passwordInput,
            new Button(undefined, {
                icon: ICONS.createIcon,
                identifier: "submit",
                text: "Login",
                onClick: async () => {
                    const email = emailInput.value;
                    const password = passwordInput.value;

                    if (!email || !password) {
                        Popup.error("Invalid Credentials", "Please enter valid Email and Password");
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

    try {
        // Todo: Conversation Manager
        const conversations = await API_ADAPTER.getConversations();
        SidebarService.setConversations(conversations);
    }

    catch (e) {
        Popup.debug("Fetching Conversations failed", e.message);
    }
}