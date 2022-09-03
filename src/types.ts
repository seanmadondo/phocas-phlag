export interface FlagUserInterface {
  hide: () => boolean;
  show: () => boolean;
  loadGlobalFlags: () => Promise<void>;
}

export interface FlagToggleSetting {
  id: number;
  featureName: string;
  value: string;
}
