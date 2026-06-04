import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, collection } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const ids = ['fcc_1015', 'fcc_1016', 'fcc_1008', 'fcc_1017'];
  for (const id of ids) {
     const docSnap = await getDoc(doc(db, 'challenges', id));
     const data = docSnap.data();
     console.log("ID:", id);
     console.log("Title:", data.title);
     console.log("Solution:", data.solution);
     console.log("---------------");
  }
}
check().catch(console.error);
