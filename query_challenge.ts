import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function findChallenge() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  const challenges = [];
  querySnapshot.forEach(d => {
    const data = d.data();
    if (data.title && data.title.includes('Sử dụng CSS Class')) {
      challenges.push(data);
    }
  });
  console.log(JSON.stringify(challenges, null, 2));
  process.exit(0);
}

findChallenge().catch(console.error);
