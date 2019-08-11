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


let trayIcon = new Tray(path.join(__dirname, '/assets/images/switch.ico'));
let settingsWindowOpened = false;


createSettingsWindow = () => {
   let win = new BrowserWindow({
      width: 600,
      height: 400,
      show: false,
      frame: false,
      maximizable: false,
      minimizable: false,
      resizable: false,
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
      settingsWindowOpened = false;
      trayMenu.items[1].enabled = true;

   })

   win.once('ready-to-show', () => {
      settingsWindowOpened = true;
      win.show();
      trayIcon.setContextMenu(trayMenu);
      trayMenu.items[1].enabled = false;
   });

}


const trayMenuTemplate = [{
      label: 'Show dock',
      click: () => {
         try {
            window.SWITCH_SERVICE_CHANNEL.emit('switch-service-incoming', JSON.stringify({
               type: 'show-dock'
            }));
         } catch (e) {}

      },
   },

   {
      label: 'Settings',
      click: () => createSettingsWindow(),
      enabled: !settingsWindowOpened
   },
   {
      label: 'Quit',
      click: function () {
         remote.getCurrentWindow().close();
      }
   }
]

let trayMenu = Menu.buildFromTemplate(trayMenuTemplate)
trayIcon.setContextMenu(trayMenu);