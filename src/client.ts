import { JsonBodyProps } from "./types";
import { getBaseUrl } from "./utils";

export async function loadGlobalFlags() {
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

export async function getAllUsersForAdmin() {
  const response = await fetch(
    `${getBaseUrl()}/api/legacy/users/get-all-for-administration?includeLastLogin=true&includeProfileName=
    true&includeDatabasesDefaultPeriodID=false&includeDatabasesHasRestriction=false&skip=0&take=100&sortColumn=name&sortDescending=false`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
}

export async function getSettingsByID(userID: number) {
  const response = await fetch(
    `${getBaseUrl()}/Administration/UserSettings/Grid`,
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
        userID: userID,
      }),
    }
  );

  return response.json();
}

export async function setGlobalFeature(featureId: number, jsonBody: Object) {
  await fetch(`${getBaseUrl()}/api/settings/${featureId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonBody),
  });
}

// export async function setUserFeature(jsonBody: JsonBodyProps) {
//   const formData = new FormData();
//   formData.append("UserID", jsonBody.userID.toString());
//   formData.append("ID", jsonBody.id.toString());
//   formData.append("Name", jsonBody.name.toString());
//   formData.append("Value", jsonBody.value.toString());

//   await fetch(`${getBaseUrl()}/Administration/UserSettings/Save`, {
//     method: "POST",
//     // headers: {
//     //   "Content-Type": "application/json; charset=utf-8",
//     // },
//     // body: formData,
//     // body: `UserID=${jsonBody.userID}&ID=${jsonBody.id}&Name=${jsonBody.name}&Value=${jsonBody.value}`,
//     body: new URLSearchParams(
//       `UserID=${jsonBody.userID}&ID=${jsonBody.id}&Name=${jsonBody.name}&Value=${jsonBody.value}`
//     ),
//   });
// }

export async function setUserFeature(jsonBody: JsonBodyProps) {
  const http = new XMLHttpRequest();
  const url = `${getBaseUrl()}/Administration/UserSettings/Save`;
  const params = `UserID=${jsonBody.userID}&ID=${jsonBody.id}&Name=${jsonBody.name}&Value=${jsonBody.value}`;
  http.open("POST", url, true);

  //Send the proper header information along with the request
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  http.send(params);
}
