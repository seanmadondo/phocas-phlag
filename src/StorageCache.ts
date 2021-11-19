import {
  ISearchContext,
  ISearchTerm,
  ISearchTermProvider,
  IStorageProvider,
  IStorageCache,
  SearchTermLoadType,
} from "./types";
import SearchTerm from "./SearchTerm";
import LocalStorageProvider from "./LocalStorageProvider";

const DYNAMIC_SEARCH_TERMS_KEY = "ppt-dynamic-search-terms";
const LAST_UPDATED_KEY = "ppt-last-updated";
const KEYS = [DYNAMIC_SEARCH_TERMS_KEY, LAST_UPDATED_KEY];

interface IStoredSearchTerm {
  value: string;
  url: string;
  type: string;
}

class FakeNavigationHandler implements ISearchContext {
  private _url: string;

  constructor() {
    this._url = "";
  }

  get url() {
    return this._url;
  }

  navigateTo(url: string, _newTab: boolean) {
    return new Promise<void>((resolve, _reject) => {
      this._url = url;
      resolve();
    });
  }

  async clearSearchTerms() {}
  async reloadSearchTerms() {}
  async loadSearchTerms() {}
  showHtml() {}
  clearResults() {}

  storageProvider = new LocalStorageProvider();
}

export default class StorageCache implements IStorageCache {
  private storageProvider: IStorageProvider;
  private searchTermProvider: ISearchTermProvider;
  private ttlSeconds: number;
  private _searchTerms: ISearchTerm[] = [];
  private isLoading = false;

  constructor(
    storageProvider: IStorageProvider,
    searchTermProvider: ISearchTermProvider,
    ttlSeconds: number
  ) {
    this.storageProvider = storageProvider;
    this.searchTermProvider = searchTermProvider;
    this.ttlSeconds = ttlSeconds;
  }

  private static async getStoredSearchTerm(
    searchTerm: ISearchTerm
  ): Promise<IStoredSearchTerm> {
    const navHandler = new FakeNavigationHandler();
    await searchTerm.fn(navHandler, {});
    return {
      type: searchTerm.type,
      value: searchTerm.value,
      url: navHandler.url,
    };
  }

  private static getSearchTerm(
    storedSearchTerm: IStoredSearchTerm
  ): ISearchTerm {
    return SearchTerm.fromUrl(
      storedSearchTerm.value,
      storedSearchTerm.type,
      SearchTermLoadType.Dynamic,
      storedSearchTerm.url
    );
  }

  private async getLastUpdated() {
    return parseInt((await this.storageProvider.get(LAST_UPDATED_KEY)) ?? "0");
  }

  private async setLastUpdated() {
    await this.storageProvider.set(LAST_UPDATED_KEY, Date.now().toString());
  }

  private async needsRefresh() {
    const now = Date.now();
    const diff = now - (await this.getLastUpdated());
    return diff > this.ttlSeconds * 1000;
  }

  private async getDynamicSearchTerms(
    forceRefresh: boolean
  ): Promise<ISearchTerm[]> {
    // refresh if neccessary
    if (forceRefresh || (await this.needsRefresh())) {
      if (this.isLoading) {
        return this._searchTerms;
      }
      this.isLoading = true;
      this._searchTerms = await this.searchTermProvider.loadDynamicTerms();
      await this.setDynamicSearchTerms(this._searchTerms);
      await this.setLastUpdated();
      this.isLoading = false;
      return this._searchTerms;
    }

    if (this._searchTerms.length === 0) {
      // we must have just loaded up the page
      try {
        const json = await this.storageProvider.get(DYNAMIC_SEARCH_TERMS_KEY);
        const storedSearchTerms: IStoredSearchTerm[] = JSON.parse(json);
        this._searchTerms = storedSearchTerms.map(StorageCache.getSearchTerm);
        return this._searchTerms;
      } catch (err) {
        if (forceRefresh) {
          throw err;
        }
        return await this.getDynamicSearchTerms(true);
      }
    } else {
      // just fetch the values from memory
      return this._searchTerms;
    }
  }

  private async setDynamicSearchTerms(searchTerms: ISearchTerm[]) {
    const storedSearchTerms: IStoredSearchTerm[] = await Promise.all(
      searchTerms.map(StorageCache.getStoredSearchTerm)
    );
    const json = JSON.stringify(storedSearchTerms);
    return await this.storageProvider.set(DYNAMIC_SEARCH_TERMS_KEY, json);
  }

  async getSearchTerms(forceRefresh: boolean) {
    let terms = await this.searchTermProvider.loadStaticTerms();
    terms = terms.concat(await this.getDynamicSearchTerms(forceRefresh));
    return terms;
  }

  async clear() {
    await Promise.all(
      KEYS.map(async (key) => await this.storageProvider.reset(key))
    );
  }
}
