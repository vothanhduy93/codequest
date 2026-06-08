import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function findBrokenMatches() {
    const querySnapshot = await getDocs(collection(db, "challenges"));
    const updates: any[] = [];
    querySnapshot.forEach((d) => {
        const data = d.data();
        if (data.solution && typeof data.solution === 'string') {
            if (!data.solution.includes('<style>') && data.defaultCode && data.defaultCode.includes('<style>')) {
                // Not containing HTML/style wrapper!
                updates.push(data);
            }
        }
    });

    console.log(`Found ${updates.length} suspicious challenges`);
    for (const data of updates.slice(0, 5)) {
        console.log("ID:", data.id, "Title:", data.title);
        console.log("Solution length:", data.solution.length, "Solution:", data.solution);
    }
}

findBrokenMatches().then(() => process.exit(0)).catch(console.error);
