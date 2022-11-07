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

export async function getCurrentUserSettings(userID: number) {
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
