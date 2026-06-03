const fs = require('fs');
const zlib = require('zlib');
const data = fs.readFileSync('freecodecamp-curriculum-3.2.1.tgz');
const unzipped = zlib.gunzipSync(data);
const contents = unzipped.toString('utf-8');
const index = contents.indexOf("Style Multiple Elements with a CSS Class");
if(index !== -1) {
    console.log("Found it!");
    const start = contents.lastIndexOf("---", index);
    const end = contents.indexOf("---", index + 100);
    console.log(contents.substring(Math.max(0, index - 200), index + 1000));
} else {
    console.log("Not found in tgz");
}
