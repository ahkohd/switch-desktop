"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swicth_1 = require("./swicth");
const ipc = require('node-ipc');
const electron_1 = require("electron");
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
let autoHide = hide();
const show = () => {
    const window = electron_1.remote.getCurrentWindow();
    window.show();
    window.setPosition(windowPos[0], windowPos[1]);
    window.setSize(70, 600);
    windowVisible = true;
    clearTimeout(autoHide);
    autoHide = hide();
};
window.APP = new swicth_1.default();
document.body.addEventListener('mouseenter', () => {
    clearInterval(autoHide);
});
document.body.addEventListener('mouseleave', () => {
    autoHide = hide();
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
        if (windowVisible) {
            clearTimeout(autoHide);
            autoHide = hide();
        }
        else {
            show();
        }
    });
    ipc.of['switch-service-channel'].on('last-switched-app', (data) => {
        window.APP.lastSwitchedApp(data.hotApp);
    });
});
//# sourceMappingURL=renderer.js.map