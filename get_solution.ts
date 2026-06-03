import { db } from './src/firebase.ts';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function run() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.title && (data.title.includes('Paragraph') || data.title.includes('paragraph'))) {
        console.log('Title:', data.title);
        console.log('Solution:', data.solution);
    }
  });
  process.exit(0);
}
run();
