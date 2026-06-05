import { initializeApp } from 'firebase/app';
import { getFirestore, updateDoc, doc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const instructions = `* \`myList\` nên là một mảng (array).
* Các phần tử đầu tiên trong mỗi mảng con của bạn (sub-arrays) phải là các chuỗi (string).
* Các phần tử thứ hai trong mỗi mảng con của bạn phải là các số (number).
* Bạn phải có ít nhất 5 mảng con chứa các cặp mặt hàng trong danh sách.`;

  await updateDoc(doc(db, 'challenges', 'fcc_1132'), {
    instructions: instructions
  });
  console.log('Updated instructions for fcc_1132');
  process.exit(0);
}

run().catch(console.error);
