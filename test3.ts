import curriculum from '@freecodecamp/curriculum';
import fs from 'fs';

const blocks = curriculum.getChallenges();
const targetDashedNames = [
  'basic-html-and-html5',
  'basic-css',
  'css-flexbox',
  'css-grid',
  'basic-javascript',
  'es6'
];

let orderedIds = [];

for (const target of targetDashedNames) {
  const block = blocks.find((b: any) => b.fileName.includes(target) || b.name.toLowerCase().replace(/ /g, '-') === target || b.dashedName === target);
  if (block) {
    orderedIds.push(...block.challenges.map((c: any) => c.id));
  } else {
    // If exact name didn't match, let's search via regex or just checking the end of fileName
    const b2 = blocks.find((b: any) => b.fileName.endsWith(target + '.json'));
    if (b2) {
      orderedIds.push(...b2.challenges.map((c: any) => c.id));
    } else {
      console.log('Not found:', target);
    }
  }
}

console.log('Found', orderedIds.length, 'IDs');
fs.writeFileSync('ordered_ids.json', JSON.stringify(orderedIds, null, 2));


