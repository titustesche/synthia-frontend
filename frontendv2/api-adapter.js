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
    createConversation: (conversation) => {
        return fetch(`${API_ADAPTER.api_url}/conversation/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                conversationDto: conversation,
            }),
        })
            .then(async response => {
                if (!response.ok) throw new Error(await response.text());
                return await response.json();
            });
    },
    async getConversations() {
        return fetch(`${API_ADAPTER.api_url}/conversation/list-owned/${userService.user.id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) return [];
                    throw new Error(response.statusText);
                }
                return response.json();
            })
    },
    getModels(providerUrls = []) {
        return fetch(`${API_ADAPTER.api_url}/model/list`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
    },
    getMessages(conversationId) {
        return fetch(`${API_ADAPTER.api_url}/message/list/${conversationId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) return [];
                    throw new Error(response.statusText);
                }
                return response.json();
            })
    },
    sendMessage: (message, model) => {
        return fetch(`${API_ADAPTER.api_url}/message/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({messageDto: message, model: model}),
        })
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
    },
    createLlmProvider: (provider) => {
        return fetch(`${API_ADAPTER.api_url}/llm-provider/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({provider: provider}),
        })
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
    },
    getLlmProviders: () => {
        return fetch(`${API_ADAPTER.api_url}/llm-provider/list`, {
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