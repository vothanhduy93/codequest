import { db } from './src/firebase.ts';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function run() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.solution && data.solution.includes('Kitty ipsum dolor sit amet')) {
        console.log('Title:', data.title);
        // console.log('Solution:', data.solution);
    }
  });
  process.exit(0);
}
run();
