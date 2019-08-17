"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fileIcon = require("extract-file-icon");
const open = require('open');
const path = require('path');
class Switch {
    constructor(config) {
        this.config = config;
        this.hotApp = { empty: true, name: '', rawcode: null, path: '', icon: '' };
        this.lastHotAppIndex = null;
        this.runningHotApps = [];
        this.awakeAppList();
        this.hotApps = this.getHotApps();
        this.renderUIUpdate();
    }
    getHotApps() {
        let data = this.config.get('DockHotApps');
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
            if (hot.empty)
                continue;
            elem.className = 'app';
            let icon = document.createElement('img');
            icon.onclick = function () {
                icon.classList.add('animated');
                icon.classList.add('bounce');
                setTimeout(() => {
                    icon.classList.remove('animated');
                    icon.classList.remove('bounce');
                    window.APP.openApp(this);
                }, 1000);
            }.bind(i);
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
        if (this.checkIfAppExists(file.path, file.name)) {
            alert('App already exists in dock!');
            return;
        }
        const icon = fileIcon(file.path, 32).toString('base64');
        let opsys = process.platform;
        if (opsys == 'darwin' && path.extname(file.path) == '.app') {
            window.APP.addApp(elem.target.id.split('-')[2], file, icon);
        }
        else if (file.type == 'application/x-msdownload' && path.extname(file.path.toLowerCase()) == '.exe' && (opsys == "win32" || 'win64')) {
            window.APP.addApp(elem.target.id.split('-')[2], file, icon);
        }
        else {
            alert('Please select an app.');
        }
    }
    checkIfAppExists(path, name) {
        const nameExits = this.hotApps.filter(hotapp => hotapp.name.toLowerCase() == name.toLocaleLowerCase());
        const pathExists = this.hotApps.filter(hotapp => hotapp.path.toLowerCase() == path.toLowerCase());
        return (pathExists.length == 0 || nameExits.length == 0) ? false : true;
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
        this.config.set('DockHotApps', update);
        let hotAppsData = [];
        update.forEach(hot => {
            hotAppsData.push({ name: hot.name, path: hot.path, rawcode: hot.rawcode });
        });
        try {
            window.SWITCH_SERVICE_CHANNEL.emit('switch-service-incoming', JSON.stringify({ type: 'update-hot-apps', data: hotAppsData }));
        }
        catch (e) {
        }
    }
    getHotApppIndex(name) {
        for (let i = 0; i < this.hotApps.length; i++) {
            if (this.hotApps[i].name == name)
                return i;
        }
        return null;
    }
    lastSwitchedApp(hotApp) {
        const hotAppIndex = this.getHotApppIndex(hotApp.name);
        if (this.lastHotAppIndex != null) {
            console.log(this.lastHotAppIndex);
            document.getElementById('app-' + this.lastHotAppIndex).className = 'app';
        }
        document.getElementById('app-' + hotAppIndex).className = 'app active';
        this.lastHotAppIndex = hotAppIndex;
    }
    openApp(index) {
        let hotAppData = this.hotApps[index];
        open(hotAppData.path);
    }
}
exports.default = Switch;
document.onkeydown = (e) => {
    const press = window.event ? window.event : e;
    if (press.keyCode == 82 && press.ctrlKey) {
        e.preventDefault();
        e.stopPropagation();
    }
};
//# sourceMappingURL=switch.js.map