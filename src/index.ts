const css = require("./style.css");
import { shouldPhlagStart, getBaseUrl, sanitizeString, fetchWithCsrf, IApiClient, ApiClient } from "./utils";
import {
  OPACITY_DURATION_MILLIS,
  Phocas_Features_Link,
  PhlagDocoLink,
} from "./constants";

import { FeatureFlag, FeatureFlagScope, FeatureFlagValue, FlagUserInterface, SettingDto } from "./types";
import { OrganisationSettingService, UserSettingService } from "./settingServices";

class PhocasPhlag implements FlagUserInterface {
  hidden = true;
  overlay: HTMLDivElement | null = null;
  phlagDialog: HTMLDivElement | null = null;
  isDomLoaded: boolean = false;

  private client: IApiClient;
  private userSettingService: UserSettingService;
  private orgSettingService: OrganisationSettingService;

  constructor()
  {
    this.client = new ApiClient(getBaseUrl());
    this.userSettingService = new UserSettingService(this.client);
    this.orgSettingService = new OrganisationSettingService(this.client);
  }

  createPhlagDialog() {
    const div = document.createElement("div");
    div.id = "phlag-container";
    div.innerHTML = `
		<div id="phlag">
    <a target="_blank" href="${Phocas_Features_Link}" id="phlag-header">Go to feature flag documentation...</a>
    <div id="flag-container"></div>
    <div id="flag-footer">
      <a target="_blank" href="${PhlagDocoLink}" >Version 1.2.0</a>
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

  private static getMostNarrowScope(scopes: FeatureFlagScope[]): FeatureFlagScope {
    if (scopes.includes("User")) {
      return "User";
    }

    if (scopes.includes("Organisation")) {
      return "Organisation";
    }

    if (scopes.includes("Environment")) {
      return "Environment";
    }

    throw new Error("Cannot find the most narrow scope of no scopes!");
  }

  async loadFlagValues(): Promise<SettingDto[]> {
    return (await Promise.all([
      this.userSettingService.getAll(),
      this.orgSettingService.getAll()
    ])).flat();
  }
  
  async loadFlagDefinitions(): Promise<FeatureFlag[]> {
    const response = await this.client.get("/api/settings/feature-flags");
    return response.json() as Promise<FeatureFlag[]>;
  }

  async fetchFlagDataInParallel(): Promise<[FeatureFlag[], SettingDto[]]> {
    return Promise.all([this.loadFlagDefinitions(), this.loadFlagValues()])
  }

  async toggleFlag(id: number | null, value: string, definition: FeatureFlag) {
    let newValue: FeatureFlagValue;

    if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
      // we're working with booleans
      newValue = !(value.toLocaleLowerCase() === "true")
    } else {
      // If we're working with string options...
      newValue = value;
    }

    if (id === null) {
      await this.createFlag(definition.name, newValue, definition);
    } else {
      await this.updateFlag(id, definition.name, newValue, definition);
    }

    window.location.reload();
  }

  createFlag(name: string, value: FeatureFlagValue, definition: FeatureFlag) {
    const scope = PhocasPhlag.getMostNarrowScope(definition.scopes);

    const setting: Omit<SettingDto, "id"> = {
      name,
      value
    };

    switch (scope)
    {
      case "Environment":
        throw new Error();
      case "Organisation":
        return this.orgSettingService.create(setting);
      case "User":
        const userId = window.phocas?.app.user.id;
        if (typeof userId === "undefined") {
          throw new Error("Cannot find the user's ID.");
        }
        return this.userSettingService.create({
          ...setting,
          userId
        });
    }

    
  }

  updateFlag(id: number, name: string, value: FeatureFlagValue, definition: FeatureFlag) {
    const scope = PhocasPhlag.getMostNarrowScope(definition.scopes);
    const setting: SettingDto = {
      id,
      name,
      value,
    };

    switch (scope) {
      case "Environment":
        throw new Error();
      case "Organisation":
        return this.orgSettingService.update(setting);
      case "User":
        const userId = window.phocas?.app.user.id;
        if (typeof userId === "undefined" || userId == null) {
          throw new Error("Could not find userId");
        }
        return this.userSettingService.update({
          ...setting,
          userId
        });
    }
  }

  static generateUniqueId() {
    if (typeof(this.generateUniqueId.prototype.count) === 'undefined') {
      this.generateUniqueId.prototype.count = 1;
    }

    return "new-" + (this.generateUniqueId.prototype.count++).toString();
  }

  async showGlobalFlags() {
    if (this.isDomLoaded) {
      return;
    }

    const [definitions, values] = await this.fetchFlagDataInParallel();
    const flagContainerDiv = document.getElementById("flag-container");

    definitions.forEach((definition) => {
      const setting = values.find(({name}) => definition.name === name) ?? null;
      const value = setting === null ? definition.defaultValue === null ? false : JSON.parse(definition.defaultValue) : setting.value;
      const inputId = setting?.id ?? PhocasPhlag.generateUniqueId();
      const scope = PhocasPhlag.getMostNarrowScope(definition.scopes);
      const disabled = scope === "Environment";

      if (
        value.toLowerCase() === "true" ||
        value.toLowerCase() === "false"
      ) {
        // Build the row and set the boolean
        const flagRow = `<div class='flag-row'>
          <div class='flag-title'>${definition.displayName ?? definition.name}</div>
          <div>
          <input type="checkbox" class="flagCheckbox" id="flag-${inputId}" ${
          value.toLowerCase() === "true" && "checked"
        } ${disabled && "disabled"} /><label class="flagCheckboxLabel" for="flag-${inputId}" id="label-flag-${inputId}"></label>
          </div>
        </div>`;

        // Add to our flag container div
        flagContainerDiv?.insertAdjacentHTML("beforeend", flagRow);

        // add click event listener for each element
        document
          .querySelector(`input[id="flag-${inputId}"]`)
          ?.addEventListener("change", () => {
            this.toggleFlag(
              setting?.id ?? null,
              value,
              definition,
            );
          });

        return;
      }

      //Build a row for features with string options
      const isMultiValFeature = definition.possibleValues !== null && definition.possibleValues.length > 0;
        
      if (isMultiValFeature) {
        // Build the row and set the string values
        let flagRow = `<div class='flag-row'>
          <div class='flag-title'>${definition.name} </div>
          <div>
            <select class="feature-select" id="select-${inputId}" ${disabled && "disabled"}>
            </select>
          </div>
        </div>`;

        // Add row to our flag container div
        flagContainerDiv?.insertAdjacentHTML("beforeend", flagRow);

        // Build the list of options and append to the row
        definition.possibleValues?.forEach((possibleValue) => {
          const unwrappedValue = JSON.parse(possibleValue);
          const optionElement = document.createElement("option");

          optionElement.value = unwrappedValue;
          optionElement.text = unwrappedValue;

          // set the active option
          if (value === unwrappedValue) {
            optionElement.selected = true;
          }

          const selectDropdown = document.getElementById(
            `select-${inputId}`
          ) as HTMLSelectElement | null;

          if (selectDropdown !== null) {
            // Add our options to the HTML select
            selectDropdown.appendChild(optionElement);

            // add click event listener for the select element
            selectDropdown.addEventListener("change", () => {
              const selectedValue =
                selectDropdown?.options[selectDropdown.selectedIndex].value;
              this.toggleFlag(setting?.id ?? null, selectedValue, definition);
            });
          }
        });
      }
    });

    // we now have data in the DOM for this page session - prevent newer API calls
    this.isDomLoaded = true;
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
        await this.showGlobalFlags();
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
