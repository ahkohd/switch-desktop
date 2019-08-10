const {
   remote
} = require('electron')

const {
   Tray,
   Menu,
   BrowserWindow
} = remote
const url = require('url')
const path = require('path')


let trayIcon = new Tray(path.join(__dirname, '/assets/images/bolt.png'));
let settingsWindowOpened = false;


createSettingsWindow = () => {
   let win = new BrowserWindow({
      width: 600,
      height: 400,
      show: false,
      frame: false,
      hasShadow: true,
      maximizable: false,
      minimizable: false,
      resizable: false,
      transparent: true,
      webPreferences: {
         nodeIntegration: true
      }
   })
   win.loadURL(url.format({
      pathname: path.join(__dirname, 'settings.html'),
      protocol: 'file:',
      slashes: true
   }));


   win.on('closed', () => {
      settingsWindowOpened = false
   })

   win.once('ready-to-show', () => {
      settingsWindowOpened = true;
      win.show();
   });

}


const trayMenuTemplate = [{
      label: 'Toggle switch dock',
      enabled: false
   },

   {
      label: 'Settings',
      click: () => createSettingsWindow(),
      enabled: !settingsWindowOpened
   },

   {
      label: 'Help',
      click: function () {
         console.log("Clicked on Help")
      }
   }
]

let trayMenu = Menu.buildFromTemplate(trayMenuTemplate)
trayIcon.setContextMenu(trayMenu)