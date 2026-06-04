import curriculum from '@freecodecamp/curriculum';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, writeBatch } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const blocks = curriculum.getChallenges();
const targetDashedNames = [
  'basic-html-and-html5',
  'basic-css',
  'css-flexbox',
  'css-grid',
  'basic-javascript',
  'es6'
];

async function run() {
  let globalLessonCount = 1000;
  const fccIdToSolution = {};
  
  for (const target of targetDashedNames) {
    const block = blocks.find((b: any) => b.fileName.includes(target) || b.dashedName === target);
    if (!block) continue;
    
    // The true order
    const trueOrderChallenges = block.challenges.map(c => c);
    
    // The alphabetical order (this is how Github tree would list the .md files)
    const alphabeticalChallenges = [...trueOrderChallenges].sort((a,b) => a.id.localeCompare(b.id));
    
    // Create a mapping for this chunk
    for (const challenge of trueOrderChallenges) {
      const alphaIndex = alphabeticalChallenges.findIndex(c => c.id === challenge.id);
      if (alphaIndex === -1) throw new Error("Mismatch");
      const fccId = `fcc_${globalLessonCount + alphaIndex}`;
      
      let sol = "";
      if (challenge.solutions && challenge.solutions.length > 0) {
        let rawSol = challenge.solutions[0];
        if (typeof rawSol === 'string') {
            sol = rawSol;
        } else if (Array.isArray(rawSol)) {
            sol = rawSol.map(s => s[s.length-1]).join("\n");
        } else if (rawSol.contents) {
            sol = rawSol.contents;
        }
        
        if (typeof sol === 'string') {
           if (sol.startsWith('var code = "') || sol.startsWith("var code = \"")) {
              sol = sol.replace(/^var code = "/, '').replace(/";$/, '');
              sol = sol.replace(/\\"/g, '"').replace(/\\n/g, '\n');
           }
        }
      }
      fccIdToSolution[fccId] = sol;
    }
    
    globalLessonCount += alphabeticalChallenges.length;
  }
  
  console.log(`Found ${Object.keys(fccIdToSolution).length} solutions. Updating Firebase in batches...`);
  
  const entries = Object.entries(fccIdToSolution);
  const CHUNK_SIZE = 100;
  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    const chunk = entries.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    let count = 0;
    for (const [fccId, sol] of chunk) {
      if (sol) {
        const docRef = doc(db, 'challenges', fccId);
        batch.update(docRef, { solution: sol });
        count++;
      }
    }
    if (count > 0) {
        await batch.commit();
        console.log(`Committed batch ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(entries.length / CHUNK_SIZE)}`);
    }
  }
  
  console.log("All done!");
  process.exit(0);
}

run().catch(console.error);
