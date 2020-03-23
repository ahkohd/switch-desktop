import { SwitchHotApp } from "./interfaces";
import * as Tether from "tether";
import { EXE_RELATED_CONTENT_TYPES } from "./const";
const fileIcon = require("extract-file-icon");
const open = require("open");
const path = require("path");

const remote = require("electron").remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

export class Switch {
  hotApps: SwitchHotApp[] | null;
  hotApp: SwitchHotApp = {
    empty: true,
    name: "",
    rawcode: null,
    path: "",
    icon: ""
  };
  lastHotAppIndex: number = null;
  runningHotApps = [];

  constructor(public config) {
    /// Create hot apps elements
    this.awakeAppList();
    /// Get them from store
    this.hotApps = this.getHotApps();
    /// Render them
    this.renderUIUpdate();
    /// Set up context menu
    this.setUpContextMenu();
  }

  /**
   * Get a list of hot apps
   * @returns SwitchHotApp
   */

  getHotApps(): SwitchHotApp[] | null {
    let data = this.config.get("DockHotApps");
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
    const appsListUI: HTMLCollectionOf<HTMLDivElement> = document.getElementsByClassName(
      "app"
    ) as HTMLCollectionOf<HTMLDivElement>;
    for (let i = 0; i < this.hotApps.length; i++) {
      let elem = appsListUI[i];
      let hot = this.hotApps[i];
      if (hot.empty) continue;
      elem.className = "app tooltip";
      /// Tooltip
      document.getElementById("tip-" + i).innerHTML = `<p>${
        hot.name.split(".exe")[0]
      }</p>`;
      let icon: HTMLImageElement = document.createElement("img");
      icon.dataset.hotAppId = i.toString();
      icon.dataset.appName = hot.name;
      icon.id = "ic-" + i;
      icon.onclick = function() {
        icon.classList.add("animated");
        icon.classList.add("bounce");
        setTimeout(() => {
          icon.classList.remove("animated");
          icon.classList.remove("bounce");
          (window as any).APP.openApp(this);
        }, 1000);
      }.bind(i);

      icon.src = "data:image/png;base64," + hot.icon;
      icon.className = "icon";
      elem.innerHTML = "";
      elem.append(icon);
    }

    Tether.position();
  }

  /**
   * Bootstrap the appbar UI elements
   */

  awakeAppList() {
    const track = document.getElementById("track");
    for (let i = 0; i < 10; i++) {
      const div = document.createElement("div");
      const file = document.createElement("input");
      div.id = "app-" + i;
      div.className = "app empty tooltip";
      div.innerHTML += `<div id="tip-${i}" class="tooltiptext ${
        i == 0 ? "top" : ""
      }"><p>Add app</p></div>`;
      file.type = "file";
      /// Remove default title behaviour.
      file.title = "";
      /// if(process.platform == 'darwin') file.accept = ".app";
      file.id = "f-app-" + i;
      file.addEventListener("change", e => {
        (window as any).APP.onClickAddHotApp(e);
      });
      div.appendChild(file);
      track.appendChild(div);

      /// Place tooltip
      new Tether({
        element: document.getElementById("tip-" + i),
        target: div,
        attachment: "middle center",
        targetAttachment: i == 0 ? "bottom center" : "top center",
        offset: i == 0 ? "-8px 0" : "8px 0",
        constraints: [
          {
            to: "scrollParent"
          }
        ]
      });

      /// Add hover eventlistner
      div.onmouseenter = () => {
        document.getElementById("tip-" + i).classList.add("show");
      };

      div.onmouseleave = () => {
        document.getElementById("tip-" + i).classList.remove("show");
      };
    }
  }

  /**
   * Resets the hot app tile of as given index
   * @param {number} i Index to reset
   */

  resetAppTileUI(i: number) {
    const appTile = document.getElementById("app-" + i);
    appTile.innerHTML = "";
    appTile.className = "app empty tooltip";
    document.getElementById("tip-" + i).innerHTML = `<p>Add app</p>`;
    const file = document.createElement("input");
    file.type = "file";
    file.id = "f-app-" + i;
    file.title = "";
    /// if(process.platform == 'darwin') file.accept = ".app";
    file.addEventListener("change", e => {
      (window as any).APP.onClickAddHotApp(e);
    });
    appTile.appendChild(file);
  }

  /**
   * Handles click event when user want to add new app
   * @param {Event} elem - Event
   */

