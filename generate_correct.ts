import curriculum from '@freecodecamp/curriculum';
import fs from 'fs';

const blocks = curriculum.getChallenges();

const folders = [
  'basic-html-and-html5',
  'basic-css',
  'css-flexbox',
  'css-grid',
  'basic-javascript',
  'es6'
];

let globalLessonCount = 1000;
let finalOrderedFccIds = [];

async function run() {
  for (const folder of folders) {
    // 1. Fetch the exact file list from Github for this block to mimic server.ts
    const url = `https://api.github.com/repos/freeCodeCamp/freeCodeCamp/contents/curriculum/challenges/english/blocks/${folder}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'AI-Studio' }});
    const data = await res.json();
    
    // Filter and sort exactly like server.ts would have done
    const mdFiles = data.filter((d: any) => d.name.endsWith('.md')).map((d: any) => d.name).sort();
    
    // mdFiles is the alphabetical list. Record which ObjectId maps to which fccId
    const objectIdToFccId = {};
    for (const md of mdFiles) {
      const hexId = md.replace('.md', '');
      const fccId = `fcc_${globalLessonCount++}`;
      objectIdToFccId[hexId] = fccId;
    }

    // 2. Look up the true order in the curriculum package
    const currBlock = blocks.find((b: any) => b.fileName.includes(folder) || b.dashedName === folder || b.name.toLowerCase().replace(/ /g, '-') === folder);
    
    let blockSequence = [];
    if (currBlock) {
      for (const challenge of currBlock.challenges) {
        if (objectIdToFccId[challenge.id]) {
          blockSequence.push(objectIdToFccId[challenge.id]);
          // remove to track remaining
          delete objectIdToFccId[challenge.id];
        }
      }
    }
    
    // Add any remaining elements that were in Github but not in the offline curriculum package
    for (const remainingHex of Object.keys(objectIdToFccId)) {
       const remainingFccId = objectIdToFccId[remainingHex];
       blockSequence.push(remainingFccId);
    }

    finalOrderedFccIds.push(...blockSequence);
  }

  fs.writeFileSync('fccOrder.json', JSON.stringify(finalOrderedFccIds, null, 2));
  console.log('Generated order with length:', finalOrderedFccIds.length);
}

run();
