import { Feature } from "./types";

/**
 * Creates the main UI dialog
 * @param phocasFeatures A list with all Phocas feature flags
 * @param phlagDocoLink Documentation to flag app
 * @returns UI dialog
 */
export const createPhlagDialog = (
  phocasFeatures: string,
  phlagDocoLink: string
) => {
  const div = document.createElement("div");
  div.id = "phlag-container";
  div.innerHTML = `
            <div id="phlag">
        <a target="_blank" href="${phocasFeatures}" id="phlag-header">Go to feature flag documentation...</a>
        <div id="flag-container"></div>
        <div id="flag-footer">
        <a target="_blank" href="${phlagDocoLink}" >Version 1.2.1</a>
        <button id="beta-button" class="disabled">BETA</button>
        </div>
        </div>
            `;
  return div;
};

/**
 * Creates the UI for a feature flag row
 * @param Flag
 * @returns
 */
export const createBooleanFlagRow = ({ id, name, value }: Feature) => {
  return `<div class='flag-row'>
            <div class='flag-title'>${name} </div>
            <input type="checkbox" class="flagCheckbox" id="flag-${id}" ${
    value.toLowerCase() === "true" && "checked"
  }></input><label class="flagCheckboxLabel" for="flag-${id}" id="label-flag-${id}"></label>
          </div>`;
};

export const createMultiValueFlagRow = ({ id, name, value }: Feature) => {
  return `<div class='flag-row'>
  <div class='flag-title'>${name} </div>
  <div>
    <select class="feature-select" id="select-${id}">
    </select>
  </div>
</div>`;
};
