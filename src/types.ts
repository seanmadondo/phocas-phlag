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