  onClickAddHotApp(elem) {
    if (process.platform == "darwin") (window as any).SHOW_DOCK();

    /// Request dock to appear. A fix for macOS - dock disappears while add app..
    try {
      (window as any).SWITCH_SERVICE_CHANNEL.emit(
        "switch-service-incoming",
        JSON.stringify({
          type: "show-dock"
        })
      );

      const file = elem.target.files[0];
      if (this.checkIfAppExists(file.path, file.name)) {
        alert("App already exists in dock!");
        return;
      }

      /// Get app icon
      let opsys = process.platform;
      if (
        opsys == "darwin" &&
        file.path.toLowerCase().split("/pkginfo").length == 2
      ) {
        const chunck = file.path.split(".app");
        const p = chunck[0].split("/");
        const appPath = chunck[0] + ".app";
        const icon = fileIcon(appPath, 64).toString("base64");
        (window as any).APP.addApp(
          elem.target.id.split("-")[2],
          { name: p[p.length - 1], path: appPath },
          icon
        );
      } else if (
        EXE_RELATED_CONTENT_TYPES.includes(file.type) &&
        path.extname(file.path.toLowerCase()) == ".exe" &&
        (opsys == "win32" || "win64")
      ) {
        const icon = fileIcon(file.path, 32).toString("base64");
        (window as any).APP.addApp(elem.target.id.split("-")[2], file, icon);
      } else {
        alert("Please select an app!");
      }
    } catch (e) {}
  }

  /**
   * Checks if an app with a given name and path already exists
   * @param  {string} path
   * @param  {string} name
   */

  checkIfAppExists(path: string, name: string) {
    const nameExits = this.hotApps.filter(
      hotapp => hotapp.name.toLowerCase() == name.toLocaleLowerCase()
    );
    const pathExists = this.hotApps.filter(
      hotapp => hotapp.path.toLowerCase() == path.toLowerCase()
    );
    return pathExists.length == 0 || nameExits.length == 0 ? false : true;
  }

  /**
   * Adds a new app and save it details
   * @param  {any} index
   * @param  {any} fileDetails
   * @param  {string} appIcon
   */

  addApp(index: any, fileDetails: any, appIcon: string) {
    let mapDarwinKeycode = parseInt(index) + 2;
    if (mapDarwinKeycode == 10) mapDarwinKeycode = 0;
    this.hotApps[index] = {
      empty: false,
      name: fileDetails.name,
      path: fileDetails.path,
      icon: appIcon,
      rawcode:
        process.platform == "darwin" ? mapDarwinKeycode : 49 + parseInt(index)
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

  saveHotApps(update) {
    this.config.set("DockHotApps", update);
    /// Send update to background service
    let hotAppsData = [];
    update.forEach(hot => {
      hotAppsData.push({
        name: hot.name,
        path: hot.path,
        rawcode: hot.rawcode
      });
    });
    try {
      (window as any).SWITCH_SERVICE_CHANNEL.emit(
        "switch-service-incoming",
        JSON.stringify({ type: "update-hot-apps", data: hotAppsData })
      );
    } catch (e) {}
  }

  /**
   * Get the hot app index of a given hot app name
   * @param {string} name Hot app name
   */

  getHotApppIndex(name: string) {
    for (let i = 0; i < this.hotApps.length; i++) {
      if (this.hotApps[i].name == name) return i;
    }
    return null;
  }

  /**
   * Sets the last switched hot app
   * @param hotApp Last switched hot app
   */

  lastSwitchedApp(hotApp) {
    const hotAppIndex = this.getHotApppIndex(hotApp.name);
    if (this.lastHotAppIndex != null) {
      document.getElementById("app-" + this.lastHotAppIndex).className = "app";
    }

    document.getElementById("app-" + hotAppIndex).className = "app active";
    this.lastHotAppIndex = hotAppIndex;
  }

  /**
   * Open a hot app with a given index
   * @param {number} index Index of the hot app to open
   */

  openApp(index: number) {
    let hotAppData = this.hotApps[index];
    open(hotAppData.path);
  }

  onRightClick() {}

  /**
   * Builds new context menu which triggers functions of the
   * hot app provided.
   * @param {number} i Index of the hot app
   * @returns {Menu} The built menu
   */

  buildContextMenuBasedOnHotAppIndex(i: number) {
    const menu = new Menu();
    const menuItems = [
      {
        label: "Launch app",
        click: () => {
          this.openApp(i);
        }
      },
      {
        label: "Remove app",
        click: () => {
          this.removeApp(i);
        }
      }
    ];

    menuItems.forEach(item => {
      menu.append(new MenuItem(item));
    });

    return menu;
  }

  /**
   * Add event listener on context menu.
   */

  setUpContextMenu() {
    window.addEventListener(
      "contextmenu",
      e => {
        e.preventDefault();
        const elem = e.target as HTMLElement;
        // if the element has a data attribute data-hotAppId.
        if (elem.dataset.hotAppId) {
          const hotAppID = parseInt(elem.dataset.hotAppId);
          document.getElementById("tip-" + hotAppID).classList.remove("show");
          const menu = this.buildContextMenuBasedOnHotAppIndex(hotAppID);
          menu.popup(remote.getCurrentWindow() as any);
        }
      },
      false
    );
  }
}

export function osSpecificAppearance() {
  const opsys = process.platform;
  const appBar = document.getElementById("appbar");
  if (opsys == "win32") {
    appBar.style.borderRadius = "0px";
  } else if (opsys == "darwin") {
    appBar.classList.add("mac-style");
  }
}
