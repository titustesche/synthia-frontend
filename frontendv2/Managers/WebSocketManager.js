import {SettingsManager} from "./SettingsManager.js";
import {API_ADAPTER} from "../api-adapter.js";

export class WebSocketManager {
    static _socket;
    static _isConnected = false;

    static _lastPing;
    static _lastPong;
    static _pingInterval;

    static get socket() { return this._socket; }
    static get isConnected() { return this._isConnected; }

    static get ping() { return this._lastPong - this._lastPing; }

    static ping = () => {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            this._socket.send(JSON.stringify({type: "ping"}));
            this._lastPing = Date.now();
        }
    }

    static connectOrFail() {
        this._socket = new WebSocket(API_ADAPTER.WS_URL);

        this._socket.onopen = () => {
            this._isConnected = true;
            this._lastPing = Date.now();
            this._pingInterval = setInterval(this.ping, 1000);
            this._socket.send("Hello from client!");
        };

        this._socket.onclose = () => {
            this._isConnected = false;
            if (this._pingInterval) {
                clearInterval(this._pingInterval);
                this._pingInterval = null;
            }
        };

        this._socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "pong") {
                this._lastPong = Date.now();
            }
        };
    }
}