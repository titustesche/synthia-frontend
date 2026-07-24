import {API_ADAPTER} from "../api-adapter.js";
import {Popup} from "../Components/Popup.js";

export const userService = {
    isLoggedIn: false,
    user: { uuid: null, username: null, email: null },

    ensureLogin: async () => {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        if (loggedInUser) {
            if (
                loggedInUser.hasOwnProperty('uuid')
                && loggedInUser.hasOwnProperty('username')
                && loggedInUser.hasOwnProperty('email')
            ) {
                const isValid = await API_ADAPTER.verifyUser(loggedInUser.email, loggedInUser.password);
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
                user.hasOwnProperty('uuid')
                && user.hasOwnProperty('username')
                && user.hasOwnProperty('email')) {
                userService.user = user;
                localStorage.setItem("user", JSON.stringify(user));
                userService.isLoggedIn = true;
            }

            else {
                throw new Error("Server response malformed");
            }
        }
        catch (e) {
            // logger.debug(e);
            Popup.debug("Error while logging in", e);
        }
    }
}