import { initializeApp } from 'firebase/app';
import { getFirestore, updateDoc, doc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const updates = {
    'fcc_1148': `* Hàm \`updateRecords\` phải trả về bộ \`records\` ban đầu với phần đã sửa đổi.
* Sau khi gọi \`updateRecords(recordCollection, 5439, "artist", "ABBA")\`, \`artist\` trong \`5439\` nên là \`"ABBA"\`
* Sau khi gọi \`updateRecords(recordCollection, 5439, "tracks", "Take a Chance on Me")\`, mảng \`tracks\` nên có \`"Take a Chance on Me"\` nằm ở cuối mảng.
* Sau khi gọi \`updateRecords(recordCollection, 2548, "artist", "")\`, \`artist\` không nên tồn tại trong \`2548\`
* Sau khi gọi \`updateRecords(recordCollection, 1245, "tracks", "Addicted to Love")\`, \`tracks\` nên có \`"Addicted to Love"\`
* Sau khi gọi \`updateRecords(recordCollection, 2468, "tracks", "Free")\`, kết quả \`tracks\` cũng phải thêm \`"Free"\`.
* Sau khi gọi \`updateRecords(recordCollection, 2548, "tracks", "")\`, \`tracks\` không nên tồn tại trong \`2548\``,
    'fcc_1169': `* \`count\` chỉ thay đổi dựa trên giá trị của các quân bài (tăng 1 với 2-6, giữ nguyên với 7-9, và trừ 1 với 10-A).
* \`cc(2); cc(3); cc(7); cc('K'); cc('A');\` nên trả về chuỗi \`"0 Hold"\`
* \`cc(7); cc(8); cc(9);\` nên trả về chuỗi \`"0 Hold"\`
* \`cc(10); cc('J'); cc('Q'); cc('K'); cc('A');\` nên trả về chuỗi \`"-5 Hold"\`
* \`cc(3); cc(7); cc('Q'); cc(8); cc('A');\` nên trả về chuỗi \`"-1 Hold"\`
* \`cc(2); cc('J'); cc(9); cc(2); cc(7);\`, bạn phải trả về \`"1 Bet"\``,
    'fcc_1170': `* \`golfScore(4, 1)\` nên trả về \`"Hole-in-one!"\`
* \`golfScore(4, 2)\` nên trả về \`"Eagle"\`
* \`golfScore(5, 2)\` nên trả về \`"Eagle"\`
* \`golfScore(4, 3)\` nên trả về \`"Birdie"\`
* \`golfScore(4, 4)\` nên trả về \`"Par"\`
* \`golfScore(1, 1)\` nên trả về \`"Hole-in-one!"\`
* \`golfScore(5, 5)\` nên trả về \`"Par"\`
* \`golfScore(4, 5)\` nên trả về \`"Bogey"\`
* \`golfScore(4, 6)\` nên trả về \`"Double Bogey"\`
* \`golfScore(4, 7)\` nên trả về \`"Go Home!"\`
* \`golfScore(5, 9)\` nên trả về \`"Go Home!"\``,
    'fcc_1174': `* \`lookUpProfile("Kristian", "lastName")\` nên trả về chuỗi \`"Vos"\`
* \`lookUpProfile("Sherlock", "likes")\` nên trả về mảng \`["Intriguing Cases", "Violin"]\`
* \`lookUpProfile("Harry", "likes")\` nên trả về một mảng
* \`lookUpProfile("Bob", "number")\` nên trả về chuỗi \`"No such contact"\`
* \`lookUpProfile("Bob", "potato")\` nên trả về chuỗi \`"No such contact"\`
* \`lookUpProfile("Akira", "address")\` nên trả về chuỗi \`"No such property"\``
  };

  for(const [id, instructions] of Object.entries(updates)) {
      await updateDoc(doc(db, 'challenges', id), { instructions });
      console.log('Updated instructions for', id);
  }
  process.exit(0);
}

run().catch(console.error);
