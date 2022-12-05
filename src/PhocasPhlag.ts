import {
  OPACITY_DURATION_MILLIS,
  PhlagDocoLink,
  Phocas_Features_Link,
} from "./constants";
import { MultiValueFeatures, getFeatureFlagOptions } from "./features";
import { Feature, FlagUserInterface, User } from "./types";
import { getBaseUrl, sanitizeString } from "./utils";
import {
  createBooleanFlagRow,
  createMultiValueFlagRow,
  createPhlagDialog,
  createUserFlagRow,
} from "./UI";
import {
  getAllUsersForAdmin,
  getSettingsByID,
  loadGlobalFlags,
} from "./client";
const css = require("./style.css");

export class PhocasPhlag implements FlagUserInterface {
  hidden = true;
  overlay: HTMLDivElement | null = null;
  phlagDialog: HTMLDivElement | null = null;
  isFlagDataInDOM: boolean = false;
  isUserDataInDOM: boolean = false;

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

      this.initialisePhlagMode();
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

  initialisePhlagMode = () => {
    // Add eventListender for mode change: Global | User
    const modeDropdown = document.getElementById(
      "mode-select"
    ) as HTMLSelectElement | null;

    // Initialise User-Mode-Feature-Select.
    const userModeFeatureSelect = document.getElementById(
      "user-mode-feature-select"
    );

    if (modeDropdown) {
      // add click event listener for the mode select element
      modeDropdown.addEventListener("change", () => {
        const selectedValue =
          modeDropdown?.options[modeDropdown.selectedIndex].value;
        if (selectedValue === "Global") {
          this.showGlobaFlags();
          //hide the User Mode Feature select
          if (userModeFeatureSelect) {
            userModeFeatureSelect.setAttribute("hidden", "hidden");
          }
        }

        if (selectedValue === "By User") {
          this.setUserMode();

          //show the User Mode Feature select
          if (userModeFeatureSelect) {
            userModeFeatureSelect.removeAttribute("hidden");
          }
        }
      });
    }
  };

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

  async setUserMode() {
    if (this.isUserDataInDOM) {
      // show user level flags container
      let userFlagContainerDiv = document.getElementById("user-flag-container");
      if (userFlagContainerDiv) {
        userFlagContainerDiv.style.display = "flex";
      }

      // hide flag-container
      let flagContainerDiv = document.getElementById("flag-container");
      if (flagContainerDiv) {
        flagContainerDiv.style.display = "none";
      }
      return;
    }

    // hide flag-container
    const flagContainer = document.getElementById("flag-container");
    if (flagContainer) {
      flagContainer.style.display = "none";
    }

    // show users container
    let userFlagContainer = document.getElementById("user-flag-container");
    if (userFlagContainer) {
      userFlagContainer.style.display = "flex";
    }

    const data = await getAllUsersForAdmin();

    data.forEach((user: User) => {
      let optionElement = document.createElement("option");
      optionElement.value = user.name;
      optionElement.text = user.name;

      // Initialise User-Mode-Feature-Select.
      const userModeFeatureSelect = document.getElementById(
        "user-mode-feature-select"
      ) as HTMLSelectElement | null;

      userModeFeatureSelect?.appendChild(optionElement);

      // add click event listener for the select element
      userModeFeatureSelect?.addEventListener("change", () => {
        // const selectedValue =
        //   userModeFeatureSelect?.options[userModeFeatureSelect.selectedIndex]
        //     .value;
        this.showUserFlags(user.id);
      });
    });

    // we now have data in the DOM for this page session - prevent newer API calls
    this.isUserDataInDOM = true;
  }

  async showUserFlags(id: number) {
    const data = await getSettingsByID(id);
    let flagsList = data.Rows;

    // hide global flag-container
    const flagContainer = document.getElementById("flag-container");
    if (flagContainer) {
      flagContainer.style.display = "none";
    }

    // get users flag-container
    let userFlagContainer = document.getElementById("user-flag-container");

    this.mapFeatureFlags(flagsList, userFlagContainer);
  }

