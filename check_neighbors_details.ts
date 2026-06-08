import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check(id: string) {
    const docSnap = await getDoc(doc(db, "challenges", id));
    console.log("-----", id, "-----");
    console.log("Instructions:\n", docSnap.data()?.instructions);
    console.log("Solution:\n", docSnap.data()?.solution);
}

async function run() {
    await check('fcc_1055');
    await check('fcc_1056');
}

run().then(() => process.exit(0)).catch(console.error);
