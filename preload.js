const {remote} = require('electron')
const {Tray, Menu} = remote
const path = require('path')

let trayIcon = new Tray(path.join(__dirname,'/assets/images/bolt.png'))

         const trayMenuTemplate = [
            {
               label: 'Empty Application',
               enabled: false
            },
            
            {
               label: 'Settings',
               click: function () {
                  console.log("Clicked on settings")
               }
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