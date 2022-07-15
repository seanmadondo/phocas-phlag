![Phocas Power Search](./phlag_logo.png)

More ~~propaganda~~ information about this can be found at [https://helpphocassoftware.atlassian.net/wiki/spaces/~904750381/pages/2575237496/Power+Search+UserScript](https://helpphocassoftware.atlassian.net/wiki/spaces/~904750381/pages/2575237496/Power+Search+UserScript).

## Get the Source

Clone the repo and install the dependencies:

```bash
git clone git@github.com:jpsheehan-phocas/phocas-power-search.git
cd phocas-power-search
yarn
```

## Build UserScript

Build the script by running the following:

```bash
yarn build
```

This will use WebPack to bundle the source and apply the UserScript header to the output. The file can be found in `dist/phocas-power-search.bundle.js`. The contents of this file will also be copied to the clipboard.

## Feature List

- [x] MVP
- [x] Convert to TypeScript
- [x] Make search overlay fade in
  - [x] Also make search results and message fade in
- [ ] Indicate command execution in progress
  - [ ] Add event handlers to the IStorageProvider
  - [ ] Hook these in to the UI
  - [ ] Remove messages?
- [x] Change help command to redirect to Confluence page
- [x] Add disable command
  - [x] Disable Power Search when the "ppt-search-disable" item exists in Local Storage.
- [x] Disable Power Search when we are in localhost but not at port 8080.
- [x] Disable Power Search when `window.phocas` is undefined.
- [-] When Power Search is enabled, add some sort of indication to the page.
- [x] Rename the UserScript name to "Power Search".
- [x] Add filters for dynamic search terms
  - [x] Change filter syntax and add exclusive filtering.
- [x] Add more dynamic search terms to Console (have a look at cloud dev)
- [x] Fix behaviour when API calls fail (fail silently).
- [ ] Clean up the `index.ts` file and decompose appropriately.
- [ ] Up/down search history for input box
- [x] Disable Power Search when logged out
- [-] Add a shortcut for the easter egg
- [x] Tabbing out of the input box should go to the second item not the first
- [x] Clean up tabbing behaviour
