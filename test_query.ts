import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);

async function run() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  let count = 0;
  querySnapshot.forEach(d => {
    const data = d.data();
    if (data.validationSnippet && data.validationSnippet.trim() === 'return true;') {
      count++;
    }
  });
  console.log("Total with return true:", count);
  process.exit(0);
}

run().catch(console.error);
