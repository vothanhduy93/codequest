import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function findChallenge() {
    const querySnapshot = await getDocs(collection(db, "challenges"));
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (JSON.stringify(data).toLowerCase().includes("auto-fill") || JSON.stringify(data).includes("60px")) {
            results.push(data);
        }
    });

    console.log(`Found ${results.length} matches`);
    
    // Create an autofix or logging for the matches
    for (const res of results) {
        console.log("ID:", res.id);
        console.log("Title:", res.title);
        console.log("Instructions:", res.instructions);
        console.log("Solution:", res.solution);
        console.log("---------------");
    }
}

findChallenge().then(() => process.exit(0)).catch(console.error);
