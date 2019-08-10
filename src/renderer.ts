import Switch from './swicth';
const ipc = require('node-ipc');
import { remote, screen } from 'electron';


let windowVisible = true;
let windowPos;
const hide = () => {
  return setTimeout(() => {
    const window = remote.getCurrentWindow();
    windowPos = window.getPosition();
    window.setPosition(-100, 0);
    windowVisible = false;
  }, 3000)
};

// hide window
let autoHide = hide();

// shows the current window
const show = () => {
  const window = remote.getCurrentWindow();
  window.show();
  window.setPosition(windowPos[0], windowPos[1]);
  window.setSize(70, 600);
  windowVisible = true;
  clearTimeout(autoHide);
  autoHide = hide();
}



// instance app
(window as any).APP = new Switch();



ipc.config.id = 'switch-client-channel';
ipc.config.retry = 1500;
ipc.config.silent = true;

ipc.connectTo('switch-service-channel', () => {
  ipc.of['switch-service-channel'].on('connect', () => {

    (window as any).SWITCH_SERVICE_CHANNEL = ipc.of['switch-service-channel'];
    ipc.of['switch-service-channel'].emit('switch-service-incoming', JSON.stringify({ type: 'client-pid', data: remote.process.pid }));
  });

  ipc.of['switch-service-channel'].on('client-show', (data) => {
    console.log('recived');
    if (windowVisible) {
      console.log('hide')
      clearTimeout(autoHide);
      autoHide = hide();
    } else {
      console.log('show')
      show();
    }
  })


});

