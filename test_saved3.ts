import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const d = await getDoc(doc(db, 'challenges', 'fcc_1017'));
  console.log("Title: ", d.data().title);
  console.log("Sol: ", d.data().solution);
  process.exit(0);
}
check().catch(console.error);
