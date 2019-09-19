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

const Store = require('electron-store');
const config = new Store({
   projectName: 'SwitchDock'
});

let trayIcon = new Tray(path.join(__dirname, `/assets/app-icons/${(process.platform == 'darwin') ? 'icon@22.png' : 'icon.png'}`));
let settingsWindowOpened = false;


canShowIntro = () => {
   const status = config.get('showIntro');
   return (status == null) ? true : status;
}

// creates an intro window
createIntroWindow = () => {
    let win = new remote.BrowserWindow({
        width: 600,
        height: 400,
        show: false,
        frame: false,
        hasShadow: false,
        transparent: true,
        maximizable: false,
        minimizable: false,
        skipTaskbar: true,
        resizable: false,
        webPreferences: {
           devTools: false,
           nodeIntegration: true
        }
     });

     win.loadURL(url.format({
        pathname: path.join(__dirname, 'intro.html'),
        protocol: 'file:',
        slashes: true
     }));
     win.on('closed', () => {

     });
     win.once('ready-to-show', ()=>{
        win.show();
     });
}
//show intro on startup.
if(canShowIntro()) createIntroWindow();


createSettingsWindow = () => {
   let win = new BrowserWindow({
      width: 600,
      height: 400,
      show: false,
      maximizable: false,
      minimizable: false,
      resizable: false,
      webPreferences: {
         // devTools: true,
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
      // send the update to the switch service..
      try {
         window.SWITCH_SERVICE_CHANNEL.emit('switch-service-incoming', JSON.stringify({
            type: 'config-update',
            data: {...config.get('config'), disableAltGr: config.get('disableAltGr') }
         }));
      } catch (e) {}
   });

   win.once('ready-to-show', () => {
      settingsWindowOpened = true;
      win.setMenu(null);
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