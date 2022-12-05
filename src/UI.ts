import { Feature, User } from "./types";

/**
 * Creates the main UI dialog
 */
export const createPhlagDialog = (
  phocasFeatures: string,
  phlagDocoLink: string
) => {
  const div = document.createElement("div");
  div.id = "phlag-container";
  div.innerHTML = `
        <div id="phlag">
          <div id="phlag-header">
            <select class="mode-select" id="mode-select">
              <option value="Global" selected>Global</option>
              <option value="By User">User</option>
            </select>
            <select class="user-mode-feature-select" id="user-mode-feature-select" hidden>
              <option selected disabled hidden>Choose a user...</option>
            </select>
          </div>
          <div id="flag-container"></div>
          <div id="user-flag-container"></div>
          <div id="flag-footer">
            <a target="_blank" href="${phlagDocoLink}" >Version 1.2.1</a>
            <button id="beta-button" class="disabled">BETA</button>
          </div>
        </div>
            `;
  return div;

  // re-add later: <a target="_blank" href="${phocasFeatures}" id="phlag-header">Go to feature flag documentation...</a>
};

/**
 * Creates the UI for a feature flag row
 */
export const createBooleanFlagRow = ({ id, name, value }: Feature) => {
  return `<div class='flag-row'>
            <div class='flag-title'>${name} </div>
              <div style='display: flex; flex-direction: row; align-items: center;'>
                <input type="checkbox" class="flagCheckbox" id="flag-${id}" ${
    value.toLowerCase() === "true" && "checked"
  }></input><label class="flagCheckboxLabel" for="flag-${id}" id="label-flag-${id}"></label>
                <!--<div class="user-icon" id="user-icon-${id}"></div> -->
              </div>
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

export const createUserFlagRow = (user: User) => {
  return `<div class='flag-row'>
            <div class='flag-title'>${user.name} </div>
              <div style='display: flex; flex-direction: row; align-items: center;'>
                <input type="checkbox" class="flagCheckbox" id="flag-${user.id}" 
                  "checked"}>
                </input><label class="flagCheckboxLabel" for="flag-${user.id}" id="label-flag-${user.id}"></label>
              </div>
          </div>`;
};
