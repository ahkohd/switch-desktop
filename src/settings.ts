import * as Toastify from 'toastify-js';
(window as any).toastify = Toastify;
const fs = require('fs');
const path = require('path');
const Store = require('electron-store');
const config = new Store({
    projectName: 'SwitchDock',
});

import * as Sentry from '@sentry/browser';
Sentry.init({
  dsn: 'https://1607ab9c0f4b4156be881c9ec9be23b5@sentry.io/1540999',
});




export class Settings {

    constructor() {
        window.onload = () => {
            this.updateUI();
        }

        this.getAppVersion();
    }

    getSavedFromStore() {
        const settings = config.get('config');
        if (settings == null) {
            const initial = {
                autoHide: true,
                maximize: true,
                placement: 'right'
            };
            config.set('config', initial)
            return initial;
        } else {
            return settings;
        }
    }

    getShowIntro()
    {
        const status = config.get('showIntro');
        return status == null ? true: status;
    }

    updateUI() {
        const data = this.getSavedFromStore();
        document.clear();
        this.setCheckedValue('auto_hide', data.autoHide);
        this.setCheckedValue('maximize', data.maximize);
        this.setCheckedValue('intro', this.getShowIntro());
        this.setSelectedValue('placement', data.placement);
    }

    getCheckedValue(id: string): boolean {
        return (document.getElementById(id) as HTMLInputElement).checked;
    }

    setCheckedValue(id: string, value: boolean) {
        (document.getElementById(id) as HTMLInputElement).checked = value;
    }

    setSelectedValue(id: string, value: string)
    {
        (document.getElementById(id) as HTMLInputElement).value = value;
    }

    getValue(id: string)
    {
        return (document.getElementById(id) as HTMLInputElement).value;
    }

    saveSettings() {

        const autoHide = this.getCheckedValue('auto_hide');
        const maximize = this.getCheckedValue('maximize');
        const intro = this.getCheckedValue('intro');
        const placement = this.getValue('placement');


        config.set('config', {
            autoHide: autoHide,
            maximize: maximize,
            placement: placement
        });

        config.set('showIntro', intro);


        (window as any).toastify({
            text: "✨ Saved!",
            duration: 3000,
            gravity: "bottom",
            close: true,
            position: 'left',
            className: 'toast-left',
            backgroundColor: "linear-gradient(136.2deg, #71D8FF -22.19%, #09B5F5 51.02%, #5811F0 114.32%)",
        }).showToast();
    }

    getAppVersion()
    {
        fs.readFile(path.join(__dirname, '../package.json'), (err, data) => {
            if(err) throw new Error(err);
            const parse = JSON.parse(data);
            document.getElementById('ver').innerText = `v${parse.version}`
        });
    }
}


// Disable key-combo refresh..
document.onkeydown = (e) => {
    const press = (window as any).event ? (window as any).event : e;
    if (press.keyCode == 82 && press.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
    }

}