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
