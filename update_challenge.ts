import { db } from './src/firebase';
import { doc, updateDoc } from 'firebase/firestore';

async function run() {
  const docRef = doc(db, 'challenges', 'fcc_1127');
  
  const description = `Trong JavaScript, khi toán tử \`+\` được sử dụng với một chuỗi (\`String\`), nó được gọi là **toán tử nối chuỗi** (concatenation operator). Bạn có thể tạo ra một chuỗi mới bằng cách nối các chuỗi khác lại với nhau.

**Ví dụ:**
\`\`\`javascript
'My name is Alan,' + ' I concatenate.'
\`\`\`
Đoạn code trên sẽ trả về chuỗi \`My name is Alan, I concatenate.\`.

**Lưu ý:** Bạn cần phải cẩn thận với khoảng trắng (spaces). Việc nối chuỗi sẽ KHÔNG tự động thêm dấu cách vào giữa các chuỗi được nối. Bạn cần tự thêm khoảng trắng thủ công vào bên trong dấu ngoặc kép.

**Ví dụ có khoảng trắng:**
\`\`\`javascript
var ourStr = "I come first. " + "I come second.";
\`\`\`
Chuỗi \`ourStr\` lúc này sẽ mang giá trị \`I come first. I come second.\`.`;

  await updateDoc(docRef, { description });
  console.log("Updated successfully!");
  process.exit(0);
}

run();
