import { SwitchHotApp } from './interfaces';
const fileIcon = require("extract-file-icon");

const open = require('open');
// const bat = require.resolve('./win-run-get-pid.bat');
// const {exec} = require ('child_process');
// config.clear();


export default class Switch {
    hotApps: SwitchHotApp[] | null;
    hotApp: SwitchHotApp = { empty: true, name: '', rawcode: null, path: '', icon: '' };
    lastHotAppIndex: number = null;

    runningHotApps = [];

    constructor(public config) {
        this.awakeAppList();
        this.hotApps = this.getHotApps();
        this.renderUIUpdate();
    }

    // get list of hot apps
    getHotApps(): SwitchHotApp[] | null {
        let data = this.config.get('hotApps');
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
            // elem.title = 'No app chosen';
            if (hot.empty) continue;
            elem.className = 'app';
            // elem.title = hot.name.split('.exe')[0];
            let icon: HTMLImageElement = document.createElement('img');
            icon.onclick = function() {
                icon.classList.add('animated');
                icon.classList.add('bounce');
                setTimeout(()=>{
                    icon.classList.remove('animated');
                    icon.classList.remove('bounce');
                    (window as any).APP.openApp(this);
                }, 1000);
            }.bind(i);
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
        // appTile.title = 'No app chosen';
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
        // get app icon
        const icon = fileIcon(file.path, 32).toString('base64');
        if (file.type == 'application/x-msdownload') {
            let opsys = process.platform;
            if (opsys == 'darwin') {

            } else if (opsys == "win32" || 'win64') {
                (window as any).APP.addApp(elem.target.id.split('-')[2], file, icon);
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
        this.config.set('hotApps', update);
        // send update to background service
        let hotAppsData = [];
        update.forEach(hot => {
            hotAppsData.push({name: hot.name, path: hot.path, rawcode: hot.rawcode})
        });
        try {
            (window as any).SWITCH_SERVICE_CHANNEL.emit('switch-service-incoming', JSON.stringify({type:'update-hot-apps', data: hotAppsData}));
        } catch(e)
        {

        }
    }

    getHotApppIndex(name)
    {
        for(let i = 0; i < this.hotApps.length; i++)
        {
            if(this.hotApps[i].name == name) return i;
        }
        return null;
    }

    lastSwitchedApp(hotApp)
    {
        const hotAppIndex = this.getHotApppIndex(hotApp.name);
        console.log('new', hotAppIndex);
        if(this.lastHotAppIndex != null)
        {
            console.log(this.lastHotAppIndex);
            document.getElementById('app-'+this.lastHotAppIndex).className = 'app';
        }

        document.getElementById('app-'+hotAppIndex).className = 'app active';
        this.lastHotAppIndex = hotAppIndex;
    }

    openApp(index)
    {

        console.log('before', this.runningHotApps);
        let hotAppData = this.hotApps[index];
        open(hotAppData.path);
    //     exec(bat+' "'+hotAppData.path+'"', {shell: true}, (err,stdout,stderr)=>{
    //         if (err){
    //          console.log(err);
    //          console.log(stderr);
    //         } else {
    //             console.log(stdout);
    //             let pid = parseInt(stdout.split('"')[1]);
    //             console.log(pid);
    //             this.runningHotApps.push({name: hotAppData.name, path: hotAppData.path, rawcode: hotAppData.rawcode, pid: pid});
    //             console.log(this.runningHotApps);
    //             // send message to swicth bg..
    //             try {
    //                 (window as any).SWITCH_SERVICE_CHANNEL.emit('switch-service-incoming', JSON.stringify({type:'update-hot-apps', data: this.runningHotApps}));
    //             } catch(e)
    //             {

    //             }
    //         }
    //        });
        
    }

}