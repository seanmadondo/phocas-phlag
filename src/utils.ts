import { ISearchContext, SearchTermLoadType } from "./types";
import SearchTerm from "./SearchTerm";

interface Phocas {
	get: (url: string, data: any, callback: (res: any) => void) => void;
}

declare global {
	interface Window { phocas?: Phocas }
}

const setImmediate = (fn: () => any) => {
	setTimeout(fn, 0);
}

const get = (url: string): Promise<any> => {
	return new Promise((resolve, reject) => {
		const req = new XMLHttpRequest();
		req.addEventListener("load", function () {
			if (this.status >= 200 && this.status < 400) {
				const json = JSON.parse(this.responseText);
				resolve(json);
			} else {
				reject(this.statusText);
			}
		});
		req.addEventListener("error", function () {
			reject(this.statusText);
		})
		req.open("GET", url);
		req.setRequestHeader("Accept", "application/json");
		req.send();
	});
}

const capitalise = (s: string) => {
	if (s.length === 0) {
		return "";
	}
	if (s.length === 1) {
		return s.toUpperCase();
	}
	return s[0].toUpperCase() + s.substr(1);
};

const capitaliseWords = (s: string) => {
	return s.split(" ").map(capitalise).join(" ");
};

const createDynamicLoader = (
	type: string,
	api_url: string,
	id_key: string,
	name_key: string,
	url_template: string
) => {
	return async () => {
		try {
			const xs = await get(api_url) as object[];
			const terms = xs
				.map((x: { [key: string]: any }) => {
					const value = x[name_key] ?? "";
					const id = x[id_key];
					const url = url_template.replace("?", id);
					return SearchTerm.fromUrl(value, type, SearchTermLoadType.Dynamic, url);
				});
			return terms;
		} catch {
			// console.warn(err);
			return [];
		}
	};
};

const createStaticMenuItem = (name: string, url: string) => {
	return SearchTerm.fromUrl(name, "menu", SearchTermLoadType.Static, url);
}

const isEnvironmentConsole = () => {
	return (location.hostname.split(".")[0].startsWith("console"));
}

const shouldPowerSearchStart = async (ctx: ISearchContext) => {
	if (await ctx.storageProvider.get("ppt-search-disable")) {
		// Power Search has been intentionally disabled
		return false;
	}
	if (location.pathname === "localhost" && location.port !== "8080") {
		// we are in localhost but our port is not 8080
		return false;
	}
	if (typeof window.phocas === "undefined") {
		// Phocas isn't loaded
		return false;
	}
	if (window.location.pathname === "/Security/SignIn") {
		// we are logged out
		return false;
	}
	return true;
}

export { isEnvironmentConsole, capitalise, capitaliseWords, createDynamicLoader, createStaticMenuItem, setImmediate, shouldPowerSearchStart };
