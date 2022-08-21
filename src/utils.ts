interface Phocas {
  get: (url: string, data: any, callback: (res: any) => void) => void;
}

declare global {
  interface Window {
    phocas?: Phocas;
  }
}

export const getBaseUrl = () => {
  return location.hostname;
};

const get = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.addEventListener("load", function () {
      if (this.status >= 200 && this.status < 400) {
        try {
          const json = JSON.parse(this.responseText);
          resolve(json);
        } catch (_) {
          reject(this.statusText);
        }
      } else {
        reject(this.statusText);
      }
    });
    req.addEventListener("error", function () {
      reject(this.statusText);
    });
    req.open("GET", url);
    req.setRequestHeader("Accept", "application/json");
    req.send();
  });
};

const isEnvironmentConsole = () => {
  return location.hostname.split(".")[0].startsWith("console");
};

const shouldPhlagStart = async () => {
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
