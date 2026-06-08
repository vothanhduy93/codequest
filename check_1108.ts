import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check1108() {
    const docSnap = await getDoc(doc(db, "challenges", "fcc_1108"));
    const data = docSnap.data();
    console.log("fcc_1108 Solution:\n", data?.solution);
}

check1108().then(() => process.exit(0)).catch(console.error);
