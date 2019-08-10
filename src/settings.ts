import { Titlebar, Color } from 'custom-electron-titlebar'
 
new Titlebar({
    backgroundColor: Color.fromHex('#EAF8FE'),
    icon: './assets/images/light2.ico',
    minimizable: false,
    maximizable: false,
    menu: null
});