import { IStorageProvider } from "./types";

export default class LocalStorageProvider implements IStorageProvider {
	get(key: string) {
		return new Promise<string>((resolve, _reject) => {
			const value = window.localStorage.getItem(key) ?? "";
			resolve(value);
		})
	}
	set(key: string, value: string) {
		return new Promise<void>((resolve, _reject) => {
			window.localStorage.setItem(key, value);
			resolve();
		})
	}
	reset(key: string) {
		return new Promise<void>((resolve, _reject) => {
			window.localStorage.removeItem(key);
			resolve();
		})
	}
	clear() {
		return new Promise<void>((resolve, _reject) => {
			window.localStorage.clear();
			resolve();
		})
	}

}