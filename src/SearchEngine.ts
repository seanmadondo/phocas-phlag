import { ISearchEngine, ISearchResult, IStorageCache } from "./types";

enum FilterType {
  None,
  Inclusive,
}

interface ISearchQuery {
  query: string;
  filterType: FilterType;
  filter?: string;
}

export default class SearchEngine implements ISearchEngine {
  private storageCache: IStorageCache;

  constructor(storageCache: IStorageCache) {
    this.storageCache = storageCache;
  }

  private async getSearchTerms() {
    return await this.storageCache.getSearchTerms(false);
  }

  private static getInitials(value: string) {
    const initials = value
      .split(" ")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => s[0])
      .join("");
    return initials;
  }

  private getQueryScore(query: string, value: string) {
    let score = 0;
    value = value
      .toLowerCase()
      .replace(/[^a-zA-Z0-9:_]/g, " ")
      .trim(); // yeet the symbols and trim

    if (query === value) {
      // exact match!
      // we can't get much better than that
      score += query.length + 2;
    } else if (value.includes(query)) {
      // partial match!
      // it's as good as the number of characters that matched
      score += query.length;
    }

    const initials = SearchEngine.getInitials(value);
    if (initials.length > 0) {
      if (query === initials) {
        // an exact match on the initials!
        // second only to an exact match
        score += value.length + 1;
      } else if (initials.includes(query)) {
        // a partial match on the initials!
        // as good as the normalised number of characters that matched
        score += (value.length * query.length) / initials.length;
      }
    }

    // normalise the score to a value between 0 and 1(ish)
    score = score / value.length;

    return score;
  }

  private getSearchQuery(originalQuery: string): ISearchQuery {
    let query = originalQuery.toLowerCase().trim();

    let filter: string | undefined;
    let filterType: FilterType = FilterType.None;

    if (originalQuery.includes("=")) {
      const parts = originalQuery.split("=", 2);
      if (parts.length === 2 && parts[1].length > 0) {
        query = parts[0].trim();
        filter = parts[1].trim();
        filterType = FilterType.Inclusive;
      }
    }

    query = query.replace(/=/g, "");

    return {
      query,
      filterType,
      filter,
    };
  }

  public async findResults(originalQuery: string) {
    const terms = await this.getSearchTerms();
    const results: ISearchResult[] = [];
    const { query, filterType, filter } = this.getSearchQuery(originalQuery);

    if (query.length === 0) {
      return results;
    }

    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];

      // potentially filter this result out
      if (filterType !== FilterType.None && typeof filter !== "undefined") {
        const filterScore = this.getQueryScore(filter, term.type);
        if (filterType === FilterType.Inclusive && filterScore === 0) continue;
      }

      const score = this.getQueryScore(query, term.value);

      results.push({ ...term, score });
    }

    // discard results that don't match and sort by score descending
    const validResults = results
      .filter((a) => a.score > 0)
      .sort((a, b) =>
        a.score !== b.score
          ? b.score - a.score
          : a.value.length - b.value.length
      );
    return validResults;
  }
}
