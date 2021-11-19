const css = require("./style.css");
import { capitaliseWords, shouldPowerSearchStart } from "./utils";
import { getDefaultSearchTermProvider } from "./SearchTermProvider";
import {
  ISearchTerm,
  ISearchContext,
  IStorageCache,
  IStorageProvider,
  ISearchFunctionOptions,
  ISearchUserInterface,
  ISearchTermProvider,
  ISearchEngine,
  ISearchResult,
  IHtmlBuilder,
  ISearchHistory,
} from "./types";
import StorageCache from "./StorageCache";
import LocalStorageProvider from "./LocalStorageProvider";
import SearchEngine from "./SearchEngine";
// import SearchHistory from "./SearchHistory";

const CACHE_MINUTES = 30;
const CACHE_SECONDS = CACHE_MINUTES * 60;
const OPACITY_DURATION_MILLIS = 200;
// const MAX_HISTORY = 50;

class PhocasPowerSearch implements ISearchUserInterface, ISearchContext {
  hidden = true;
  overlay: HTMLDivElement | null = null;
  searchBox: HTMLDivElement | null = null;
  currentSearchTerm = "";
  results: ISearchResult[] = [];
  reloadTimeout = null;

  terms: ISearchTerm[] = [];

  searchTermProvider: ISearchTermProvider = getDefaultSearchTermProvider();
  storageProvider: IStorageProvider = new LocalStorageProvider();
  storageCache: IStorageCache = new StorageCache(
    this.storageProvider,
    this.searchTermProvider,
    CACHE_SECONDS
  );
  searchEngine: ISearchEngine = new SearchEngine(this.storageCache);
  // private searchHistory: ISearchHistory = new SearchHistory(this.storageProvider, MAX_HISTORY);
  // private searchHistoryIndex = 0;
  // private searchHistoryTempValue = "";

  createSearchBox() {
    const div = document.createElement("div");
    div.id = "ppt-search-container";
    div.innerHTML = `
		<div>
			<input id='ppt-search-input' autocomplete='off' placeholder='Search...' />
      <span id='ppt-search-message' style='display: none'></span>
			<ul id='ppt-search-results'>
			</ul>
		</div>
		`;
    return div;
  }

  getInput = () => {
    return document.getElementById("ppt-search-input") as HTMLInputElement;
  };

  getResultsList = () => {
    return document.getElementById("ppt-search-results") as HTMLDivElement;
  };

  focusAndSelectAll = () => {
    const input = this.getInput();
    input.focus();
    input.select();
  };

  closeOverlayKeyDownHandler = (ev: KeyboardEvent) => {
    if (ev.key === "Escape") {
      if (this.hide()) {
        ev.preventDefault();
      }
    }
  };

  createOverlay = () => {
    const overlay = document.createElement("div");
    overlay.id = "ppt-search-overlay";
    overlay.innerHTML = `<style>${css.toString()}</style>`;
    return overlay;
  };

  clearResults() {
    this.results = [];
    this.updateResultsList();
  }

