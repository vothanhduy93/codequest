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

let globalLessonCount = 1000;
let mapping = {}; // fcc_id -> orderIndex
let orderCount = 0;

const correctSequence = [];

for (const target of targetDashedNames) {
  const block = blocks.find((b: any) => b.fileName.includes(target) || b.dashedName === target);
  if (!block) continue;
  
  // The true order
  const trueOrderChallenges = block.challenges.map(c => c.id);
  
  // The alphabetical order (this is how Github tree would list the .md files)
  const alphabeticalChallenges = [...trueOrderChallenges].sort();
  
  // Create a mapping for this chunk
  for (const trueId of trueOrderChallenges) {
    const alphaIndex = alphabeticalChallenges.indexOf(trueId);
    if (alphaIndex === -1) throw new Error("Mismatch");
    const fccId = `fcc_${globalLessonCount + alphaIndex}`;
    correctSequence.push(fccId);
    mapping[fccId] = orderCount++;
  }
  
  globalLessonCount += alphabeticalChallenges.length;
}

fs.writeFileSync('fcc_sequence.json', JSON.stringify(correctSequence, null, 2));
console.log('Done! Generated sequence length:', correctSequence.length);
