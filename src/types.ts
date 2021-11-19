export interface ISearchContext {
  navigateTo: (url: string, newTab: boolean) => Promise<void>;
  showHtml: (html: IHtmlBuilder) => void;
  loadSearchTerms: () => Promise<void>;
  reloadSearchTerms: () => Promise<void>;
  clearSearchTerms: () => Promise<void>;
  clearResults: () => void;
  storageProvider: IStorageProvider;
}

export interface ISearchFunctionOptions {
  newTab?: boolean;
}

export interface ISearchTerm {
  value: string;
  type: string;
  loadType: SearchTermLoadType;
  fn: (
    searchUI: ISearchContext,
    options: ISearchFunctionOptions
  ) => Promise<boolean>;
}

export interface ISearchTermProvider {
  loadStaticTerms: () => Promise<ISearchTerm[]>;
  loadDynamicTerms: () => Promise<ISearchTerm[]>;
}

export interface ISearchUserInterface {
  hide: () => boolean;
  show: () => boolean;
}

export interface IStorageCache {
  getSearchTerms: (forceRefresh: boolean) => Promise<ISearchTerm[]>;
  clear: () => Promise<void>;
}

export interface IStorageProvider {
  get: (key: string) => Promise<string>;
  set: (key: string, value: string) => Promise<void>;
  reset: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export enum SearchTermLoadType {
  Static,
  Dynamic,
}

export interface ISearchEngine {
  findResults: (query: string) => Promise<ISearchResult[]>;
}

export interface ISearchResult extends ISearchTerm {
  score: number;
}

export interface IHtmlBuilder {
  getHtml: () => string;
}

export interface ISearchHistory {
  clear(): Promise<void>;
  getEntries(): Promise<string[]>;
  push(entry: string): Promise<void>;
}