  async showGlobaFlags() {
    if (this.isFlagDataInDOM) {
      // hide user level flags container
      let userFlagContainerDiv = document.getElementById("user-flag-container");
      if (userFlagContainerDiv) {
        userFlagContainerDiv.style.display = "none";
      }

      // show flag-container
      let flagContainerDiv = document.getElementById("flag-container");
      if (flagContainerDiv) {
        flagContainerDiv.style.display = "flex";
      }
      return;
    }

    const data = await loadGlobalFlags();
    let flagsList = data.Rows;

    // hide user level flags container
    let userFlagContainerDiv = document.getElementById("user-flag-container");
    if (userFlagContainerDiv) {
      userFlagContainerDiv.style.display = "none";
    }

    // show flag-container
    let flagContainerDiv = document.getElementById("flag-container");
    if (flagContainerDiv) {
      flagContainerDiv.style.display = "flex";
    }

    this.mapFeatureFlags(flagsList, flagContainerDiv);

    // flagsList.map((setting: any) => {
    //   const feature: Feature = {
    //     id: setting.Key,
    //     name: sanitizeString(setting.Values.Name),
    //     value: setting.Values.Value,
    //   };

    //   if (
    //     feature.value.toLowerCase() === "true" ||
    //     feature.value.toLowerCase() === "false"
    //   ) {
    //     // Build the row and set the boolean
    //     let flagRow = createBooleanFlagRow(feature);

    //     // Add to our flag container div
    //     flagContainerDiv?.insertAdjacentHTML("beforeend", flagRow);

    //     // add click event listener for each element
    //     document
    //       .querySelector(`input[id="flag-${feature.id}"]`)
    //       ?.addEventListener("change", () => {
    //         this.toggleFlag(feature.id, feature.value, feature.name);
    //       });
    //   }

    //   //Build a row for features with string options
    //   const isMultiValFeature = Object.keys(MultiValueFeatures).includes(
    //     feature.name
    //   );
    //   if (isMultiValFeature) {
    //     // Build the row and set the string values
    //     let flagRow = createMultiValueFlagRow(feature);

    //     // Add row to our flag container div
    //     flagContainerDiv?.insertAdjacentHTML("beforeend", flagRow);

    //     // Build the list of options and append to the row
    //     getFeatureFlagOptions(feature.name).forEach((mode) => {
    //       let optionElement = document.createElement("option");

    //       // set the active option
    //       if (feature.value === mode) {
    //         optionElement.value = mode;
    //         optionElement.text = mode;
    //         optionElement.selected = true;
    //       } else {
    //         optionElement.value = mode;
    //         optionElement.text = mode;
    //       }

    //       const selectDropdown = document.getElementById(
    //         `select-${feature.id}`
    //       ) as HTMLSelectElement | null;

    //       if (selectDropdown) {
    //         // Add our options to the HTML select
    //         selectDropdown.appendChild(optionElement);

    //         // add click event listener for the select element
    //         selectDropdown.addEventListener("change", () => {
    //           const selectedValue =
    //             selectDropdown?.options[selectDropdown.selectedIndex].value;
    //           this.toggleFlag(feature.id, selectedValue, feature.name);
    //         });
    //       }
    //     });
    //   }

    //   // we now have data in the DOM for this page session - prevent newer API calls
    //   this.isFlagDataInDOM = true;
    // });
  }

  mapFeatureFlags = (flagsList: any, flagContainer: HTMLElement | null) => {
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
        flagContainer?.insertAdjacentHTML("beforeend", flagRow);

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
        flagContainer?.insertAdjacentHTML("beforeend", flagRow);

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
      this.isFlagDataInDOM = true;
    });
  };

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

// async listUsersWithFlags() {
//   if (this.isUserDataInDOM) {
//     // hide user level flags container
//     let userFlagContainerDiv = document.getElementById("user-flag-container");
//     if (userFlagContainerDiv) {
//       userFlagContainerDiv.style.display = "flex";
//     }

//     // show flag-container
//     let flagContainerDiv = document.getElementById("flag-container");
//     if (flagContainerDiv) {
//       flagContainerDiv.style.display = "none";
//     }
//     return;
//   }

//   const data = await getAllUsersForAdmin();

//   console.log(data);

//   // hide flag-container
//   const flagContainer = document.getElementById("flag-container");
//   if (flagContainer) {
//     flagContainer.style.display = "none";
//   }

//   // show users container
//   let userFlagContainer = document.getElementById("user-flag-container");
//   if (userFlagContainer) {
//     userFlagContainer.style.display = "flex";
//   }

//   // list all users under this administrator
//   data.map(async (user: User) => {
//     let userRow = createUserFlagRow(user);

//     // let result = await getCurrentUserSettings(user.id);

//     // console.log(result);

//     // Add to our user flag container
//     userFlagContainer?.insertAdjacentHTML("beforeend", userRow);
//   });

//   // console.log(data);
//   // we now have data in the DOM for this page session - prevent newer API calls
//   this.isUserDataInDOM = true;
// }
