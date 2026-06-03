import { db } from './src/firebase.ts';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function run() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.title === 'Điền văn bản gợi ý (Placeholder Text) vào chỗ trống.') {
       console.log("Placeholder:");
       console.log(data.solution);
    }
    if (data.title === 'Xóa các phần tử HTML.') {
       console.log("Delete HTML Elements:");
       console.log(data.solution);
    }
    if (data.title === 'Bỏ chú thích (comment) HTML.') {
       console.log("Uncomment HTML:");
       console.log(data.solution);
    }
    if (data.title === 'Comment (chú thích) HTML.') {
       console.log("Comment out HTML:");
       console.log(data.solution);
    }
  });
  process.exit(0);
}
run();
