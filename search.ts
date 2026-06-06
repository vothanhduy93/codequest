import * as dotenv from 'dotenv';
dotenv.config();
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';
const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);
async function run() {
  const snapshot = await getDocs(collection(db, 'challenges'));
  snapshot.forEach(doc => {
      const data = doc.data();
      if (data.title && data.title.includes('attribute selector') || (data.instructions && data.instructions.includes('margin-top là 10px'))) {
          console.log(doc.id, data.title);
      }
  });
  process.exit(0);
}
run();