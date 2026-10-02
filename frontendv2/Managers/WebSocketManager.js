import {API_ADAPTER} from "../api-adapter.js";
import {Popup} from "../Components/Popup.js";
import {ConversationManager} from "./ConversationManager.js";
import {userService} from "../Services/UserService.js";

export class WebSocketManager {
    static _socket;
    static _isConnected = false;

    static _lastPing;
    static _lastPong;
    static _pingInterval;

    // Todo: Keep identifiers to make reconnect more persistent?
    static _identity;
    static get identity() { return this._identity; }
    static set identity(value) {
        this._identity = value;
        if (this._socket) this._socket.send(JSON.stringify({type: "identification", identifier: value, userId: userService.user.id ?? null}));
    }

    static get socket() { return this._socket; }
    static get isConnected() { return this._isConnected; }

    static get ping() { return this._lastPong - this._lastPing; }

    static sendPing = () => {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            this._socket.send(JSON.stringify({identity: this.identity, type: "ping"}));
            this._lastPing = Date.now();
        }
    }

    // Resolves once the socket is open, rejects if it closes before that.
    // Reuses an already open socket instead of opening a second one.
    static connectOrFail() {
        if (this._socket?.readyState === WebSocket.OPEN) return Promise.resolve();
        if (this._socket) this._socket.close();

        const socket = new WebSocket(API_ADAPTER.WS_URL);
        this._socket = socket;

        const opened = new Promise((resolve, reject) => {
            socket.onopen = () => {
                this._isConnected = true;
                this._lastPing = Date.now();
                this._pingInterval = setInterval(this.sendPing, 10000);
                resolve();
            };

            socket.onclose = () => {
                reject(new Error("WebSocket connection closed"));
                // A replaced socket must not tear down the state of its successor
                if (socket !== this._socket) return;
                this._isConnected = false;
                if (this._pingInterval) {
                    clearInterval(this._pingInterval);
                    this._pingInterval = null;
                }
            };
        });

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case "identification":
                    this.identity = data.body;
                    break;

                case "pong":
                    this._lastPong = Date.now();
                    console.log(`Ping: ${this._lastPong - this._lastPing}ms`);
                    break;

                case "notification":
                    Popup.info(data.body.title, data.body.body);
                    break;

                case "messageUpdate":
                    await ConversationManager.UpdateMessage(data.body);
                    break;

                case "messageCreated":
                    await ConversationManager.AddMessage(data.body);
                    break;
            }
        };

        return opened;
    }

    static send(type, body) {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            this._socket.send(JSON.stringify({identity: this.identity, type, body}));
        }
    }
}