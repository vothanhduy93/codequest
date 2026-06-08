import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function findChallenge() {
    const docSnap = await getDoc(doc(db, "challenges", "fcc_1107"));
    const data = docSnap.data();
    console.log("ID:", data?.id);
    console.log("Solution:", data?.solution);
    console.log("Default Code:", data?.defaultCode);
    console.log("Validation:", data?.validationSnippet);
}

findChallenge().then(() => process.exit(0)).catch(console.error);
