const fs = require('fs');
const zlib = require('zlib');
const tar = require('tar');

fs.createReadStream('freecodecamp-curriculum-3.2.1.tgz')
  .pipe(zlib.createGunzip())
  .pipe(tar.x({
    C: 'extract'
  }));
