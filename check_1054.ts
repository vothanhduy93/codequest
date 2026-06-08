import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check1054() {
    const docSnap = await getDoc(doc(db, "challenges", "fcc_1054"));
    const data = docSnap.data();
    console.log("ID:", data?.id);
    console.log("Solution:", data?.solution);
    console.log("Default Code:", data?.defaultCode);
    console.log("Validation:", data?.validationSnippet);
}

check1054().then(() => process.exit(0)).catch(console.error);
