import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  const missing = [];
  querySnapshot.forEach(doc => {
      if (!doc.data().solution) {
          missing.push({ id: doc.id, title: doc.data().title });
      }
  });
  console.log(`Total missing: ${missing.length}`);
  for (let i = 0; i < 5; i++) {
    console.log(missing[i]);
  }
  process.exit(0);
}
run();
