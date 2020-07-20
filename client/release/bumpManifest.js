const fs = require('fs');
const package_json = require('../package.json');

const rawManifest = fs.readFileSync('./config/manifest.json');
const oldManifest = JSON.parse(rawManifest);
const newManifest = {
  ...oldManifest,
  version: package_json.version
};

fs.writeFileSync(
  './config/manifest.json',
  JSON.stringify(newManifest, null, 2)
);

console.log(`Successfully updated version in manifest.json to v${package_json.version}`);
