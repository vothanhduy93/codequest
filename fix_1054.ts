import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function fix1054() {
    await updateDoc(doc(db, "challenges", "fcc_1054"), {
        validationSnippet: "return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)' || window.getComputedStyle(document.body).backgroundColor === 'black';"
    });
    console.log("Fixed fcc_1054 in Firestore.");
}

fix1054().then(() => process.exit(0)).catch(console.error);
