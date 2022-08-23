const css = require("./style.css");
import { shouldPhlagStart, getBaseUrl } from "./utils";

import { ISearchContext, ISearchUserInterface } from "./types";

const OPACITY_DURATION_MILLIS = 200;
const Phocas_Features_Link =
  "https://helpphocassoftware.atlassian.net/wiki/spaces/DEV/pages/983663895/Feature+Flags?src=search";

class PhocasPhlag implements ISearchUserInterface, ISearchContext {
  hidden = true;
  overlay: HTMLDivElement | null = null;
  phlagDialog: HTMLDivElement | null = null;

  createPhlagDialog() {
    const div = document.createElement("div");
    div.id = "phlag-container";
    div.innerHTML = `
		<div id="phlag">
    <a target="_blank" href="${Phocas_Features_Link}" id="phlag-header">Go to feature flag documentation...</a>
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
      `${getBaseUrl()}/Administration/SystemSettings/Grid`,
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

  async toggleFlag(id: number, featureName: string, value: string) {
    // let valueState: boolean = false;
    // if (value === "true") {
    //   valueState = true;
    // } else {
    //   valueState = false;
    // }
    // const response = await fetch(`${getBaseUrl()}/api/settings/${id}`, {
    //   method: "PUT",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     name: `${featureName}`,
    //     value: valueState,
    //   }),
    // });

    console.log("wooow");
  }

  sanitizeString(str: string) {
    if (str === null || str === "") return false;
    else str = str.toString();

    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/gi, "");
  }

  async showGlobaFlags() {
    let data = await this.getGlobalFlags();
    let flagsList = data.Rows;
    let flagContainerDiv = document.getElementById("flag-container");
    let childNode = document.createElement("div");

    flagsList.map((setting: any) => {
      if (setting.Values.Value === "true" || setting.Values.Value === "false") {
        console.log(setting);
        childNode.innerHTML += `<div class='flag-row'>
          <div class='flag-title'>${this.sanitizeString(
            setting.Values.Name
          )} </div>
          <div>
          <input type="checkbox" id="flag-${setting.Key}" ${
          setting.Values.Value === "true" && "checked"
        } onClick={${this.toggleFlag(
          setting.Key,
          setting.Values.Name,
          setting.Values.Value
        )}}/><label for="flag-${setting.Key}" id="flag-${setting.Key}"></label>
          </div>
        </div>`;

        flagContainerDiv?.appendChild(childNode);
      }
    });
  }

  // <div>${setting.Values.Value}</div>
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
