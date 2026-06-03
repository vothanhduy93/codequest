import { db } from './src/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function run() {
  const q = query(collection(db, 'challenges'), where('description', '==', 'Không có mô tả.'));
  const querySnapshot = await getDocs(q);
  
  querySnapshot.forEach((d) => {
    console.log(d.id, d.data().title);
  });
  console.log("Total missing:", querySnapshot.size);
  process.exit(0);
}
run();
