import {
  OPACITY_DURATION_MILLIS,
  PhlagDocoLink,
  Phocas_Features_Link,
} from "./constants";
import { MultiValueFeatures, getFeatureFlagOptions } from "./features";
import { Feature, FlagUserInterface } from "./types";
import { getBaseUrl, sanitizeString } from "./utils";
import {
  createBooleanFlagRow,
  createMultiValueFlagRow,
  createPhlagDialog,
} from "./UI";
import { loadGlobalFlags } from "./client";
const css = require("./style.css");

export class PhocasPhlag implements FlagUserInterface {
  hidden = true;
  overlay: HTMLDivElement | null = null;
  phlagDialog: HTMLDivElement | null = null;
  isDomLoaded: boolean = false;

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
        this.phlagDialog = createPhlagDialog(
          Phocas_Features_Link,
          PhlagDocoLink
        );
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

  async toggleFlag(id: number, value: string, featureName: string) {
    let jsonBody = {};

    if (Object.keys(MultiValueFeatures).includes(featureName)) {
      // If we're working with string options...
      jsonBody = { name: featureName, value: value };
    } else {
      // we're working with booleans
      let valueState: boolean = false;
      if (value.toLocaleLowerCase() === "true") {
        valueState = false;
      } else {
        valueState = true;
      }

      jsonBody = { name: featureName, value: valueState };
    }

    await fetch(`${getBaseUrl()}/api/settings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonBody),
    });

    this.hide();
    window.location.reload();
  }

  async showGlobaFlags() {
    if (this.isDomLoaded) {
      return;
    }

    const data = await loadGlobalFlags();
    let flagsList = data.Rows;
    let flagContainerDiv = document.getElementById("flag-container");

    flagsList.map((setting: any) => {
      const feature: Feature = {
        id: setting.Key,
        name: sanitizeString(setting.Values.Name),
        value: setting.Values.Value,
      };

      if (
        feature.value.toLowerCase() === "true" ||
        feature.value.toLowerCase() === "false"
      ) {
        // Build the row and set the boolean
        let flagRow = createBooleanFlagRow(feature);

        // Add to our flag container div
        flagContainerDiv?.insertAdjacentHTML("beforeend", flagRow);

        // add click event listener for each element
        document
          .querySelector(`input[id="flag-${feature.id}"]`)
          ?.addEventListener("change", () => {
            this.toggleFlag(feature.id, feature.value, feature.name);
          });
      }

      //Build a row for features with string options
      const isMultiValFeature = Object.keys(MultiValueFeatures).includes(
        feature.name
      );
      if (isMultiValFeature) {
        // Build the row and set the string values
        let flagRow = createMultiValueFlagRow(feature);

        // Add row to our flag container div
        flagContainerDiv?.insertAdjacentHTML("beforeend", flagRow);

        // Build the list of options and append to the row
        getFeatureFlagOptions(feature.name).forEach((mode) => {
          let optionElement = document.createElement("option");

          // set the active option
          if (feature.value === mode) {
            optionElement.value = mode;
            optionElement.text = mode;
            optionElement.selected = true;
          } else {
            optionElement.value = mode;
            optionElement.text = mode;
          }

          const selectDropdown = document.getElementById(
            `select-${feature.id}`
          ) as HTMLSelectElement | null;

          if (selectDropdown) {
            // Add our options to the HTML select
            selectDropdown.appendChild(optionElement);

            // add click event listener for the select element
            selectDropdown.addEventListener("change", () => {
              const selectedValue =
                selectDropdown?.options[selectDropdown.selectedIndex].value;
              this.toggleFlag(feature.id, selectedValue, feature.name);
            });
          }
        });
      }

      // we now have data in the DOM for this page session - prevent newer API calls
      this.isDomLoaded = true;
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
