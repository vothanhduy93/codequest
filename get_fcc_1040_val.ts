import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);

async function run() {
  const c = await getDoc(doc(db, 'challenges', 'fcc_1040'));
  const html = c.data().defaultCode;
  const val = c.data().validationSnippet;
  console.log("Validation Snippet:");
  console.log(val);
  process.exit(0);
}

run().catch(console.error);
