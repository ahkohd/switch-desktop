"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fileIcon = require("extract-file-icon");
const Conf = require('conf');
const config = new Conf({
    encryptionKey: '..kta#md!@a-k2j',
});
class Switch {
    constructor() {
        this.hotApp = { empty: true, name: '', rawcode: null, path: '', icon: '' };
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
            this.saveHotApps(data);
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
        appTile.title = 'No app chosen';
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
        const icon = fileIcon(file.path, 32).toString('base64');
        if (file.type == 'application/x-msdownload') {
            let opsys = process.platform;
            if (opsys == 'darwin') {
            }
            else if (opsys == "win32" || 'win64') {
                window.APP.addApp(elem.target.id.split('-')[2], file, icon);
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
            rawcode: (49 + parseInt(index))
        };
        this.saveHotApps(this.hotApps);
        this.renderUIUpdate();
    }
    removeApp(index) {
        this.hotApps[index] = this.hotApp;
        this.saveHotApps(this.hotApps);
        this.resetAppTileUI(index);
    }
    saveHotApps(update) {
        config.set('hotApps', update);
        let hotAppsData = [];
        update.forEach(hot => {
            hotAppsData.push({ name: hot.name.split('.exe')[0], path: hot.path, rawcode: hot.rawcode });
        });
        try {
            window.SWITCH_SERVICE_CHANNEL.emit('switch-service-incoming', JSON.stringify({ type: 'update-hot-apps', data: hotAppsData }));
        }
        catch (e) {
        }
    }
}
exports.default = Switch;
//# sourceMappingURL=swicth.js.map