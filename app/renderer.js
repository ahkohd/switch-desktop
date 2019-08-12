"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const switch_1 = require("./switch");
const ipc = require('node-ipc');
const electron_1 = require("electron");
const Conf = require('conf');
const config = new Conf({
    encryptionKey: '..kta#md!@a-k2j',
});
let windowVisible = true;
let windowPos;
const hide = () => {
    return setTimeout(() => {
        const window = electron_1.remote.getCurrentWindow();
        windowPos = window.getPosition();
        window.setPosition(-100, 0);
        windowVisible = false;
    }, 3000);
};
const settings = config.get('config');
console.log(settings);
let autoHide;
window.DOCK_CAN_AUTO_HIDE = true;
if (settings == null || settings.autoHide) {
    window.DOCK_CAN_AUTO_HIDE = true;
    autoHide = hide();
}
else if (!settings.autoHide) {
    window.DOCK_CAN_AUTO_HIDE = false;
}
const show = (thenHide = true) => {
    const window = electron_1.remote.getCurrentWindow();
    window.setPosition(windowPos[0], windowPos[1]);
    window.setSize(70, 600);
    windowVisible = true;
    clearTimeout(autoHide);
    if (thenHide)
        autoHide = hide();
};
window.APP = new switch_1.default(config);
document.body.addEventListener('mouseenter', () => {
    if (window.DOCK_CAN_AUTO_HIDE)
        clearInterval(autoHide);
});
document.body.addEventListener('mouseleave', () => {
    if (window.DOCK_CAN_AUTO_HIDE) {
        clearInterval(autoHide);
        autoHide = hide();
    }
});
ipc.config.id = 'switch-client-channel';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.connectTo('switch-service-channel', () => {
    ipc.of['switch-service-channel'].on('connect', () => {
        window.SWITCH_SERVICE_CHANNEL = ipc.of['switch-service-channel'];
        ipc.of['switch-service-channel'].emit('switch-service-incoming', JSON.stringify({ type: 'client-pid', data: electron_1.remote.process.pid }));
    });
    ipc.of['switch-service-channel'].on('client-show', (data) => {
        if (window.DOCK_CAN_AUTO_HIDE) {
            if (windowVisible) {
                clearTimeout(autoHide);
                autoHide = hide();
            }
            else {
                show();
            }
        }
    });
    ipc.of['switch-service-channel'].on('config-update', (settings) => {
        if (!settings.autoHide) {
            show(false);
            window.DOCK_CAN_AUTO_HIDE = false;
        }
        else {
            autoHide = hide();
            window.DOCK_CAN_AUTO_HIDE = true;
        }
    });
    ipc.of['switch-service-channel'].on('last-switched-app', (data) => {
        window.APP.lastSwitchedApp(data.hotApp);
    });
});
//# sourceMappingURL=renderer.js.map