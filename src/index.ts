const css = require("./style.css");
import { shouldPowerSearchStart } from "./utils";

import { ISearchContext, ISearchUserInterface } from "./types";

const OPACITY_DURATION_MILLIS = 200;

class PhocasPhlag implements ISearchUserInterface, ISearchContext {
  hidden = true;
  overlay: HTMLDivElement | null = null;
  phlagDialog: HTMLDivElement | null = null;

  createPhlagDialog() {
    const div = document.createElement("div");
    div.id = "ppt-search-container";
    div.innerHTML = `
		<div>
      <span id='ppt-search-message' style='display: none'></span>
			<ul id='ppt-search-results'>
			</ul>
		</div>
		`;
    return div;
  }

  createOverlay = () => {
    const overlay = document.createElement("div");
    overlay.id = "ppt-search-overlay";
    overlay.innerHTML = `<style>${css.toString()}</style>`;
    return overlay;
  };

  getResultsList = () => {
    return document.getElementById("ppt-search-results") as HTMLDivElement;
  };

  async loadSearchTerms() {}

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
    document.body.addEventListener("keydown", (ev) => {
      if (
        ev.key === "/" &&
        !["TEXTAREA", "INPUT"].includes((ev?.target as HTMLElement).nodeName) &&
        !(ev?.target as HTMLElement).isContentEditable
      ) {
        if (this.show()) {
          ev.preventDefault();
        }
      }
    });
  }
}

async function main() {
  const phlag = new PhocasPhlag();
  if (await shouldPowerSearchStart()) {
    phlag.attachEventHandler();
    phlag.loadSearchTerms();
  }
}

main();
