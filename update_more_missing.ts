import { db } from './src/firebase';
import { doc, updateDoc } from 'firebase/firestore';

async function run() {
  const updates = {
    'fcc_1132': `Hãy tạo một danh sách mua sắm trong biến \`myList\`. Danh sách này phải là một mảng đa chiều (multi-dimensional array) chứa bên trong là các mảng con (sub-arrays).
Phần tử đầu tiên trong mỗi mảng con phải là một chuỗi (String) chứa tên của món hàng. Phần tử thứ hai phải là một số (Number) đại diện cho số lượng món hàng. 

**Ví dụ:**
\`\`\`javascript
["Chocolate Bar", 15]
\`\`\`

Trong bài tập này, \`myList\` của bạn phải có chứa ít nhất 5 mảng con bên trong.`,

    'fcc_1148': `Bạn được cung cấp một object tên là \`recordCollection\`, đại diện cho một phần bộ sưu tập album âm nhạc của bạn. Mỗi album có một mã số \`id\` duy nhất đóng vai trò là khóa (key) kết nối với nhiều thuộc tính chi tiết (properties) khác. Bất kỳ album nào cũng có thể thiếu sót thông tin không đầy đủ.

Bạn sẽ bắt đầu với một hàm \`updateRecords\` có 4 tham số (parameters) như sau:
* \`records\` - là object lưu thông tin bộ sưu tập (music collection)
* \`id\` - là một số nguyên (Number)
* \`prop\` - là tên của thuộc tính (String)
* \`value\` - là giá trị (String)

Hoàn thành hàm lấy đối số là \`records\`, \`id\`, \`prop\`, và \`value\`. Hàm của bạn phải cập nhật các bản ghi trong \`recordCollection\` theo luật lệ sau:
- Hàm phải trả về \`records\`.
- Nếu \`value\` là một chuỗi rỗng (empty string), hãy xóa thuộc tính gốc (prop) khỏi \`id\` của album.
- Nếu \`prop\` khác \`tracks\` và \`value\` khác rỗng, hãy gán (assign) giá trị mới cho \`prop\`.
- Nếu \`prop\` là \`tracks\` và \`value\` không rỗng, bạn cần thêm \`value\` này vào cuối mảng \`tracks\`. Cần tạo một mảng rỗng và gán vào \`tracks\` trước nếu chưa có thuộc tính đó.`,

    'fcc_1169': `Trong trò đánh bài Blackjack của các sòng bạc (casino game), một người chơi có thể giành lợi thế lớn so với nhà cái bằng cách ghi nhớ tỷ lệ bài cao so với bài thấp còn dư lại trong bộ bài. Hành động này được gọi là Đếm bài (Card Counting).
    
Người chơi thường sẽ cộng thêm vào bộ đếm (Card count) hoặc trừ bộ đếm đi theo luật sau:
* Những quân **2, 3, 4, 5, 6** thì Count được **cộng thêm 1** (+1)
* Những quân **7, 8, 9** thì Bộ đếm **không đổi** (+0)
* Những quân **10, 'J', 'Q', 'K', 'A'** thì Bộ đếm **trừ đi 1** (-1)

Khi Bộ đếm > 0, nên đặt cược cao (Bet). Nếu bộ đếm bằng 0 hoặc âm, người chơi đánh cược thấp hoặc dừng lại (Hold).

Bạn cần viết một hàm nhận tham số bài rút (\`card\`) được phát. Nó sẽ phải cập nhật biến cục bộ hiện tại \`count\` (để đếm thông số ván bài). Cuối cùng hàm phải trả về kết quả là bộ \`count\` hiện tại, kèm thêm một dấu cách trắng, tiếp nối bằng chữ \`"Bet"\` (Nếu count dương) hoặc chữ \`"Hold"\` (nếu count bằng 0 hoặc âm).`,

    'fcc_1170': `Trong trò chơi Đánh gôn (Golf), mỗi một hố (hole) đều có quy định số gậy chuẩn \`par\` (mức gậy trung bình một tay chơi cần để đưa bóng vào). Chênh lệch giữa số gậy bạn thực đánh (\`strokes\`) so với \`par\` sẽ quy định bạn sở hữu thành tích gì.

Hàm sau sẽ nhận 2 đối số \`par\` và \`strokes\`. Hãy viết lệnh if/else để trả về chuẩn chuỗi tương ứng dưới đây (tùy thuộc vào quan hệ thứ tự của mảng \`names\`).

| **Strokes** | **Trả về chuỗi** |
| ----------- | ----------- |
| \`1\`         | \`"Hole-in-one!"\` |
| \`<= par - 2\`| \`"Eagle"\` |
| \`par - 1\`   | \`"Birdie"\` |
| \`par\`       | \`"Par"\` |
| \`par + 1\`   | \`"Bogey"\` |
| \`par + 2\`   | \`"Double Bogey"\` |
| \`>= par + 3\`| \`"Go Home!"\` |`,

    'fcc_1174': `Chúng ta có một mảng \`contacts\` chứa các object đại diện cho những cái tên người khác nhau nằm trong danh bạ danh sách liên hệ.

Hàm \`lookUpProfile\` sẽ nhận tên người (\`name\`) và thuộc tính tính (\`prop\`) làm các đối số đầu vào (arguments). \`prop\` là thông tin bất kì (Ví dụ \`"likes"\` hoặc \`"lastName"\`).
- Hàm của bạn nên kiểm tra nếu \`name\` có chứa trong mảng thì mới tiếp tục:
  - Nếu đúng, thì kiểm tra người đó xem có tồn tại thuộc tính gốc \`prop\` bên trong họ hay không.
  - Nếu tất cả cùng đúng, trả về nội dung của mảng đối tượng đó \`contacts[name][prop]\`.
- Nếu tên \`name\` không trùng khớp cái tên nào trong danh bạ liên hệ của bất kì ai, hãy trả về chuỗi \`"No such contact"\`.
- Nếu trúng tên nhưng lại không tồn tại thông tin trong mảng đối tượng (tức \`prop\` chưa tồn tại trong dữ liệu của riêng người đó), hãy trả về chuỗi \`"No such property"\`.`
  };

  for(const [id, description] of Object.entries(updates)) {
      await updateDoc(doc(db, 'challenges', id), { description });
      console.log("Updated", id);
  }
  process.exit(0);
}

run();
