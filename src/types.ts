export interface FlagUserInterface {
  hide: () => boolean;
  show: () => boolean;
  // loadGlobalFlags: () => Promise<void>;
}

export interface Feature {
  id: number;
  name: string;
  value: string;
}

export interface User {
  id: number;
  name: string;
}

export interface JsonBodyProps {
  name: string;
  value: string | boolean;
  id: number;
  userID: number;
}
