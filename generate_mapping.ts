import curriculum from '@freecodecamp/curriculum';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
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

async function updateAllSolutions() {
    let globalLessonCount = 1000;
    const fccIdToSolution = {};
    
    for (const target of targetDashedNames) {
        const block = blocks.find((b: any) => b.fileName.includes(target) || b.dashedName === target);
        if (!block) continue;
        
        const trueOrderChallenges = block.challenges;
        console.log(Object.keys(trueOrderChallenges[0]));
        // The alphabetical order of the dashed names (this is how Github tree would list the .md files)
        const alphabeticalChallenges = [...trueOrderChallenges].sort((a, b) => {
            const nameA = a.dashedName || a.title || a.id;
            const nameB = b.dashedName || b.title || b.id;
            return nameA.localeCompare(nameB);
        });
        
        if (target === 'basic-html-and-html5') {
            console.log('Alpha index of use-the-value-attribute-with-radio-buttons-and-checkboxes:', alphabeticalChallenges.findIndex(c => c.dashedName === 'use-the-value-attribute-with-radio-buttons-and-checkboxes'));
        }
        for (const challenge of block.challenges) {
            const alphaIndex = alphabeticalChallenges.findIndex(c => c.id === challenge.id);
            if (alphaIndex === -1) throw new Error("Mismatch");
            
            const fccId = `fcc_${globalLessonCount + alphaIndex}`;
            
            let sol = "";
            if (challenge.solutions && challenge.solutions.length > 0) {
                let rawSol = challenge.solutions[0];
                if (typeof rawSol === 'string') {
                    sol = rawSol;
                } else if (Array.isArray(rawSol)) {
                    sol = rawSol.map((s: any) => s[s.length-1]).join("\n");
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
    
    console.log(`Prepared ${Object.keys(fccIdToSolution).length} solutions. Updating Firebase...`);
    const entries = Object.entries(fccIdToSolution);
    const CHUNK_SIZE = 100;
    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
        const chunk = entries.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        let count = 0;
        for (const [fccId, sol] of chunk) {
            if (sol) {
               batch.update(doc(db, 'challenges', fccId), { solution: sol });
               count++;
            }
        }
        if (count > 0) {
            await batch.commit();
            console.log(`Committed batch ${i} to ${i + count}`);
        }
    }
    console.log("Done updating all solutions!");
    process.exit(0);
}
updateAllSolutions().catch(console.error);
