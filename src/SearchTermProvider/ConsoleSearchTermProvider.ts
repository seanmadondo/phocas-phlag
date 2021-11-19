import SearchTerm from "../SearchTerm";
import { ISearchTermProvider, SearchTermLoadType } from "../types";
import { createDynamicLoader, createSearchTermType, createStaticMenuItem } from "../utils";

export default class ConsoleSearchTermProvider implements ISearchTermProvider {
	async loadStaticTerms() {
		const staticTerms = [
			createStaticMenuItem("Organisations", "/Home/Organisations"),
			createStaticMenuItem("Accounts", "/Home/Accounts"),
			createStaticMenuItem("Contacts", "/Home/Contacts"),
			createStaticMenuItem("Groups", "/Home/Groups"),
			createStaticMenuItem("Users", "/Home/Users"),
			createStaticMenuItem("Profiles", "/Home/Profiles"),
			createStaticMenuItem("Servers", "/Home/Servers"),
			createStaticMenuItem("Regions", "/Home/Regions"),
			createStaticMenuItem("Settings", "/Home/Settings"),
			createStaticMenuItem("Solutions", "/Home/Solutions"),
			createStaticMenuItem("Logs", "/Home/Logs"),
			createStaticMenuItem("Licenses", "/Home/Licences"),
			createStaticMenuItem("Upgrade", "/Home/Upgrade"),
		];
		return staticTerms;
	}

	async loadDynamicTerms() {
		const loadOrganisations = createDynamicLoader("organisation", "/api/organisations", "id", createSearchTermType("name", "/Organisation/Index/?"));
		const loadAccounts = createDynamicLoader("account", "/api/accounts", "id", createSearchTermType("licenseName", "/Account/Index/?"));
		const loadGroups = createDynamicLoader("group", "/api/groups", "id", createSearchTermType("name", "/Group/Index/?"));
		const loadUsers = createDynamicLoader("user", "/api/users", "id", createSearchTermType("name", "/User/Index/?"));
		const loadProfiles = createDynamicLoader("profile", "/api/profiles", "id", createSearchTermType("name", "/Profile/Index/?"));
		const loadServers = createDynamicLoader("server", "/api/servers", "id", createSearchTermType("name", "/Server/Index/?"));
		const loadRegions = createDynamicLoader("region", "/api/regions", "id", createSearchTermType("name", "/Region/Index/?"));
		const loadSolutions = createDynamicLoader("solution", "/api/solutions", "id", createSearchTermType("name", "/Solution/Index/?"));

		// NOTE: loading the settings would be kind of stupid IMO, let's not
		// const loadSettings = createDynamicLoader("setting", "/api/settings", "id", "name", "/Setting/Index/?");

		// NOTE: contacts take a very long time to load, let's not
		// const loadContacts = createDynamicLoader("contact", "/api/contacts", "id", "name", "/Contact/Index/?");

		const dynamicTerms = [
			loadOrganisations(),
			loadAccounts(),
			loadGroups(),
			loadUsers(),
			loadProfiles(),
			loadServers(),
			loadRegions(),
			loadSolutions(),
			// loadSettings(),
			// loadContacts(),
		];

		return (await Promise.all(dynamicTerms)).flat();
	}
}