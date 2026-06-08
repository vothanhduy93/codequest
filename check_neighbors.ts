import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function findChallenges() {
    const querySnapshot = await getDocs(collection(db, "challenges"));
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id && (data.id === 'fcc_1054' || data.id === 'fcc_1055' || data.id === 'fcc_1056')) {
            results.push(data);
        }
    });

    results.sort((a,b) => a.id.localeCompare(b.id));

    for (const res of results) {
        console.log("ID:", res.id);
        console.log("Title:", res.title);
        console.log("Validation:", res.validationSnippet);
        console.log("---------------");
    }
}

findChallenges().then(() => process.exit(0)).catch(console.error);
