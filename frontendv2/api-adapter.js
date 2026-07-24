import {userService} from "./Services/UserService.js";

export const API_ADAPTER = {
    api_url: "http://localhost:5116",

    ensureBackendConnection: async () => {
        const res = await fetch(`${API_ADAPTER.api_url}/status`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        return res.ok;

    },

    verifyUser: (email, password) => {
        return fetch(`${API_ADAPTER.api_url}/user/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                token: "abcdef-1234-ghijk-5678"
            }),
        }).then(response => {
            return response.ok;
        })
    },
    loginUser: (email, password) => {
        return fetch(`${API_ADAPTER.api_url}/user/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password
            }),
        })
            .then(response => {
                if (!response.ok) throw new Error("Could not login user");
                return response.json();
            })
    },
    createConversation: (conversationName) => {
        return fetch(`${API_ADAPTER.api_url}/conversation/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: conversationName,
                uuid: userService.user.uuid
            }),
        })
            .then(response => {
                if (!response.ok) throw new Error("Could not create conversation");
                return response.json();
            });
    },
    getConversations() {
        return fetch(`${API_ADAPTER.api_url}/conversation/list-owned/${userService.user.uuid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
    }
}