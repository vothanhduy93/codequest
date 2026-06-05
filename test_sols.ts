import curriculum from '@freecodecamp/curriculum';
import * as fs from 'fs';

const blocks = curriculum.getChallenges();

let out = "";
for (const block of blocks) {
  for (const c of block.challenges) {
      if (c.title && c.title.toLowerCase().includes('value attribute')) {
         out += block.dashedName + " / " + c.title + "\n";
      }
  }
}
fs.writeFileSync('out.txt', out);

