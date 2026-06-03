import { db } from './src/firebase.ts';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function run() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.title === 'Bỏ chú thích (comment) HTML.') {
       console.log("validationSnippet:");
       console.log(data.validationSnippet);
    }
  });
  process.exit(0);
}
run();
