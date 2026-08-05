import {userService} from "./Services/UserService.js";

export class API_ADAPTER {
    static HTTPS = false;
    static API_URL = "localhost:5116";
    static API_HTTP_URL = `${API_ADAPTER.HTTPS ? "https" : "http"}://${API_ADAPTER.API_URL}`;
    static WS_URL = `${API_ADAPTER.HTTPS ? "wss" : "ws"}://${API_ADAPTER.API_URL}/ws`;

    static async ensureBackendConnection() {
        return await fetch(`${API_ADAPTER.API_HTTP_URL}/status`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                return response.ok;
            })
            .catch(() => false)
    }

    static verifyUser(email) {
        return fetch(`${API_ADAPTER.API_HTTP_URL}/user/verify`, {
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
    }

    static loginUser(email, password) {
        return fetch(`${API_ADAPTER.API_HTTP_URL}/user/login`, {
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
    }

    static createConversation(conversation) {
        return fetch(`${API_ADAPTER.API_HTTP_URL}/conversation/create`, {
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
    }

    static async getConversations() {
        return fetch(`${API_ADAPTER.API_HTTP_URL}/conversation/list-owned/${userService.user.id}`, {
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
    }

    static async deleteConversation(conversationId) {
        return fetch(`${API_ADAPTER.API_HTTP_URL}/conversation/${conversationId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
            })
    }

    static getModels() {
        return fetch(`${API_ADAPTER.API_HTTP_URL}/model/list`, {
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

    static getMessages(conversationId) {
        return fetch(`${API_ADAPTER.API_HTTP_URL}/message/list/${conversationId}`, {
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
    }

    static sendMessage(message, model, provider) {
        return fetch(`${API_ADAPTER.API_HTTP_URL}/message/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({messageDto: message, model: model, provider: provider}),
        })
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
    }

    static getLlmProviders() {
        return fetch(`${API_ADAPTER.API_HTTP_URL}/llm-provider/list`, {
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

    static addLlmProviders(providers) {
        return fetch(`${API_ADAPTER.API_HTTP_URL}/llm-provider/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({providers}),
        });
    }
}
