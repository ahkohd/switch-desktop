"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iconExtractor = require('icon-extractor');
const Conf = require('conf');
const config = new Conf({
    encryptionKey: '..kta#md!@a-k2j',
});
class Switch {
    constructor() {
        this.hotApp = { empty: true, name: '', keycode: null, path: '', icon: '' };
        this.awakeAppList();
        this.hotApps = this.getHotApps();
        this.renderUIUpdate();
    }
    getHotApps() {
        let data = config.get('hotApps');
        if (data == null) {
            data = [];
            for (let i = 0; i < 10; i++)
                data.push(this.hotApp);
            config.set('hotApps', data);
        }
        return data;
    }
    renderUIUpdate() {
        const appsListUI = document.getElementsByClassName('app');
        for (let i = 0; i < this.hotApps.length; i++) {
            let elem = appsListUI[i];
            let hot = this.hotApps[i];
            elem.title = 'No app chosen';
            if (hot.empty)
                continue;
            elem.className = 'app';
            elem.title = hot.name.split('.exe')[0];
            let icon = document.createElement('img');
            let rmButton = document.createElement('button');
            rmButton.className = 'rm-btn';
            rmButton.id = 'rm-' + i;
            rmButton.innerHTML = '<div>✖</div>';
            rmButton.onclick = function () {
                window.APP.removeApp(this);
            }.bind(i);
            icon.src = 'data:image/png;base64,' + hot.icon;
            icon.className = 'icon';
            elem.innerHTML = "";
            elem.append(icon);
            elem.append(rmButton);
        }
    }
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
                window.APP.onClickAddHotApp(e);
            });
            div.appendChild(file);
            track.appendChild(div);
        }
    }
    resetAppTileUI(i) {
        const appTile = document.getElementById('app-' + i);
        appTile.innerHTML = "";
        appTile.className = "app empty";
        const file = document.createElement('input');
        file.type = 'file';
        file.id = "f-app-" + i;
        file.addEventListener('change', e => {
            window.APP.onClickAddHotApp(e);
        });
        appTile.appendChild(file);
    }
    onClickAddHotApp(elem) {
        const file = elem.target.files[0];
        if (file.type == 'application/x-msdownload') {
            let opsys = process.platform;
            if (opsys == 'darwin') {
            }
            else if (opsys == "win32" || 'win64') {
                const extractIcon = new iconExtractor();
                extractIcon.getIcon(elem.target.id, file.path);
                extractIcon.emitter.once('icon', (data) => {
                    let icon = data.Base64ImageData;
                    let fileDetails = document.getElementById(elem.target.id).files[0];
                    window.APP.addApp(elem.target.id.split('-')[2], fileDetails, icon);
                    extractIcon.iconProcess.kill();
                });
            }
        }
        else {
            alert('Please select a app.');
        }
    }
    addApp(index, fileDetails, appIcon) {
        this.hotApps[index] = {
            empty: false,
            name: fileDetails.name,
            path: fileDetails.path,
            icon: appIcon,
            keycode: 2
        };
        config.set('hotApps', this.hotApps);
        this.renderUIUpdate();
    }
    removeApp(index) {
        this.hotApps[index] = this.hotApp;
        config.set('hotApps', this.hotApps);
        this.resetAppTileUI(index);
    }
}
exports.default = Switch;
//# sourceMappingURL=swicth.js.map