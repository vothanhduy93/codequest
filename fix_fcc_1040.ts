import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, updateDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);

async function run() {
  const challengeRef = doc(db, 'challenges', 'fcc_1040');
  
  const validationSnippet = `
    const form = document.querySelector('form');
    if (!form) throw new Error("Chưa tìm thấy thẻ form");
    if (form.id !== 'cat-photo-form') throw new Error("Thuộc tính id chưa đúng 'cat-photo-form'");
    return true;
  `;

  await updateDoc(challengeRef, { validationSnippet });
  console.log("Updated fcc_1040");
  process.exit(0);
}

run().catch(console.error);
