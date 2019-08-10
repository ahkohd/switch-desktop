"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swicth_1 = require("./swicth");
const ipc = require('node-ipc');
const electron_1 = require("electron");
let windowVisible = true;
const hide = () => {
    return setTimeout(() => {
        const window = electron_1.remote.getCurrentWindow();
        document.body.style.opacity = '0';
        window.hide();
        windowVisible = false;
    }, 3000);
};
let autoHide = hide();
const show = () => {
    const window = electron_1.remote.getCurrentWindow();
    setTimeout(() => document.body.style.opacity = '1', 100);
    window.show();
    windowVisible = true;
    clearTimeout(autoHide);
    autoHide = hide();
};
window.APP = new swicth_1.default();
ipc.config.id = 'switch-client-channel';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.connectTo('switch-service-channel', () => {
    ipc.of['switch-service-channel'].on('connect', () => {
        window.SWITCH_SERVICE_CHANNEL = ipc.of['switch-service-channel'];
        ipc.of['switch-service-channel'].emit('switch-service-incoming', JSON.stringify({ type: 'client-pid', data: electron_1.remote.process.pid }));
    });
    ipc.of['switch-service-channel'].on('client-show', (data) => {
        console.log('recived');
        if (windowVisible) {
            console.log('hide');
            clearTimeout(autoHide);
            autoHide = hide();
        }
        else {
            console.log('show');
            show();
        }
    });
});
//# sourceMappingURL=renderer.js.map