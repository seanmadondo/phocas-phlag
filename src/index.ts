const css = require("./style.css");
import { shouldPhlagStart, getBaseUrl } from "./utils";

import { ISearchContext, ISearchUserInterface } from "./types";
// const logo = require("./assets/phlag_logo.png");

const OPACITY_DURATION_MILLIS = 200;

class PhocasPhlag implements ISearchUserInterface, ISearchContext {
  hidden = true;
  overlay: HTMLDivElement | null = null;
  phlagDialog: HTMLDivElement | null = null;

  createPhlagDialog() {
    const div = document.createElement("div");
    div.id = "phlag-container";
    div.innerHTML = `
		<div id="phlag">
    <div id="phlag-header">Phlag</div>
    <div id="tab-menu">
      <button class="tablink">Global</button>
      <button class="tablink">User</button>
    </div>
    <div id="flag-container"></div>
    </div>
		`;
    return div;
  }

  createOverlay = () => {
    const overlay = document.createElement("div");
    overlay.id = "phlag-overlay";
    overlay.innerHTML = `<style>${css.toString()}</style>`;
    return overlay;
  };

  closeOverlayKeyDownHandler = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      if (this.hide()) {
        ev.preventDefault();
      }
    }
  };

  show = () => {
    if (this.hidden) {
      if (this.overlay === null) {
        this.overlay = this.createOverlay();
      }

      if (this.phlagDialog === null) {
        this.phlagDialog = this.createPhlagDialog();
      }

      document.body.appendChild(this.overlay);
      document.body.appendChild(this.phlagDialog);

      document.addEventListener("keydown", this.closeOverlayKeyDownHandler);

      this.hidden = false;

      this.fadeIn();
      return true;
    }
    return false;
  };

  hide() {
    if (!this.hidden) {
      this.fadeOut();
      document.removeEventListener("keydown", this.closeOverlayKeyDownHandler);
      this.hidden = true;
      return true;
    }
    return false;
  }

  async getGlobalFlags() {
    const response = await fetch(
      "http://localhost:8080/Administration/SystemSettings/Grid",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keysOnly: false,
          pageIndex: 0,
          sortColumn: "",
          sortDescending: false,
        }),
      }
    );
    return response.json();
  }

  async showGlobaFlags() {
    let data = await this.getGlobalFlags();
    let flagsList = data.Rows;
    let flagContainerDiv = document.getElementById("flag-container");
    let childNode = document.createElement("div");

    flagsList.map((setting: any) => {
      if (setting.Values.Value === "true" || setting.Values.Value === "false") {
        childNode.innerHTML += `<div class='flag-row'>
          <div class='flag-title'> ${setting.Values.Name} </div>
          <div>${setting.Values.Value}</div>
        </div>`;
        flagContainerDiv?.appendChild(childNode);
      }
    });
  }

  private fadeIn() {
    return new Promise<void>((resolve) => {
      if (this.overlay) {
        this.overlay.style.opacity = "0.7";
      }
      if (this.phlagDialog) {
        this.phlagDialog.style.opacity = "1.0";
      }
      setTimeout(() => resolve(), OPACITY_DURATION_MILLIS);
    });
  }

  private fadeOut() {
    return new Promise<void>((resolve) => {
      if (this.overlay) {
        this.overlay.style.opacity = "0";
      }
      if (this.phlagDialog) {
        this.phlagDialog.style.opacity = "0";
      }
      setTimeout(() => {
        this.overlay?.parentNode?.removeChild(this.overlay);
        this.phlagDialog?.parentNode?.removeChild(this.phlagDialog);
        resolve();
      }, OPACITY_DURATION_MILLIS);
    });
  }

  public attachEventHandler() {
    document.body.addEventListener("keydown", async (ev) => {
      if (ev.altKey && ev.key === "p") {
        if (this.show()) {
          ev.preventDefault();
        }
        await this.showGlobaFlags();
      }
    });
  }
}

async function main() {
  const phlag = new PhocasPhlag();
  if (await shouldPhlagStart()) {
    phlag.attachEventHandler();
  }
}

main();
