import CompositeSearchTermProvider from "./CompositeSearchTermProvider";
import ConsoleSearchTermProvider from "./ConsoleSearchTermProvider";
import PhocasSearchTermProvider from "./PhocasSearchTermProvider";
import SharedSearchTermProvider from "./SharedSearchTermProvider";

import { isEnvironmentConsole } from "../utils";
import { ISearchTermProvider } from "../types";

function getDefaultSearchTermProvider(): ISearchTermProvider {
  const provider: ISearchTermProvider = new CompositeSearchTermProvider([
    new SharedSearchTermProvider(),
    isEnvironmentConsole()
      ? new ConsoleSearchTermProvider()
      : new PhocasSearchTermProvider(),
  ]);
  return provider;
}

export { getDefaultSearchTermProvider };
