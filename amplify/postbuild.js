const minimist = require('minimist');
const fs = require('fs');
const path = require('path');

const options = minimist(process.argv);

const target = options['target'];
const sourceFile = path.join(__dirname, `amplify.${target}.yml`);
const destinationFile = path.join(__dirname, '../', `amplify.yml`);

fs.copyFile(sourceFile, destinationFile, (err) => {
  if (err) {
    console.log(`Error copying ${sourceFile} to ${destinationFile}`);
    throw err;
  }
  console.log(`${sourceFile} was copied to ${destinationFile}`);
});
