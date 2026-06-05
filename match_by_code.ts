import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import * as fs from 'fs';
import curriculum from '@freecodecamp/curriculum';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const blocks = curriculum.getChallenges();
let allFCC = [];
for (const block of blocks) {
    if (block.challenges) {
        allFCC.push(...block.challenges);
    }
}

function extractFCCContent(fcc: any) {
    if (fcc.challengeFiles) {
        return fcc.challengeFiles[0]?.contents;
    }
    if (fcc.files) {
        const fileObj = Object.values(fcc.files)[0] as any;
        if (fileObj && fileObj.contents) {
            if (Array.isArray(fileObj.contents)) return fileObj.contents.join('\n');
            return fileObj.contents;
        }
    }
    return '';
}

// Simple Levenshtein or just character level matching. For our purpose, we can just remove whitespace and check string similarity.
function getSimilarity(s1: string, s2: string) {
    if (!s1 || !s2) return 0;
    const clean1 = String(s1).replace(/\s/g, '');
    const clean2 = String(s2).replace(/\s/g, '');
    if (clean1 === clean2) return 1;
    // Just count matching substrings of length 5
    let matches = 0;
    for (let i = 0; i < clean1.length - 5; i++) {
        if (clean2.includes(clean1.substring(i, i + 5))) matches++;
    }
    return matches / Math.max(1, clean1.length - 5);
}

async function run() {
    const querySnapshot = await getDocs(collection(db, 'challenges'));
    let matchedCount = 0;
    let updates = [];
    
    querySnapshot.forEach(doc => {
        const data = doc.data();
        let bestMatch = null;
        let bestScore = 0;
        
        for (const fcc of allFCC) {
            let score = getSimilarity(data.defaultCode, extractFCCContent(fcc));
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = fcc;
            }
        }
        
        if (doc.id === 'fcc_1002' || doc.id === 'fcc_1007') {
             console.log(`${doc.id} mapped to:`, bestMatch?.title, "solutions:", bestMatch?.solutions);
        }
        
        if (bestMatch && bestScore > 0.4) {
            let sol = "";
            if (bestMatch.solutions && bestMatch.solutions.length > 0) {
                let rawSol = bestMatch.solutions[0];
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
            } // Close bestMatch.solutions

            if (!sol) {
                // If there's no official solution, and we matched correctly, it means FCC doesn't have a solution snippet. We should clear it out so it doesn't show garbage.
                sol = "";
            }
            if (doc.id === 'fcc_1002') {
                console.log(`fcc_1002 mapped to: ${bestMatch.title} with score ${bestScore}`);
                // I will manually inject the correct solution for 1002 here!
                sol = `<h2>CatPhotoApp</h2>\n<main>\n  <p>Click here to view more <a href="#">cat photos</a>.</p>\n\n  <a href="#"><img src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg" alt="A cute orange cat lying on its back."></a>\n\n  <p>Things cats love:</p>\n  <ul>\n    <li>catnip</li>\n    <li>laser pointers</li>\n    <li>lasagna</li>\n  </ul>\n  <p>Top 3 things cats hate:</p>\n  <ol>\n    <li>flea treatment</li>\n    <li>thunder</li>\n    <li>other cats</li>\n  </ol>\n  <form action="https://www.freecatphotoapp.com/submit-cat-photo">\n    <label for="indoor"><input id="indoor" type="radio" name="indoor-outdoor" value="indoor"> Indoor</label>\n    <label for="outdoor"><input id="outdoor" type="radio" name="indoor-outdoor" value="outdoor"> Outdoor</label><br>\n    <label for="loving"><input id="loving" type="checkbox" name="personality" value="loving"> Loving</label>\n    <label for="lazy"><input id="lazy" type="checkbox" name="personality" value="lazy"> Lazy</label>\n    <label for="energetic"><input id="energetic" type="checkbox" name="personality" value="energetic"> Energetic</label><br>\n    <input type="text" placeholder="cat photo URL" required>\n    <button type="submit">Submit</button>\n  </form>\n</main>`;
            }
            if (doc.id === 'fcc_1007') {
                 sol = `<h2>CatPhotoApp</h2>\n<main>\n  <p>Click here to view more <a href="#">cat photos</a>.</p>\n\n  <a href="#"><img src="https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg" alt="A cute orange cat lying on its back."></a>\n\n  <p>Things cats love:</p>\n  <ul>\n    <li>catnip</li>\n    <li>laser pointers</li>\n    <li>lasagna</li>\n  </ul>\n  <p>Top 3 things cats hate:</p>\n  <ol>\n    <li>flea treatment</li>\n    <li>thunder</li>\n    <li>other cats</li>\n  </ol>\n  <form action="https://www.freecatphotoapp.com/submit-cat-photo">\n    <label for="indoor"><input id="indoor" type="radio" name="indoor-outdoor" value="indoor" checked> Indoor</label>\n    <label for="outdoor"><input id="outdoor" type="radio" name="indoor-outdoor" value="outdoor"> Outdoor</label><br>\n    <label for="loving"><input id="loving" type="checkbox" name="personality" value="loving" checked> Loving</label>\n    <label for="lazy"><input id="lazy" type="checkbox" name="personality" value="lazy"> Lazy</label>\n    <label for="energetic"><input id="energetic" type="checkbox" name="personality" value="energetic"> Energetic</label><br>\n    <input type="text" placeholder="cat photo URL" required>\n    <button type="submit">Submit</button>\n  </form>\n</main>`;
            }
            updates.push({ id: doc.id, sol: sol, title: data.title, matchTitle: bestMatch.title });
            matchedCount++;
        } else {
            // For unmatched items, let's clear their solution. They shouldn't have garbage either.
            updates.push({ id: doc.id, sol: "", title: data.title, matchTitle: "UNMATCHED" });
            console.log('No match for:', doc.id, data.title, bestScore);
        }
    });

    console.log(`Matched ${matchedCount} / ${querySnapshot.size}`);
    
    const updatesWithRadio = updates.filter(u => u.title.includes('Radio'));
    console.log("updates with Radio:", updatesWithRadio);
    
    const CHUNK_SIZE = 100;
    for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
        const chunk = updates.slice(i, i+CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const u of chunk) {
            if (u.id === 'fcc_1002') {
               console.log("fcc_1002 IS MAPPED TO: ", u.matchTitle);
            }
            batch.update(doc(db, 'challenges', u.id), { solution: u.sol });
        }
        await batch.commit();
    }
    console.log('Done!');
    process.exit(0);
}
run();
