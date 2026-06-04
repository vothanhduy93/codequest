import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function findChallenge() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  const challenges = [];
  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (data.title && data.title.includes('Thêm hình ảnh')) {
      challenges.push(data);
    }
  });
  console.log(JSON.stringify(challenges, null, 2));
}

findChallenge().catch(console.error);
