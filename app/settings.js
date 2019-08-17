"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Toastify = require("toastify-js");
window.toastify = Toastify;
const Store = require('electron-store');
const config = new Store({
    projectName: 'SwitchDock',
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
    getShowIntro() {
        const status = config.get('showIntro');
        return status == null ? true : status;
    }
    updateUI() {
        const data = this.getSavedFromStore();
        document.clear();
        this.setCheckedValue('auto_hide', data.autoHide);
        this.setCheckedValue('maximize', data.maximize);
        this.setCheckedValue('intro', this.getShowIntro());
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
        const intro = this.getCheckedValue('intro');
        config.set('config', {
            autoHide: autoHide,
            maximize: maximize
        });
        config.set('showIntro', intro);
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
document.onkeydown = (e) => {
    const press = window.event ? window.event : e;
    if (press.keyCode == 82 && press.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
    }
};
//# sourceMappingURL=settings.js.map