"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Toastify = require("toastify-js");
window.toastify = Toastify;
const Conf = require('conf');
const config = new Conf({
    encryptionKey: '..kta#md!@a-k2j',
});
const custom_electron_titlebar_1 = require("custom-electron-titlebar");
new custom_electron_titlebar_1.Titlebar({
    backgroundColor: custom_electron_titlebar_1.Color.fromHex('#63808B'),
    icon: './assets/images/switch.ico',
    minimizable: false,
    maximizable: false,
    menu: null
});
class Settings {
    constructor() {
        window.onload = () => {
            this.updateUI();
        };
    }
    getSavedFromStore() {
        const settings = config.get('config');
        if (settings == null) {
            const initial = {
                autoHide: true,
                maximize: true
            };
            config.set('config', initial);
            return initial;
        }
        else {
            return settings;
        }
    }
    updateUI() {
        const data = this.getSavedFromStore();
        document.clear();
        this.setCheckedValue('auto_hide', data.autoHide);
        this.setCheckedValue('maximize', data.maximize);
    }
    getCheckedValue(id) {
        return document.getElementById(id).checked;
    }
    setCheckedValue(id, value) {
        document.getElementById(id).checked = value;
    }
    saveSettings() {
        const autoHide = this.getCheckedValue('auto_hide');
        const maximize = this.getCheckedValue('maximize');
        config.set('config', {
            autoHide: autoHide,
            maximize: maximize
        });
        window.toastify({
            text: "✨ Saved!",
            duration: 3000,
            gravity: "bottom",
            close: true,
            position: 'left',
            className: 'toast-left',
            backgroundColor: "linear-gradient(136.2deg, #71D8FF -22.19%, #09B5F5 51.02%, #5811F0 114.32%)",
        }).showToast();
    }
}
exports.Settings = Settings;
//# sourceMappingURL=settings.js.map