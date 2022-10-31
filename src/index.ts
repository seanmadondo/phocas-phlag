import { PhocasPhlag } from "./PhocasPhlag";
import { shouldPhlagStart } from "./utils";

async function main() {
  const phlag = new PhocasPhlag();
  if (await shouldPhlagStart()) {
    phlag.attachEventHandler();
  }
}

main();
