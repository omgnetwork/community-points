const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const package_json = require('../package.json');

const BUILD_PATH = path.resolve(__dirname, '../build');
const RELEASE_OUTPUT_PATH = path.resolve(__dirname, '.');
const RELEASE_BUNDLE_NAME = `Release_v${package_json.version}.zip`;

execSync(`zip -r ${RELEASE_BUNDLE_NAME} *`, { cwd: BUILD_PATH });

const oldPath = `${BUILD_PATH}/${RELEASE_BUNDLE_NAME}`;
const newPath = `${RELEASE_OUTPUT_PATH}/${RELEASE_BUNDLE_NAME}`;

fs.rename(oldPath, newPath, function renamePaths (err) {
  if (err) {
    throw err;
  }
  console.log(`Successfully created release bundle ${RELEASE_BUNDLE_NAME} in client/release`);
  console.log(`Don't forget to push the tag v${package_json.version} to remote`);
});
