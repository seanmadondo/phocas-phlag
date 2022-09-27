interface Phocas {
  get: (url: string, data: any, callback: (res: any) => void) => void;
  app: {
    user: {
      id: number;
    }
  }
}

type Fetched<T> = {
  json(): Promise<T>;
}

export function fetchWithCsrf<T>(url: string, { method = "GET", headers, body }: { method: 'GET' | 'PUT' | 'POST', headers?: { [key: string]: string}, body?: string }): Promise<Fetched<T>> {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.addEventListener("load", () => {
      resolve({
        json: () => new Promise((resolve, reject) => {
          try {
            resolve(JSON.parse(req.responseText));
          } catch (err) {
            reject(err);
          }
        })
      })
    });
    req.addEventListener("error", () => {
      reject(req.responseText);
    });

    req.open(method, url);
    if (headers) {
      Object.keys(headers).forEach((key) => {
        req.setRequestHeader(key, headers[key]);
      })
    }
    req.send(body);
  });
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
  if (str === null || str === "") return "";
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

export interface IApiClient
{
  get<T>(path: string): Promise<Fetched<T>>;
  post<T>(path: string, body: any): Promise<Fetched<T>>;
  put<T>(path: string, body: any): Promise<Fetched<T>>;
}

export class ApiClient implements IApiClient
{
  private baseUrl: string;

  constructor(baseUrl: string)
  {
    this.baseUrl = baseUrl;
  }

  private fetch<T>(method: "GET" | "POST" |  "PUT", path: string, body?: any) {
    return fetchWithCsrf<T>(this.baseUrl + path, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: typeof body !== "undefined" ? JSON.stringify(body) : undefined
    })
  }

  public get<T>(path: string) {
    return this.fetch<T>("GET", path);
  }

  public post<T>(path: string, body: any) {
    return this.fetch<T>("POST", path, body);
  }

  public put<T>(path: string, body: any) {
    return this.fetch<T>("PUT", path, body);
  }
}

export { isEnvironmentConsole, shouldPhlagStart };
