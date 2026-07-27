export class SettingsManager {
    static accentColor = undefined;
    static _debugMode;
    static providerUrls = [];

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

    static setProviderUrls(providerUrls) {
        SettingsManager.providerUrls = providerUrls;
        localStorage.setItem("provider-urls", JSON.stringify(providerUrls));
    }

    static loadSettings() {
        const accentColor = localStorage.getItem("accent-color");
        const providerUrls = localStorage.getItem("provider-urls");
        const debugMode = localStorage.getItem("debug-mode") ?? false;

        if (accentColor) SettingsManager.accentColor = accentColor;
        if (providerUrls) SettingsManager.providerUrls = JSON.parse(providerUrls);
        SettingsManager._debugMode = debugMode;

        SettingsManager.applySettings();
    }

    static applySettings() {
        if (SettingsManager.accentColor) document.documentElement.style.setProperty("--accent-color", SettingsManager.accentColor);
    }
}