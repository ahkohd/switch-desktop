"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swicth_1 = require("./swicth");
const ipc = require('node-ipc');
const electron_1 = require("electron");
window.APP = new swicth_1.default();
ipc.config.id = 'switch-client-channel';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.connectTo('switch-service-channel', () => {
    ipc.of['switch-service-channel'].on('connect', () => {
        window.SWITCH_SERVICE_CHANNEL = ipc.of['switch-service-channel'];
        ipc.of['switch-service-channel'].emit('switch-service-incoming', JSON.stringify({ type: 'client-pid', data: electron_1.remote.process.pid }));
    });
});
//# sourceMappingURL=renderer.js.map