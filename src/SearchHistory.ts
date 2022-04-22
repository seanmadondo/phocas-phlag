import { ISearchHistory, IStorageProvider } from "./types";

export default class SearchHistory implements ISearchHistory {
  private storageProvider: IStorageProvider;
  private maxEntries: number;

  private static HISTORY_KEY = "ppt-history";
  private entries: string[] | null = null;

  constructor(storageProvider: IStorageProvider, maxEntries: number) {
    this.storageProvider = storageProvider;
    this.maxEntries = maxEntries;
  }

  async clear() {
    this.storageProvider.reset(SearchHistory.HISTORY_KEY);
  }

  async push(entry: string) {
    if (this.entries === null) {
      this.getEntries();
    }
    if (this.entries) {
      // skip duplicates
      if (
        this.entries.length > 1 &&
        this.entries[this.entries.length - 1] === entry
      ) {
        return;
      }
      this.entries.push(entry);
      while (this.entries.length >= this.maxEntries) {
        this.entries.shift();
      }
      await this.save();
    }
  }

  private async save() {
    const json = JSON.stringify(this.entries);
    await this.storageProvider.set(SearchHistory.HISTORY_KEY, json);
  }

  private async load(): Promise<string[]> {
    const json = await this.storageProvider.get(SearchHistory.HISTORY_KEY);
    if (json) {
      try {
        return JSON.parse(json) ?? [];
      }
      catch (_) {
        return [];
      }
    }
    return [];
  }

  async getEntries() {
    if (this.entries !== null) {
      return this.entries;
    }
    this.entries = await this.load();
    return this.entries ?? [];
  }
}
