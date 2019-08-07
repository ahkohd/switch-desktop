import { SwitchHotApp } from './interfaces';
const Conf = require('conf');
const config = new Conf({
    encryptionKey: '..kta#md!@a-k2j',
});
const iconExtractor = require('icon-extractor');
// config.clear();

export default class Switch {
    hotApps: SwitchHotApp[] | null;

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
            for (let i = 0; i < 10; i++) data.push({ empty: true, name: '', keycode: null, path: '', icon: ''});
            config.set('hotApps', data);
        }
        return data;
    }

    renderUIUpdate() {
        const appsListUI: HTMLCollectionOf<HTMLDivElement> = document.getElementsByClassName('app') as HTMLCollectionOf<HTMLDivElement>;
        for (let i = 0; i < this.hotApps.length; i++) {
            let elem = appsListUI[i];
            let hot = this.hotApps[i];
            if (hot.empty) return;
            elem.className = 'app';
            elem.title = hot.name.split('.exe')[0];
            let icon: HTMLImageElement = document.createElement('img');
            icon.src = 'data:image/png;base64,'+hot.icon;
            icon.className = 'icon';
            elem.innerHTML = "";
            elem.append(icon);
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
                (window as any).APP.onClickAddHotApp(e);
            })
            div.appendChild(file);
            track.appendChild(div);
        }
    }


    onClickAddHotApp(elem) {

        const file = elem.target.files[0];
        // console.log(file);
        if (file.type == 'application/x-msdownload') {
            let opsys = process.platform;
            if(opsys == 'darwin')
            {

            } else if (opsys == "win32" || 'win64') {
                // extract the app icon..
                iconExtractor.getIcon(elem.target.id, file.path);
            }
        } else {
            alert('Please select a app.');
        }
    }

    addApp(index, fileDetails, appIcon)
    {
        console.log(index);
        this.hotApps[index] = {
            empty: false,
            name: fileDetails.name,
            path: fileDetails.path,
            icon: appIcon,
            keycode: 2
        };
        config.set('hotApps', this.hotApps);
        console.log(this.hotApps[index]);
        this.renderUIUpdate();
    }
}


// listen for the icon extraction..
iconExtractor.emitter.on('icon', function(data){
    const icon = data.Base64ImageData;
    const filePickerid = data.Context;
    const fileDetails = (document.getElementById(filePickerid) as any).files[0];
    (window as any).APP.addApp(filePickerid.split('-')[2], fileDetails, icon);
});