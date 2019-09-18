import { remote }  from 'electron';

export default class AppsMenu {
    lastPos: number[];
    isOpened: boolean;
    constructor() {
        this.isOpened = false;
    }

    open(hotAppIndex: number)
    {
        const _window = remote.getCurrentWindow();
        this.lastPos = _window.getPosition();
        _window.setSize(450, 600);
        _window.setPosition(this.lastPos[0] - (380), this.lastPos[1]);
        document.getElementById('appsMenu').style.display = 'block';
        (window as any).DOCK_CAN_AUTO_HIDE = false;
        console.log('open');
        
        this.addPickListners();
    }

    addPickListners()
    {
        const elems = document.getElementsByClassName('app-card');
        for(const elem of elems)
        {
            elem.addEventListener('click', this.close.bind(this))
        }
    }

    close(e, appPicked?)
    {
        const _window = remote.getCurrentWindow();
        _window.setSize(70, 600);
        _window.setBounds({width: 70, height: 600, x: this.lastPos[0], y: this.lastPos[1]}, true)
        // _window.setPosition(this.lastPos[0], this.lastPos[1]);
        document.getElementById('appsMenu').style.display = 'none';
        // (window as any).DOCK_CAN_AUTO_HIDE = true;
        if(appPicked) return appPicked;
    }
}