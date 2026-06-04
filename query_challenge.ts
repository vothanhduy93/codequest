import { db } from './src/firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

async function run() {
  console.log("Querying...");
  const allDocs = await getDocs(collection(db, 'challenges'));
  let found = false;
  allDocs.forEach((d) => {
      const data = d.data();
      if(data.title.includes("Thêm hình ảnh vào trang web của bạn")) {
          console.log("Found:", d.id, JSON.stringify(data, null, 2));
          found = true;
      }
  });
  if(!found) console.log("Not found at all");
  process.exit(0);
}
run();
