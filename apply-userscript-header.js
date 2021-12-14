const fs = require("fs");
const path = require("path");

function splitAndCapitalise(words) {
  return words
    .split("-")
    .map((word) => word[0].toUpperCase() + word.substr(1))
    .join(" ");
}

function createUserScriptBanner(namespace, matches, iconUrl) {
  const packagePath = path.join(__dirname, "package.json");
  const raw = fs.readFileSync(packagePath);
  const package = JSON.parse(raw);
  return `// ==UserScript==
// @name        ${splitAndCapitalise(package.name)}
// @namespace   ${namespace}
// @version     ${package.version}
// @author      ${package.author.name} <${package.author.email}>
// @description ${package.description}
${matches.map((m) => `// @match       ${m}`).join("\n")}
// @icon        https://www.google.com/s2/favicons?domain=${iconUrl}
// @grant       none
// ==/UserScript==`;
}

const userScriptBanner = createUserScriptBanner(
  "https://foo.nz",
  [
    "https://*.phocassoftware.com/*",
    "https://*.phocaspreview.com/*",
    "https://*.phocasclouddev.com/*",
    "https://*.phocas.ninja/*",
    "http://localhost:8080/*",
    "https://*.epicoranalytics.com/*",
	  "https://*.epicoranalytics.com.au/*",
    "https://*.epicoranalytics.co.uk/*",
  ],
  "phocassoftware.com"
);

const filepath = path.resolve(
  __dirname,
  "dist",
  "phocas-power-search.bundle.js"
);
const content = fs.readFileSync(filepath);
fs.writeFileSync(filepath, userScriptBanner + "\n\n" + content);
console.log("Patched '" + filepath.toString() + "' with userscript banner");
