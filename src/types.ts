export interface ISearchContext {
  loadSearchTerms: () => Promise<void>;
}

export interface ISearchUserInterface {
  hide: () => boolean;
  show: () => boolean;
}
