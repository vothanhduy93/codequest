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
            if (data.solution.includes('}"') || data.solution.includes(')"')) {
                // Suspicious solutions without HTML/styling
                if (!data.solution.includes('<style>') && data.defaultCode && data.defaultCode.includes('<style>')) {
                    updates.push(data);
                }
            }
        }
    });

    console.log(`Found ${updates.length} suspicious challenges`);
    for (const data of updates) {
        console.log("ID:", data.id, "Title:", data.title);
        console.log("Broken Sol:", data.solution);
        console.log("Default:", data.defaultCode);
    }
}

findBrokenMatches().then(() => process.exit(0)).catch(console.error);
