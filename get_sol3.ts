import { db } from './src/firebase.ts';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function run() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.solution && data.solution.includes('Kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff.')) {
        console.log('Title:', data.title);
        console.log('Solution:', data.solution);
        console.log('-------------');
    }
  });
  process.exit(0);
}
run();
