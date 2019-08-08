import { SwitchHotApp } from './interfaces';
const iconExtractor = require('icon-extractor');
const Conf = require('conf');
const config = new Conf({
    encryptionKey: '..kta#md!@a-k2j',
});

// config.clear();

export default class Switch {
    hotApps: SwitchHotApp[] | null;
    hotApp: SwitchHotApp = { empty: true, name: '', rawcode: null, path: '', icon: '' };

    constructor() {
        this.awakeAppList();
        this.hotApps = this.getHotApps();
        this.renderUIUpdate();
    }

    // get list of hot apps
    getHotApps(): SwitchHotApp[] | null {
        let data = config.get('hotApps');
        if (data == null) {
            data = [];
            for (let i = 0; i < 10; i++) data.push(this.hotApp);
            this.saveHotApps(data);
        }
        return data;
    }

    // redraws the appbar UI
    renderUIUpdate() {
        const appsListUI: HTMLCollectionOf<HTMLDivElement> = document.getElementsByClassName('app') as HTMLCollectionOf<HTMLDivElement>;
        for (let i = 0; i < this.hotApps.length; i++) {
            let elem = appsListUI[i];
            let hot = this.hotApps[i];
            elem.title = 'No app chosen';
            if (hot.empty) continue;
            elem.className = 'app';
            elem.title = hot.name.split('.exe')[0];
            let icon: HTMLImageElement = document.createElement('img');
            let rmButton: HTMLButtonElement = document.createElement('button');
            rmButton.className = 'rm-btn';
            rmButton.id = 'rm-' + i;
            rmButton.innerHTML = '<div>✖</div>';
            rmButton.onclick = function () {
                (window as any).APP.removeApp(this);
            }.bind(i);
            icon.src = 'data:image/png;base64,' + hot.icon;
            icon.className = 'icon';
            elem.innerHTML = "";
            elem.append(icon);
            elem.append(rmButton);
        }
    }

    // bootstrap the appbar UI elements
    awakeAppList() {
        const track = document.getElementById('track');
        for (let i = 0; i < 10; i++) {
            const div = document.createElement('div');
            const file = document.createElement('input');
            div.id = "app-" + i;
            div.className = "app empty";
            file.type = 'file';
            file.id = "f-app-" + i;
            file.addEventListener('change', e => {
                (window as any).APP.onClickAddHotApp(e);
            })
            div.appendChild(file);
            track.appendChild(div);

        }

    }

    // resets a app tile with the given index
    resetAppTileUI(i) {
        const appTile = document.getElementById('app-' + i);
        appTile.innerHTML = "";
        appTile.className = "app empty";
        appTile.title = 'No app chosen';
        const file = document.createElement('input');
        file.type = 'file';
        file.id = "f-app-" + i;
        file.addEventListener('change', e => {
            (window as any).APP.onClickAddHotApp(e);
        })
        appTile.appendChild(file);
    }

    // handles click event when user want to add new app
    onClickAddHotApp(elem) {
        const file = elem.target.files[0];
        // console.log(file);
        if (file.type == 'application/x-msdownload') {
            let opsys = process.platform;
            if (opsys == 'darwin') {

            } else if (opsys == "win32" || 'win64') {
                // extract the app icon..
                const extractIcon = new iconExtractor();
                extractIcon.getIcon(elem.target.id, file.path);
                // listen for the icon extraction..
                extractIcon.emitter.once('icon',  (data) => {
                    let icon = data.Base64ImageData;
                    let fileDetails = (document.getElementById(elem.target.id) as any).files[0];
                    (window as any).APP.addApp(elem.target.id.split('-')[2], fileDetails, icon);
                    // kill the child process..
                    extractIcon.iconProcess.kill();
                });
            }
        } else {
            alert('Please select a app.');
        }
    }

    // add a new app and store its details
    addApp(index, fileDetails, appIcon) {
        this.hotApps[index] = {
            empty: false,
            name: fileDetails.name,
            path: fileDetails.path,
            icon: appIcon,
            rawcode: (49 + parseInt(index))
        };
        this.saveHotApps(this.hotApps);
        this.renderUIUpdate();
    }

    // removes and app and updates store.
    removeApp(index) {
        this.hotApps[index] = this.hotApp;
        this.saveHotApps(this.hotApps);
        this.resetAppTileUI(index);
    }

    saveHotApps(update)
    {
        config.set('hotApps', update);
        // send update to background service
        let hotAppsData = [];
        update.forEach(hot => {
            hotAppsData.push({name: hot.name.split('.exe')[0], path: hot.path, rawcode: hot.rawcode})
        });

        (window as any).SWITCH_SERVICE_CHANNEL.emit('switch-service-incoming', JSON.stringify({type:'update-hot-apps', data: hotAppsData}));
    }
}