const css = require("./style.css");
import { shouldPhlagStart, getBaseUrl, sanitizeString } from "./utils";
import {
  OPACITY_DURATION_MILLIS,
  Phocas_Features_Link,
  PhlagDocoLink,
} from "./constants";

import { FlagUserInterface } from "./types";

class PhocasPhlag implements FlagUserInterface {
  hidden = true;
  overlay: HTMLDivElement | null = null;
  phlagDialog: HTMLDivElement | null = null;
  isDomLoaded: boolean = false;

  createPhlagDialog() {
    const div = document.createElement("div");
    div.id = "phlag-container";
    div.innerHTML = `
		<div id="phlag">
    <a target="_blank" href="${Phocas_Features_Link}" id="phlag-header">Go to feature flag documentation...</a>
    <div id="flag-container"></div>
    <div id="flag-footer">
      <a target="_blank" href="${PhlagDocoLink}" >Version 1.1</a>
      <button id="beta-button" class="disabled">BETA</button>
    </div>
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

  async loadGlobalFlags() {
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

  async toggleFlag(id: number, value: string, featureName: string) {
    let valueState: boolean = false;
    if (value.toLocaleLowerCase() === "true") {
      valueState = false;
    } else {
      valueState = true;
    }
    await fetch(`${getBaseUrl()}/api/settings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${sanitizeString(featureName)}`,
        value: valueState,
      }),
    });

    window.location.reload();
  }

  async showGlobaFlags() {
    if (this.isDomLoaded) {
      return;
    }

    const data = await this.loadGlobalFlags();
    let flagsList = data.Rows;
    let flagContainerDiv = document.getElementById("flag-container");

    flagsList.map((setting: any) => {
      if (
        setting.Values.Value.toLowerCase() === "true" ||
        setting.Values.Value.toLowerCase() === "false"
      ) {
        // Build the row and set the boolean
        let flagRow = `<div class='flag-row'>
          <div class='flag-title'>${sanitizeString(setting.Values.Name)} </div>
          <div>
          <input type="checkbox" class="flagCheckbox" id="flag-${
            setting.Key
          }" ${
          setting.Values.Value.toLowerCase() === "true" && "checked"
        }></input><label class="flagCheckboxLabel" for="flag-${
          setting.Key
        }" id="label-flag-${setting.Key}"></label>
          </div>
        </div>`;

        // Add to our flag container div
        flagContainerDiv?.insertAdjacentHTML("beforeend", flagRow);

        // add click event listener for each element
        document
          .querySelector(`input[id="flag-${setting.Key}"]`)
          ?.addEventListener("change", () => {
            this.toggleFlag(
              setting.Key,
              setting.Values.Value,
              setting.Values.Name
            );
          });

        // we now have data in the DOM - prevent newer calls
        this.isDomLoaded = true;
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
