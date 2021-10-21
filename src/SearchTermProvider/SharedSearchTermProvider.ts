import { ISearchTerm, ISearchTermProvider, SearchTermLoadType } from "../types";
import SearchTerm from "../SearchTerm";
import { HtmlText } from "../html_builders";
import { setImmediate } from "../utils"

class SharedSearchTermProvider implements ISearchTermProvider {
	loadStaticTerms = () => {
		return new Promise<ISearchTerm[]>((resolve, _reject) => {
			resolve([
				SearchTerm.fromUrl("Home", "menu", SearchTermLoadType.Static, "/"),
				new SearchTerm(":reload", "command", SearchTermLoadType.Static, async (ctx) => {
					setImmediate(async () => {
						const message = "Reloading search terms";
						let direction = 1;
						let num = 0;
						const interval = setInterval(() => {
							num += direction;
							if (num <= 0 || num >= 3) {
								direction *= -1;
							}
							let dots = ".".repeat(num);
							ctx.showHtml(new HtmlText(`${message}${dots}`));
						}, 500);
						await ctx.reloadSearchTerms();
						clearInterval(interval);
						ctx.showHtml(new HtmlText("Reloading complete"));
					});
					return false;
				}),
				new SearchTerm(":help", "command", SearchTermLoadType.Static, async (ctx) => {
					ctx.navigateTo("https://helpphocassoftware.atlassian.net/wiki/spaces/~904750381/pages/2575237496/Power+Search+UserScript", true);
					return false;
				}),
				new SearchTerm(":disable", "command", SearchTermLoadType.Static, async (ctx) => {
					if (confirm("Are you sure you want to disable Power Search?")) {
						ctx.storageProvider.set("ppt-search-disable", "1");
						window.location.reload();
					}
					return true;
				})
			]);
		})
	}

	loadDynamicTerms = () => {
		return new Promise<ISearchTerm[]>((resolve, _reject) => resolve([]));
	}

}

export default SharedSearchTermProvider;