import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  let retTrue = 0;
  let total = 0;
  querySnapshot.forEach(doc => {
      total++;
      if (doc.data().validationSnippet === 'return true;') retTrue++;
  });
  console.log(`total: ${total}, return true: ${retTrue}`);
  process.exit(0);
}
run();
