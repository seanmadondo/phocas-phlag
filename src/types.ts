export interface ISearchContext {}

export interface ISearchUserInterface {
  hide: () => boolean;
  show: () => boolean;
}

export interface IFlagToggleSetting {
  id: number;
  featureName: string;
  value: string;
}
