"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const custom_electron_titlebar_1 = require("custom-electron-titlebar");
new custom_electron_titlebar_1.Titlebar({
    backgroundColor: custom_electron_titlebar_1.Color.fromHex('#ffffff'),
    icon: './assets/images/switch.ico',
    minimizable: false,
    maximizable: false,
    menu: null
});
function getValues() {
    return {
        autoHide: true,
        maximize: false
    };
}
function updateUI() {
    const data = getValues();
    document.getElementById('auto_id').checked = data.autoHide;
    document.getElementById('maximize').checked = data.maximize;
    alert();
}
function saveSettings() {
}
document.addEventListener('load', (e) => updateUI());
//# sourceMappingURL=settings.js.map