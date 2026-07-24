import {DomRegister} from "./DomRegister.js";
import {Popup} from "../Components/Popup.js";
import {SettingsManager} from "./SettingsManager.js";

export const HeaderService = {
    setupHeader: () => {
        if (!DomRegister.accentColorPicker)
            Popup.debug("Light error", "Could not determine accent color picker");
        else {
            DomRegister.accentColorPicker.addEventListener("input", () => {
                SettingsManager.setAccentColor(DomRegister.accentColorPicker.value);
                document.documentElement.style.setProperty("--accent-color", DomRegister.accentColorPicker.value);
            });
        }
    }
}