  updateResultsList = () => {
    const nodes = this.results.map((result, i) => {
      const li = document.createElement("li");
      li.innerHTML =
        "<a href='#'>" +
        result.value +
        (result.type !== "menu"
          ? `<span class='smaller'>(${capitaliseWords(result.type)})</span>`
          : "") +
        "</a>";
      const a = li.querySelector("a");
      if (a !== null) {
        a.addEventListener("click", (event) => {
          event.preventDefault();
          this.executeResult(i, { newTab: event.shiftKey });
        });
        if (i === 0) {
          // focusing on the first one should focus the input box
          a.addEventListener("focus", () => {
            this.getInput().focus();
          });
        }
        a.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            this.executeResult(i, { newTab: event.shiftKey });
          } else if (
            event.key === "Tab" &&
            !event.shiftKey &&
            i === this.results.length - 1
          ) {
            event.preventDefault();
            this.getInput().focus();
          }
        });
      }
      return li;
    });
    this.getResultsList().replaceChildren(...nodes);
  };

  hide() {
    if (!this.hidden) {
      this.fadeOut();
      document.removeEventListener("keydown", this.closeOverlayKeyDownHandler);
      this.hidden = true;
      return true;
    }
    return false;
  }

  show = () => {
    if (this.hidden) {
      if (this.overlay === null) {
        this.overlay = this.createOverlay();
      }
      if (this.searchBox === null) {
        this.searchBox = this.createSearchBox();
      }

      document.body.appendChild(this.overlay);
      document.body.appendChild(this.searchBox);

      this.getInput().addEventListener("focus", (ev: any) => {
        this.getResultsList().scrollTo(0, 0);
      });
      this.getInput().addEventListener("input", async (ev: any) => {
        if (this.hidden === false && ev?.target?.value) {
          const newSearchTerm = ev.target.value;
          if (newSearchTerm !== this.currentSearchTerm) {
            this.clearMessage();
            this.results = await this.searchEngine.findResults(newSearchTerm);
            this.updateResultsList();
            this.currentSearchTerm = newSearchTerm;
          }
        }
      });
      this.getInput().addEventListener("keydown", async (ev) => {
        let entries: string[] = [];
        if (this.hidden === false) {
          switch (ev.key) {
            case "Enter":
              ev.preventDefault();
              // this.searchHistory.push((ev.target as HTMLInputElement).value);
              this.executeResult(0, { newTab: ev.shiftKey });
              break;
            case "Tab":
              ev.preventDefault();
              const anchors = this.getResultsList().querySelectorAll("a");
              if (ev.shiftKey === false) {
                if (anchors.length >= 2) {
                  // find the second result and focus on it
                  const secondAnchor = anchors[1] as HTMLAnchorElement;
                  secondAnchor.focus();
                }
              } else {
                // find the last result and focus on it
                const lastAnchor = anchors[
                  anchors.length - 1
                ] as HTMLAnchorElement;
                lastAnchor.focus();
              }
              break;
            /*case "ArrowUp":
              entries = await this.searchHistory.getEntries();
              if (entries.length > 1) {
                if (this.searchHistoryIndex === -1) {
                  this.searchHistoryTempValue = (ev.target as HTMLInputElement).value;
                  this.searchHistoryIndex = entries.length - 1;
                } else {
                  this.searchHistoryIndex = Math.max(0, this.searchHistoryIndex - 1);
                }
                (ev.target as HTMLInputElement).value = entries[this.searchHistoryIndex];
              }
              break;
            case "ArrowDown":
              entries = await this.searchHistory.getEntries();
              if (entries.length > 1) {
                if (this.searchHistoryIndex === -1) {
                  return;
                } else
                  if (this.searchHistoryIndex < entries.length - 2) {
                    this.searchHistoryIndex = Math.min(this.searchHistoryIndex + 1, entries.length - 1);
                    (ev.target as HTMLInputElement).value = entries[this.searchHistoryIndex];
                  } else {
                    this.searchHistoryIndex = -1;
                    (ev.target as HTMLInputElement).value = this.searchHistoryTempValue;
                  }
              }
              break;*/
          }
        }
      });
      this.getResultsList().addEventListener("focus", () => {
        this.getInput().focus();
      });

      document.addEventListener("keydown", this.closeOverlayKeyDownHandler);

      this.hidden = false;
      this.focusAndSelectAll();

      this.fadeIn();
      return true;
    }
    return false;
  };

  showMessage(msg: string) {
    const el = document.getElementById("ppt-search-message");
    if (el === null) {
      return;
    }
    if (msg) {
      el.innerHTML = msg;
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  }

  showHtml(html: IHtmlBuilder) {
    this.showMessage(html.getHtml());
  }

  clearMessage() {
    this.showMessage("");
  }

  private fadeIn() {
    return new Promise<void>((resolve) => {
      if (this.overlay) {
        this.overlay.style.opacity = "0.7";
      }
      if (this.searchBox) {
        this.searchBox.style.opacity = "1.0";
      }
      setTimeout(() => resolve(), OPACITY_DURATION_MILLIS);
    });
  }

  private fadeOut() {
    return new Promise<void>((resolve) => {
      if (this.overlay) {
        this.overlay.style.opacity = "0";
      }
      if (this.searchBox) {
        this.searchBox.style.opacity = "0";
      }
      setTimeout(() => {
        this.overlay?.parentNode?.removeChild(this.overlay);
        this.searchBox?.parentNode?.removeChild(this.searchBox);
        resolve();
      }, OPACITY_DURATION_MILLIS);
    });
  }

  navigateTo(url: string, newTab: boolean) {
    return new Promise<void>((resolve, _reject) => {
      if (newTab) {
        window.open(url, "_blank");
      } else {
        window.location.href = url;
      }
      resolve();
    });
  }

  async executeResult(i: number, options: ISearchFunctionOptions = {}) {
    if (i < this.results.length) {
      const result = this.results[i];
      let close = true;
      try {
        close = await result.fn(this, options);
      } catch (ex) {
        console.warn("Command had error", ex);
      }
      this.clearInput();
      if (close) {
        this.hide();
      }
    }
  }

  clearInput() {
    const input = this.getInput();
    if (input) {
      input.value = "";
    }
    this.results = [];
    this.updateResultsList();
  }

  async loadSearchTerms() {
    this.terms = await this.storageCache.getSearchTerms(false);
  }

  async reloadSearchTerms() {
    this.terms = await this.storageCache.getSearchTerms(true);
  }

  async clearSearchTerms() {
    await this.storageCache.clear();
  }

  public attachEventHandler() {
    document.body.addEventListener("keydown", (ev) => {
      if (
        ev.key === "/" &&
        !["TEXTAREA", "INPUT"].includes((ev?.target as HTMLElement).nodeName) &&
        !(ev?.target as HTMLElement).isContentEditable
      ) {
        if (this.show()) {
          ev.preventDefault();
        }
      }
    });
  }
}

async function main() {
  const search = new PhocasPowerSearch();
  if (await shouldPowerSearchStart(search)) {
    search.attachEventHandler();
    search.loadSearchTerms();
  }
}

main();
