import { remote }  from 'electron';

export default class AppsMenu {
    lastPos: number[];
    isOpened: boolean;
    constructor() {
        this.isOpened = false;
    }

    open(hotAppIndex: number)
    {
        const appBar = document.getElementById('appbar');
        const appsMenu = document.getElementById('appsMenu');
        const overlay = document.getElementById('overlay');
        overlay.style.borderRight = '1px solid rgba(255, 255, 255, .1)';

        this.isOpened = true;
        appBar.style.opacity = '0';
        setTimeout(()=> {
        document.getElementById('overlay').classList.add('acylic');
        appBar.style.opacity = '1';
        appBar.style.borderRight = 'none';
        appBar.classList.remove('acylic');
        appsMenu.classList.remove('acylic');
        appsMenu.style.display = 'block';
        const _window = remote.getCurrentWindow();
        this.lastPos = _window.getPosition();
        _window.setSize(450, 600, true);
        const centerPos = this._calculateCenterPos();
        _window.setPosition(centerPos[0], this.lastPos[1]);
        (window as any).DOCK_CAN_AUTO_HIDE = false;
        try{
            appsMenu.classList.remove('pane-out');
            appBar.classList.remove('phaseOut');

        } catch (e) {}
        appsMenu.classList.add('pane-in');
        this.addPickListners();
        }, 100);
        

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

        const appsMenu = document.getElementById('appsMenu');
        const appBar = document.getElementById('appbar');
        const _window = remote.getCurrentWindow();
        appsMenu.classList.remove('pane-in');
        appsMenu.classList.add('pane-out');
        appBar.classList.add('phaseOut');


        setTimeout(() => {
            appsMenu.style.display = 'none';
        }, 250);

        setTimeout(() => {
            // appsMenu.style.display = 'none';
            _window.setBounds({ width: 70, height: 600, x: this.lastPos[0], y: this.lastPos[1] }, true);
            document.getElementById('overlay').classList.remove('acylic');
            appBar.classList.add('acylic');
            appsMenu.classList.add('acylic');
            document.getElementById('overlay').style.borderRight = 'none';
            (window as any).DOCK_CAN_AUTO_HIDE = true;
        }, 300);
        //  300
        this.isOpened = false;
        if(appPicked) return appPicked;
    }


    _calculateCenterPos()
    {
        const {width, height} = window.screen;
        return [(width/2) - (450/2), 600];
    }
}