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
        if (process.platform == 'darwin') this.macOSCleanUp();
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
                placement: 'right',
            };
            config.set('config', initial)
            return initial;
        } else {
            return settings;
        }
    }

    getShowIntro() {
        const status = config.get('showIntro');
        return status == null ? true : status;
    }

    getDisableAltGr() {
        const status = config.get('disableAltGr');
        return status == null ? false : status;
    }




    updateUI() {
        const data = this.getSavedFromStore();
        document.clear();
        this.setCheckedValue('auto_hide', data.autoHide);
        this.setCheckedValue('maximize', data.maximize);
        this.setCheckedValue('intro', this.getShowIntro());
        this.setSelectedValue('placement', data.placement);
        this.setCheckedValue('disableAltGr', this.getDisableAltGr());

    }

    getCheckedValue(id: string): boolean {
        return (document.getElementById(id) as HTMLInputElement).checked;
    }

    setCheckedValue(id: string, value: boolean) {
        (document.getElementById(id) as HTMLInputElement).checked = value;
    }

    setSelectedValue(id: string, value: string) {
        (document.getElementById(id) as HTMLInputElement).value = value;
    }

    getValue(id: string) {
        return (document.getElementById(id) as HTMLInputElement).value;
    }

    saveSettings() {

        const autoHide = this.getCheckedValue('auto_hide');
        const maximize = this.getCheckedValue('maximize');
        const intro = this.getCheckedValue('intro');
        const placement = this.getValue('placement');
        const disableAltGr = this.getCheckedValue('disableAltGr');



        config.set('config', {
            autoHide: autoHide,
            maximize: maximize,
            placement: placement
        });

        config.set('showIntro', intro);
        config.set('disableAltGr', disableAltGr);



        (window as any).toastify({
            text: "🦄 Saved!",
            duration: 3000,
            gravity: "bottom",
            position: 'left',
            className: 'toast-left',
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
    }

    getAppVersion() {
        fs.readFile(path.join(__dirname, '../package.json'), (err, data) => {
            if (err) throw new Error(err);
            const parse = JSON.parse(data);
            document.getElementById('ver').innerText = `v${parse.version}`
        });
    }

    macOSCleanUp() {
        let $macHides = document.getElementsByClassName('mac-hide');
        for (let i = 0; i < $macHides.length; i++) {
            ($macHides.item(i) as HTMLElement).style.opacity = '0';
        }
    }
}