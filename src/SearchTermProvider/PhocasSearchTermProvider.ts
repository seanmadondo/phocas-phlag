import { ISearchTermProvider } from "../types";
import { createDynamicLoader, createStaticMenuItem } from "../utils";

class PhocasSearchTermProvider implements ISearchTermProvider {
	async loadStaticTerms() {
		const staticTerms = [
			createStaticMenuItem("Users", "/Administration/Home/Users"),
			createStaticMenuItem("Databases", "/Administration/Home/Databases"),
			createStaticMenuItem("Configuration", "/Administration/Home/Configuration"),
			// createStaticMenuItem("Logs", "/Administration/Home/Logs"),
			createStaticMenuItem("Error Logs", "/Administration/Home/Logs?view=Error"),
			createStaticMenuItem("Audit Logs", "/Administration/Home/Logs?view=Audit"),
			createStaticMenuItem("Query Logs", "/Administration/Home/Logs?view=Query"),
			createStaticMenuItem("Security Logs", "/Administration/Home/Logs?view=Security"),
			createStaticMenuItem("Sync Logs", "/Administration/Home/Logs?view=Sync"),
			createStaticMenuItem("Subscription Logs", "/Administration/Home/Logs?view=Subscription"),
			createStaticMenuItem("Sync Sources", "/Administration/Home/SyncSources"),
			createStaticMenuItem("Favourites", "/Administration/Home/Favourites"),
			createStaticMenuItem("Dashboards", "/Administration/Home/Dashboards"),
			createStaticMenuItem("Folders", "/Administration/Home/Folders"),
			createStaticMenuItem("Custom Actions", "/Administration/Home/CustomActions"),
			createStaticMenuItem("Environment", "/Administration/Home/Environment"),
			createStaticMenuItem("Favourite Testing", "/Administration/Favourite/Test"),
			createStaticMenuItem("Period Types", "/Administration/Home/CustomPeriodTypes"),
			createStaticMenuItem("Profiles", "/Administration/Home/Profiles"),
			createStaticMenuItem("Settings", "/Administration/Home/Settings"),
			createStaticMenuItem("Solutions", "/Administration/Home/Solutions"),
			createStaticMenuItem("Working Days", "/Administration/Home/WorkingDays"),
		];
		return staticTerms;
	}

	async loadDynamicTerms() {
		const loadDatabases = createDynamicLoader(
			"database",
			"/api/databases",
			"id",
			"title",
			"/Administration/Database/Index/?"
		);
		const loadCustomActions = createDynamicLoader(
			"custom action",
			"/api/custom-actions?excludeCode=true",
			"id",
			"name",
			"/Administration/CustomAction/Index/?"
		);
		const loadDashboards = createDynamicLoader(
			"dashboard",
			"/api/dashboards",
			"id",
			"name",
			"/Dashboard/Index/?"
		);
		const loadUsers = createDynamicLoader(
			"user",
			"/api/users",
			"id",
			"name",
			"/Administration/User/Index/?"
		);
		const loadSources = createDynamicLoader(
			"source",
			"/api/sources",
			"id",
			"displayName",
			"/Administration/SyncSource/Index/??tab=items"
		);

		const dynamicTerms = [
			loadDashboards(),
			loadCustomActions(),
			loadDatabases(),
			loadSources(),
			loadUsers(),
		];

		return (await Promise.all(dynamicTerms)).flat();
	}
}

export default PhocasSearchTermProvider;
