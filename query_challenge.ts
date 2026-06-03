import { db } from './src/firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

async function run() {
  console.log("Querying...");
  const q = query(collection(db, 'challenges'), where('title', '==', 'Concatenating Strings with Plus Operator'));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
      console.log("Not found by title match. Let's fetch all and filter client-side.");
      const allDocs = await getDocs(collection(db, 'challenges'));
      let found = false;
      allDocs.forEach((d) => {
          if(d.data().title.includes("Concatenating Strings")) {
              console.log("Found:", d.id, d.data().title, d.data().description);
              found = true;
          }
      });
      if(!found) console.log("Not found at all");
  } else {
    querySnapshot.forEach((d) => {
      console.log("Found:", d.id, d.data());
    });
  }
  process.exit(0);
}
run();
