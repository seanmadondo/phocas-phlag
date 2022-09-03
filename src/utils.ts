interface Phocas {
  get: (url: string, data: any, callback: (res: any) => void) => void;
}

declare global {
  interface Window {
    phocas?: Phocas;
  }
}

export const getBaseUrl = () => {
  if (location.hostname === "localhost") {
    return `http://${location.host}`;
  } else {
    return `https://${location.host}`;
  }
};

export function sanitizeString(str: string) {
  if (str === null || str === "") return false;
  else str = str.toString();

  // Regular expression to identify HTML tags in
  // the input string. Replacing the identified
  // HTML tag with a null string.
  return str.replace(/(<([^>]+)>)/gi, "");
}

const isEnvironmentConsole = () => {
  return location.hostname.split(".")[0].startsWith("console");
};

const shouldPhlagStart = async () => {
  if (isEnvironmentConsole()) {
    // we don't want this working in console for now
    return false;
  }

  if (location.pathname === "localhost" && location.port !== "8080") {
    // we are in localhost but our port is not 8080
    return false;
  }
  if (typeof window.phocas === "undefined") {
    // Phocas isn't loaded
    return false;
  }
  if (window.location.pathname === "/Security/SignIn") {
    // we are logged out
    return false;
  }
  return true;
};

export { isEnvironmentConsole, shouldPhlagStart };
