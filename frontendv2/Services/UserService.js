import {API_ADAPTER} from "../api-adapter.js";
import {Popup} from "../Components/Popup.js";
import {Translations} from "../Static/i18n.js";

export const userService = {
    isLoggedIn: false,
    user: { id: null, username: null, email: null },

    ensureLogin: async () => {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        if (loggedInUser) {
            if (
                loggedInUser.hasOwnProperty('id')
                && loggedInUser.hasOwnProperty('username')
                && loggedInUser.hasOwnProperty('email')
            ) {
                const isValid = await API_ADAPTER.verifyUser(loggedInUser.email, loggedInUser.token ?? "abcd-1234-efgh");
                if (isValid) {
                    userService.user = loggedInUser;
                    userService.isLoggedIn = true;
                }
                else {
                    localStorage.removeItem("user");
                }
            }
        }
    },

    login: async (email, password) => {
        try {
            const user = await API_ADAPTER.loginUser(email, password);
            if (
                user.hasOwnProperty('id')
                && user.hasOwnProperty('username')
                && user.hasOwnProperty('email')) {
                userService.user = user;
                localStorage.setItem("user", JSON.stringify(user));
                userService.isLoggedIn = true;
            }

            else {
                throw new Error(Translations.server_response_malformed);
            }
        }
        catch (e) {
            // logger.debug(e);
            Popup.debug(Translations.login_error, e);
        }
    },

    requestSessionToken: async (email, password) => {

    },
    refreshSessionToken: async () => {

    },
    logout: async () => {
        localStorage.removeItem("user");
        userService.isLoggedIn = false;
    },
}