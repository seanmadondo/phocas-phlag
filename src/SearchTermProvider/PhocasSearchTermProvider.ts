import SearchTerm from "../SearchTerm";
import { ISearchTermProvider, SearchTermLoadType } from "../types";
import {
  createDynamicLoader,
  createSearchTermType,
  createStaticMenuItem,
} from "../utils";

class PhocasSearchTermProvider implements ISearchTermProvider {
  async loadStaticTerms() {
    const staticTerms = [
      createStaticMenuItem("Users", "/Administration/Home/Users"),
      createStaticMenuItem("New User", "/Administration/User/Index"),
      createStaticMenuItem("Databases", "/Administration/Home/Databases"),
      createStaticMenuItem(
        "Configuration",
        "/Administration/Home/Configuration"
      ),
      createStaticMenuItem("Logs", "/Administration/Home/Logs"),
      createStaticMenuItem(
        "Error Logs",
        "/Administration/Home/Logs?view=Error"
      ),
      createStaticMenuItem(
        "Audit Logs",
        "/Administration/Home/Logs?view=Audit"
      ),
      createStaticMenuItem(
        "Query Logs",
        "/Administration/Home/Logs?view=Query"
      ),
      createStaticMenuItem(
        "Security Logs",
        "/Administration/Home/Logs?view=Security"
      ),
      createStaticMenuItem("Sync Logs", "/Administration/Home/Logs?view=Sync"),
      createStaticMenuItem(
        "Subscription Logs",
        "/Administration/Home/Logs?view=Subscription"
      ),
      createStaticMenuItem("Sync Sources", "/Administration/Home/SyncSources"),
      createStaticMenuItem("Favourites", "/Administration/Home/Favourites"),
      createStaticMenuItem("Dashboards", "/Administration/Home/Dashboards"),
      createStaticMenuItem("Folders", "/Administration/Home/Folders"),
      createStaticMenuItem(
        "Custom Actions",
        "/Administration/Home/CustomActions"
      ),
      createStaticMenuItem(
        "New Custom Action",
        "/Administration/CustomAction/Index"
      ),
      createStaticMenuItem("Environment", "/Administration/Home/Environment"),
      createStaticMenuItem(
        "Favourite Testing",
        "/Administration/Favourite/Test"
      ),
      createStaticMenuItem(
        "Period Types",
        "/Administration/Home/CustomPeriodTypes"
      ),
      createStaticMenuItem("Profiles", "/Administration/Home/Profiles"),
      createStaticMenuItem("Settings", "/Administration/Home/Settings"),
      createStaticMenuItem("Solutions", "/Administration/Home/Solutions"),
      createStaticMenuItem("Working Days", "/Administration/Home/WorkingDays"),
    ];
    return staticTerms;
  }

  async loadDynamicTerms() {
    const loadDatabases = createDynamicLoader(
      "/api/databases",
      "id",
      "title",
      createSearchTermType("database", "/Administration/Database/Index/?"),
      createSearchTermType("designer", "/Designer/Index/?")
    );
    const loadCustomActions = createDynamicLoader(
      "/api/custom-actions?excludeCode=true",
      "id",
      "name",
      createSearchTermType(
        "custom action",
        "/Administration/CustomAction/Index/?"
      )
    );
    const loadDashboards = createDynamicLoader(
      "/api/dashboards",
      "id",
      "name",
      createSearchTermType("dashboard", "/Dashboard/Index/?")
    );
    const loadUsers = createDynamicLoader(
      "/api/users",
      "id",
      "name",
      createSearchTermType("user", "/Administration/User/Index/?")
    );
    const loadSources = createDynamicLoader(
      "/api/sources",
      "id",
      "displayName",
      createSearchTermType(
        "source",
        "/Administration/SyncSource/Index/??tab=items"
      )
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
