import {Switch, osSpecificAppearance} from './switch';
const ipc = require('node-ipc');
import { remote } from 'electron';
import * as Sentry from '@sentry/browser';
Sentry.init({
  dsn: 'https://1607ab9c0f4b4156be881c9ec9be23b5@sentry.io/1540999',
});



// Load saved configurations
const Store = require('electron-store');
const config = new Store({
  projectName: 'SwitchDock'
});

// Initialize analytics...
import { initAnalytics, logOnShowDock } from './analytics';
const uuid = initAnalytics(config);
logOnShowDock(uuid, true);


// Dock visibility
let windowVisible = true;

// specifics for windows..
osSpecificAppearance();

/* Hides the dock after 3000 seconds.
 * - By moving it to a negative screen position, since the dock
 * is always on top of every other window.
 */
const hide = () => {
  return setTimeout(() => {
    const window = remote.getCurrentWindow();
    window.setIgnoreMouseEvents(true);
    if(process.platform == 'darwin') {
      window.setOpacity(0);
    } else {
      document.body.style.opacity = '0';
    }
    windowVisible = false;
  }, 3000)
};

// Get user settings
const settings = config.get('config');
// save previous placement 
let previousPlacement  = (settings == null) ? 'right' : settings.placement;
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
  window.setIgnoreMouseEvents(false);
  if(process.platform == 'darwin') {
    window.setOpacity(1);
  } else {
    document.body.style.opacity = '1';
  }
  windowVisible = true;
  clearTimeout(autoHide);
  if (thenHide) autoHide = hide();

  try {
    logOnShowDock(uuid);
  } catch(e) {}
  
}

(window as any).SHOW_DOCK = show;

// places the dock to the left or right..
function placeDock(placement: string)
{
  const dock = remote.getCurrentWindow();
  const screenSize = window.screen;
  // 600 - window's height
  let calcY = (screenSize.height / 2) - (600/2);
  if(placement == 'left')
  {
    dock.setPosition(10, calcY);
  } else {
    // place right..
    // 70 - window's width
    let calcX = screenSize.width - (70+10);
    dock.setPosition(calcX, calcY);
  }

}

// Instance Switch UI 
(window as any).APP = new Switch(config);

// Don't hide when user is on the dock
document.body.addEventListener('mouseenter', () => {
  if ((window as any).DOCK_CAN_AUTO_HIDE) clearInterval(autoHide);
});

// Hide the dock when user is not on the dock
document.body.addEventListener('mouseleave', () => {
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
  ipc.of['switch-service-channel'].on('client-show', (payload) => {
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
    
    if(settings.placement && settings.placement == 'left' && previousPlacement != 'left') {
      placeDock('left');
      previousPlacement = 'left';
      clearTimeout(autoHide);
      show();
    } else if (settings.placement && settings.placement == 'right' && previousPlacement != 'right') {
      placeDock('right');
      previousPlacement = 'right';
      clearTimeout(autoHide);
      show();
    }

    if (!settings.autoHide) {
      show(false);
      (window as any).DOCK_CAN_AUTO_HIDE = false;
    } else if (settings.autoHide && !(window as any).DOCK_CAN_AUTO_HIDE) {
        show();
        (window as any).DOCK_CAN_AUTO_HIDE = true;
    }
  });

  // When Switch service sends last switched app
  ipc.of['switch-service-channel'].on('last-switched-app', (data) => {
    (window as any).APP.lastSwitchedApp(data.hotApp);
  });


});

