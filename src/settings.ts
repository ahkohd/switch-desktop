// import * as Toastify from 'toastify-js';

import { Titlebar, Color } from 'custom-electron-titlebar'
 
new Titlebar({
    backgroundColor: Color.fromHex('#ffffff'),
    icon: './assets/images/light2.ico',
    minimizable: false,
    maximizable: false,
    menu: null
});

function getValues()
{

    return {
        autoHide: true,
        maximize: false
    }
}

function updateUI()
{
    const data = getValues();
    (document.getElementById('auto_id') as HTMLInputElement).checked = data.autoHide;
    (document.getElementById('maximize') as HTMLInputElement).checked = data.maximize;
    alert();
}

function saveSettings()
{

}

document.addEventListener('load', (e) => updateUI());
// setTimeout(()=>updateUI(), 0);

