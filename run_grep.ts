import * as fs from 'fs';
import * as zlib from 'zlib';

const data = fs.readFileSync('freecodecamp-curriculum-3.2.1.tgz');
const unzipped = zlib.gunzipSync(data);
const contents = unzipped.toString('utf-8');
const searchString = 'Concatenating Strings with Plus Operator';
const index = contents.indexOf(searchString);
if(index !== -1) {
    console.log('Found it!');
    console.log(contents.substring(Math.max(0, index - 500), index + 1500));
} else {
    console.log('Not found in tgz');
}
