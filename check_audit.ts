import * as dotenv from 'dotenv';
dotenv.config();
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const querySnapshot = await getDocs(collection(db, 'challenges'));
  let total = 0;
  let audited = 0;
  let passed = 0;
  let failed = 0;
  querySnapshot.forEach(d => {
      total++;
      const data = d.data();
      if (data.auditStatus && data.auditStatus !== 'PENDING') {
          audited++;
          if (data.auditStatus === 'PASS') passed++;
          else failed++;
      }
  });

  console.log(`Total: ${total}, Audited: ${audited}, PASS: ${passed}, FAIL: ${failed}`);
  process.exit(0);
}
run();
