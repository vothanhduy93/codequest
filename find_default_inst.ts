import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function findDefault() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  const challenges = [];
  querySnapshot.forEach(d => {
    const data = d.data();
    if (data.instructions === 'Hãy làm theo hướng dẫn hệ thống') {
      challenges.push(data.title);
    }
  });
  console.log('Challenges with default instructions:', challenges.length);
  console.log(challenges.slice(0, 10));
  process.exit(0);
}

findDefault().catch(console.error);
