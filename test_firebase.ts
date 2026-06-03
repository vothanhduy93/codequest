import { db } from './src/firebase.ts';
import { collection, getDocs } from 'firebase/firestore';

async function run() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  let dbChallenges = [];
  querySnapshot.forEach((doc) => {
    dbChallenges.push(doc.data());
  });
  console.log('Firebase challenges:', dbChallenges.length);
  const titles = dbChallenges.map(c => ({ id: c.id, title: c.title, type: c.type }));
  titles.sort((a, b) => a.id.localeCompare(b.id));
  console.log(JSON.stringify(titles.slice(0, 50), null, 2));
  process.exit(0);
}

run();
