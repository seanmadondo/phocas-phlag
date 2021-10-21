import { ISearchContext, ISearchFunctionOptions, ISearchTerm, SearchTermLoadType } from "./types";

class SearchTerm implements ISearchTerm {
	value: string;
	type: string;
	loadType: SearchTermLoadType;
	fn: (navHandler: ISearchContext, options: ISearchFunctionOptions) => Promise<boolean>;

	constructor(
		value: string,
		type: string,
		loadType: SearchTermLoadType,
		fn: (navHandler: ISearchContext, options: ISearchFunctionOptions) => Promise<boolean>
	) {
		this.value = value;
		this.type = type;
		this.loadType = loadType;
		this.fn = fn;
	}

	static fromUrl(value: string, type: string, loadType: SearchTermLoadType, url: string) {
		const fn = async (navHandler: ISearchContext, options: ISearchFunctionOptions) => {
			navHandler.navigateTo(url, options.newTab ?? false);
			return true;
		};
		return new SearchTerm(value, type, loadType, fn);
	}
}

export default SearchTerm;