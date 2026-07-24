export const SettingsManager = {
    accentColor: undefined,

    setAccentColor: (color) => {
        SettingsManager.accentColor = color;
        localStorage.setItem("accent-color", color);
        document.documentElement.style.setProperty("--accent-color", color);
    },
    loadSettings: () => {
        SettingsManager.accentColor = localStorage.getItem("accent-color");

        SettingsManager.applySettings();
    },
    applySettings: () => {
        if (SettingsManager.accentColor) document.documentElement.style.setProperty("--accent-color", SettingsManager.accentColor);
    }
};