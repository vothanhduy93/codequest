import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function findJSChallenges() {
    const querySnapshot = await getDocs(collection(db, "challenges"));
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'js' && data.validationSnippet && data.validationSnippet.includes('return true;')) {
            results.push(data);
        }
    });

    results.sort((a,b) => a.id.localeCompare(b.id));

    console.log(`Found ${results.length}`);
    for (const res of results.slice(0, 5)) {
        console.log(res.id, res.title);
    }
}

findJSChallenges().then(() => process.exit(0)).catch(console.error);
