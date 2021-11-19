import { ISearchTermProvider } from "../types";

class CompositeSearchTermProvider implements ISearchTermProvider {
  constructor(providers: ISearchTermProvider[]) {
    this.providers = providers;
  }

  private providers: ISearchTermProvider[];

  loadStaticTerms = async () => {
    return (
      await Promise.all(
        this.providers.map((provider) => provider.loadStaticTerms())
      )
    ).flat();
  };

  loadDynamicTerms = async () => {
    return (
      await Promise.all(
        this.providers.map((provider) => provider.loadDynamicTerms())
      )
    ).flat();
  };
}

export default CompositeSearchTermProvider;
