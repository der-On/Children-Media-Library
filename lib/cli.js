const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const library = require('./library');
const libaryIndexPath = path.join(__dirname, '../public/library.json');

const action = process.argv[2] || null;

function scanLibrary() {
  console.log('Scanning Library sources ...');
  library
  .scan(config.library)
  .then(library => {
    fs.writeFileSync(libaryIndexPath, JSON.stringify(library, null, 2), 'utf8');
    console.log(`Found ${library.albums.length} albums.`);
  })
  .catch(console.error.bind(console));
}

function help() {
  console.log(fs.readFileSync(path.join(__dirname, 'help.txt'), 'utf8'));
}

switch(action) {
  case 'scan':
    scanLibrary();
    break;

  case 'help':
  default:
    help();
}
