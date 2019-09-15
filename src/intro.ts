const remote = require('electron').remote;
const Store = require('electron-store');
const config = new Store({
   projectName: 'SwitchDock'
});

// Initialize analytics...
import { initAnalytics, firstUseAnalytics } from './analytics';
const uuid = initAnalytics(config);
firstUseAnalytics(uuid);


export class Intro {
    currentIndex: number = 1;

    constructor()
    {
        let pane = this.getAllPanes();
        this.showPane(this.currentIndex);
    }

    getAllPanes(): HTMLCollectionOf<HTMLDivElement>
    {
        return document.getElementsByClassName('tip') as HTMLCollectionOf<HTMLDivElement>;
    }

    showPane(paneIndex: number)
    {
        let panes = this.getAllPanes();
        if(paneIndex < 1 || panes == null || panes.length == 0 || paneIndex > panes.length) return;
        this.currentIndex = paneIndex;
        for(let i = 0; i < panes.length; i++)
        {
            if(paneIndex-1 == i)
            {
                panes[i].style.display = 'block';
            } else {
                panes[i].style.display = 'none';
            }
        }

        if(paneIndex == 1)
        {
            this.hideElement('prev');
            this.showElement('next');
            this.hideElement('close');
        } else if(paneIndex == panes.length)
        {
            this.hideElement('next');
            this.showElement('prev');
            this.showElement('close');
        } else
        {
            this.showElement('prev');
            this.showElement('next');
            this.hideElement('close');
        }
        
    }

    next()
    {
        this.showPane(this.currentIndex+1);
    }

    prev()
    {
        this.showPane(this.currentIndex-1);
    }


    hideElement(id: string)
    {
        document.getElementById(id).style.display = 'none';
    }

    showElement(id: string)
    {
        document.getElementById(id).style.display = 'inline';
    }

    close()
    {
        config.set('showIntro', false);
        remote.getCurrentWindow().close();
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