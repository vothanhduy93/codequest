import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const docRef = doc(db, 'challenges', 'fcc_1002');
  const d = await getDoc(docRef);
  if (d.exists()) {
     const dat = d.data();
     console.log('title:', dat.title);
     console.log('fccId:', dat.fccId);
     console.log('dashedName:', dat.dashedName);
     console.log('solution:\n', dat.solution);
  }
  process.exit(0);
}
run();
