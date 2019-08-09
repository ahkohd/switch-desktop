import Switch from './swicth';
const ipc = require('node-ipc');
import { remote } from 'electron';

// instance app
(window as any).APP = new Switch();


ipc.config.id = 'switch-client-channel';
ipc.config.retry = 1500;
ipc.config.silent = true;

ipc.connectTo('switch-service-channel', () => {
    ipc.of['switch-service-channel'].on('connect', () => {

        (window as any).SWITCH_SERVICE_CHANNEL = ipc.of['switch-service-channel'];
      ipc.of['switch-service-channel'].emit('switch-service-incoming', JSON.stringify({type:'client-pid', data: remote.process.pid}));
    });
});
