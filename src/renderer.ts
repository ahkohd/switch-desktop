import Switch from './switch';
const ipc = require('node-ipc');
import { remote } from 'electron';


// Load saved configurations
const Conf = require('conf');
const config = new Conf({
  encryptionKey: '..kta#md!@a-k2j',
});

// Dock visibility
let windowVisible = true;
let windowPos;

/* Hides the dock after 3000 seconds.
 * - By moving it to a negative screen position, since the dock
 * is always on top of every other window.
 */ 
const hide = () => {
  return setTimeout(() => {
    const window = remote.getCurrentWindow();
    windowPos = window.getPosition();
    window.setPosition(-100, 0);
    windowVisible = false;
  }, 3000)
};

// Get user settings
const settings = config.get('config');
console.log(settings);
// holds auto hide timeout.
let autoHide;
// a flag
(window as any).DOCK_CAN_AUTO_HIDE = true;

if (settings == null || settings.autoHide) {
  // if there is no settings of user set autoHide to true
  // Flag dock to be auto hideable
  (window as any).DOCK_CAN_AUTO_HIDE = true;
  // auto hide dock
  autoHide = hide();
} else if (!settings.autoHide) {
  // auto hide is not allowed
  (window as any).DOCK_CAN_AUTO_HIDE = false;
}

// Shows the current window
const show = (thenHide: boolean = true) => {
  const window = remote.getCurrentWindow();
  window.setPosition(windowPos[0], windowPos[1]);
  window.setSize(70, 600);
  windowVisible = true;
  clearTimeout(autoHide);
  if (thenHide) autoHide = hide();
}

// Instance Switch UI 
(window as any).APP = new Switch(config);

// Don't hide when user is on the dock
document.body.addEventListener('mouseenter', () => {
  // alert('entered');
  if ((window as any).DOCK_CAN_AUTO_HIDE) clearInterval(autoHide);
});

// Hide the dock when user is not on the dock
document.body.addEventListener('mouseleave', () => {
  // alert('left');
  if ((window as any).DOCK_CAN_AUTO_HIDE) {
    clearInterval(autoHide);
    autoHide = hide();
  }
});


/*
 * SWITCH SERVICE
 * Node IPC channel
 */

ipc.config.id = 'switch-client-channel';
ipc.config.retry = 1500;
ipc.config.silent = true;

ipc.connectTo('switch-service-channel', () => {

  // When client connects
  ipc.of['switch-service-channel'].on('connect', () => {
    // make connection instance global
    (window as any).SWITCH_SERVICE_CHANNEL = ipc.of['switch-service-channel'];
    // send dock's pid to Switch service
    ipc.of['switch-service-channel'].emit('switch-service-incoming', JSON.stringify({ type: 'client-pid', data: remote.process.pid }));
  });

  // When Switch service sends a show dock event
  ipc.of['switch-service-channel'].on('client-show', (data) => {
    // if dock and auto hide
    if ((window as any).DOCK_CAN_AUTO_HIDE) {
      // and dock is visible
      if (windowVisible) {
        // clear auto hide timeout
        clearTimeout(autoHide);
        // auto hide dock
        autoHide = hide();
      } else {
        // show dock
        show();
      }
    }
  });

  // When Switch service sends config update.
  ipc.of['switch-service-channel'].on('config-update', (settings) => {
    // check if user disable or enables dock autohide
    if (!settings.autoHide) {
      show(false);
      (window as any).DOCK_CAN_AUTO_HIDE = false;
    } else {
      autoHide = hide();
      (window as any).DOCK_CAN_AUTO_HIDE = true;
    }
  });

  // When Switch service sends last switched app
  ipc.of['switch-service-channel'].on('last-switched-app', (data) => {
    (window as any).APP.lastSwitchedApp(data.hotApp);
  });


});

