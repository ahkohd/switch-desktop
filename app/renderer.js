"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swicth_1 = require("./swicth");
const ipc = require('node-ipc');
window.APP = new swicth_1.default();
ipc.config.id = 'switch-client-channel';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.connectTo('switch-service-channel', () => {
    ipc.of['switch-service-channel'].on('connect', () => {
        window.SWITCH_SERVICE_CHANNEL = ipc.of['switch-service-channel'];
    });
});
//# sourceMappingURL=renderer.js.map