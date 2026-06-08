import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check(id: string) {
    const docSnap = await getDoc(doc(db, "challenges", id));
    console.log("----", id);
    const data = docSnap.data();
    console.log("Solution: ", data?.solution);
    console.log("Instructions: ", data?.instructions);
}

check('fcc_1113').then(() => process.exit(0)).catch(console.error);
