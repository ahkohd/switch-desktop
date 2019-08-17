import { SwitchHotApp } from './interfaces';
const fileIcon = require("extract-file-icon");
const open = require('open');
const path = require('path');

export default class Switch {

    hotApps: SwitchHotApp[] | null;
    hotApp: SwitchHotApp = { empty: true, name: '', rawcode: null, path: '', icon: '' };
    lastHotAppIndex: number = null;
    runningHotApps = [];


    constructor(public config) {
        // Create hot apps elements
        this.awakeAppList();
        // Get them from store
        this.hotApps = this.getHotApps();
        // Render them
        this.renderUIUpdate();
    }

    /**
     * Get a list of hot apps
     * @returns SwitchHotApp
     */
    getHotApps(): SwitchHotApp[] | null {
        let data = this.config.get('DockHotApps');
        if (data == null) {
            data = [];
            for (let i = 0; i < 10; i++) data.push(this.hotApp);
            this.saveHotApps(data);
        }
        return data;
    }

    /**
     * Render Changes
     */
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

    /**
     * Bootstrap the appbar UI elements
     */ 
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

    /**
     * Resets the hot app tile of as given index
     * @param {number} i Index to reset
     */ 
    resetAppTileUI(i: number) {
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

    /**
     * Handles click event when user want to add new app
     * @param {Event} elem - Event
     */
    onClickAddHotApp(elem) {

        const file = elem.target.files[0];
        if(this.checkIfAppExists(file.path, file.name))
        {
            alert('App already exists in dock!');
            return;
        }

        // get app icon
        const icon = fileIcon(file.path, 32).toString('base64');
        let opsys = process.platform;
        if(opsys == 'darwin' && path.extname(file.path) == '.app')
        {
            (window as any).APP.addApp(elem.target.id.split('-')[2], file, icon);
        } else if(file.type == 'application/x-msdownload' && path.extname(file.path.toLowerCase()) == '.exe' && (opsys == "win32" || 'win64'))
        {
            (window as any).APP.addApp(elem.target.id.split('-')[2], file, icon);
        } else {
            alert('Please select an app.');
        }
    }

    /**
     * Checks if an app with a given name and path already exists
     * @param  {string} path
     * @param  {string} name
     */
    checkIfAppExists(path: string, name: string)
    {
        const nameExits = this.hotApps.filter(hotapp=>hotapp.name.toLowerCase() == name.toLocaleLowerCase());
        const pathExists = this.hotApps.filter(hotapp=>hotapp.path.toLowerCase() == path.toLowerCase());
        return (pathExists.length == 0 || nameExits.length == 0) ? false : true;
    }

    
    /**
     * Adds a new app and save it details
     * @param  {any} index
     * @param  {any} fileDetails
     * @param  {string} appIcon
     */
    addApp(index: any, fileDetails: any, appIcon: string) {
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

    /**
     * Removes an hotapp of given index and update store.
     * @param {number} index 
     */
    removeApp(index: number) {
        this.hotApps[index] = this.hotApp;
        this.saveHotApps(this.hotApps);
        this.resetAppTileUI(index);
    }

    /**
     * Saves hotapps update into the store
     * @param {any} update 
     */
    saveHotApps(update)
    {
        this.config.set('DockHotApps', update);
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


    /**
     * Get the hot app index of a given hot app name
     * @param {string} name Hot app name
     */
    getHotApppIndex(name: string)
    {
        for(let i = 0; i < this.hotApps.length; i++)
        {
            if(this.hotApps[i].name == name) return i;
        }
        return null;
    }

    /**
     * Sets the last switched hot app
     * @param hotApp Last switched hot app
     */
    lastSwitchedApp(hotApp)
    {
        const hotAppIndex = this.getHotApppIndex(hotApp.name);
        // console.log('new', hotAppIndex);
        if(this.lastHotAppIndex != null)
        {
            console.log(this.lastHotAppIndex);
            document.getElementById('app-'+this.lastHotAppIndex).className = 'app';
        }

        document.getElementById('app-'+hotAppIndex).className = 'app active';
        this.lastHotAppIndex = hotAppIndex;
    }

    /**
     * Open a hot app with a given index
     * @param {number} index Index of the hot app to open 
     */
    openApp(index: number)
    {

        // console.log('before', this.runningHotApps);
        let hotAppData = this.hotApps[index];
        open(hotAppData.path);
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