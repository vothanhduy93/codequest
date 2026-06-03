import { db } from './src/firebase.ts';
import { collection, getDocs } from 'firebase/firestore';

async function run() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.solution && data.solution.includes('Kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball')) {
        console.log(`[${data.id}] ${data.title}`);
        console.log(`SOLUTION:`);
        console.log(data.solution);
        console.log(`DEFAULT:`);
        console.log(data.defaultCode);
    }
  });
  process.exit(0);
}
run();
