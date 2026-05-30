import { Challenge, Badge } from './types';

export const LEVEL_THRESHOLDS = [0, 500, 1200, 2500, 4500, 7000, 10000];

export const BADGES: Record<string, Badge> = {
  first_blood: {
    id: 'first_blood',
    name: 'Khởi đầu mới',
    icon: 'Trophy',
    description: 'Hoàn thành thử thách đầu tiên',
  },
  html_master: {
    id: 'html_master',
    name: 'Kiến trúc sư',
    icon: 'Layout',
    description: 'Hoàn thành chuỗi bài HTML',
  },
  css_master: {
    id: 'css_master',
    name: 'Phù thủy Màu sắc',
    icon: 'Palette',
    description: 'Hoàn thành chuỗi bài CSS',
  },
  js_ninja: {
    id: 'js_ninja',
    name: 'Ninja JS',
    icon: 'Code',
    description: 'Hoàn thành chuỗi bài JavaScript',
  }
};

const htmlConcepts = [
  { tag: 'h2', desc: 'tiêu đề cấp 2', attr: '' },
  { tag: 'h3', desc: 'tiêu đề cấp 3', attr: '' },
  { tag: 'strong', desc: 'chữ in đậm mạnh mẽ', attr: '' },
  { tag: 'em', desc: 'chữ in nghiêng', attr: '' },
  { tag: 'u', desc: 'chữ gạch chân', attr: '' },
  { tag: 'br', desc: 'xuống dòng', attr: '' },
  { tag: 'hr', desc: 'đường kẻ ngang', attr: '' },
  { tag: 'div', desc: 'khối chứa độc lập', attr: '' },
  { tag: 'span', desc: 'khối chứa nội tuyến', attr: '' },
  { tag: 'ol', desc: 'danh sách có thứ tự', attr: '' },
  { tag: 'table', desc: 'bảng dữ liệu', attr: '' },
  { tag: 'tr', desc: 'hàng trong bảng', attr: '' },
  { tag: 'td', desc: 'ô trong bảng', attr: '' },
  { tag: 'header', desc: 'đầu trang', attr: '' },
  { tag: 'footer', desc: 'chân trang', attr: '' },
  { tag: 'nav', desc: 'thanh điều hướng', attr: '' },
  { tag: 'main', desc: 'nội dung chính', attr: '' },
  { tag: 'article', desc: 'bài viết độc lập', attr: '' },
  { tag: 'section', desc: 'phân vùng nội dung', attr: '' },
  { tag: 'aside', desc: 'nội dung bên lề', attr: '' }
];

const cssConcepts = [
  { prop: 'color', val: 'blue', desc: 'đổi màu chữ xanh' },
  { prop: 'font-weight', val: 'bold', desc: 'làm chữ in đậm' },
  { prop: 'font-style', val: 'italic', desc: 'làm chữ in nghiêng' },
  { prop: 'text-decoration', val: 'underline', desc: 'gạch chân chữ' },
  { prop: 'text-align', val: 'center', desc: 'căn giữa chữ' },
  { prop: 'text-align', val: 'right', desc: 'căn phải chữ' },
  { prop: 'line-height', val: '1.5', desc: 'giãn dòng' },
  { prop: 'letter-spacing', val: '2px', desc: 'giãn chữ' },
  { prop: 'width', val: '50%', desc: 'đặt chiều rộng' },
  { prop: 'height', val: '200px', desc: 'đặt chiều cao' },
  { prop: 'max-width', val: '100%', desc: 'chiều rộng tối đa' },
  { prop: 'min-height', val: '100vh', desc: 'chiều cao tối thiểu' },
  { prop: 'margin', val: '10px', desc: 'cách lề ngoài' },
  { prop: 'padding', val: '15px', desc: 'cách lề trong' },
  { prop: 'border', val: '1px solid black', desc: 'kẻ đường viền' },
  { prop: 'border-radius', val: '50%', desc: 'bo tròn hình tròn' },
  { prop: 'box-shadow', val: '2px 2px 5px gray', desc: 'đổ bóng' },
  { prop: 'opacity', val: '0.5', desc: 'làm mờ 50%' },
  { prop: 'display', val: 'none', desc: 'ẩn phần tử' },
  { prop: 'display', val: 'inline-block', desc: 'khối nội tuyến' }
];

const jsConcepts = [
  { code: 'console.log("Xin chào");', desc: 'in ra Xin chào' },
  { code: 'let x = 10;', desc: 'khai báo biến x là 10' },
  { code: 'const y = 20;', desc: 'khai báo hằng số y là 20' },
  { code: 'let sum = 5 + 5;', desc: 'tính tổng 5 + 5' },
  { code: 'let name = "An";', desc: 'tạo biến tên' },
  { code: 'let isRaining = true;', desc: 'khai báo boolean' },
  { code: 'let arr = [1, 2, 3];', desc: 'tạo mảng' },
  { code: 'arr.push(4);', desc: 'thêm vào mảng' },
  { code: 'let obj = {age: 20};', desc: 'tạo đối tượng' },
  { code: 'if (x > 5) {}', desc: 'lệnh điều kiện if' },
  { code: 'for(let i=0; i<3; i++) {}', desc: 'vòng lặp for' },
  { code: 'while(x < 5) { x++; }', desc: 'vòng lặp while' },
  { code: 'function sayHi() {}', desc: 'khai báo hàm' },
  { code: 'const arrow = () => {};', desc: 'hàm mũi tên' },
  { code: 'document.createElement("div");', desc: 'tạo thẻ div' },
  { code: 'document.body.appendChild(el);', desc: 'chèn thẻ' },
  { code: 'el.classList.add("active");', desc: 'thêm class' },
  { code: 'el.style.color = "red";', desc: 'đổi màu inline' },
  { code: 'setTimeout(() => {}, 1000);', desc: 'đợi 1 giây' },
  { code: 'setInterval(() => {}, 1000);', desc: 'lặp mỗi giây' }
];

const generateDetailedLessons = (type: 'html' | 'css' | 'js', count: number): Challenge[] => {
  const diffs: ('Dễ' | 'Trung bình' | 'Khó')[] = ['Dễ', 'Trung bình', 'Khó'];
  const concepts = type === 'html' ? htmlConcepts : type === 'css' ? cssConcepts : jsConcepts;
  
  return Array.from({ length: count }).map((_, idx) => {
    const level = Math.floor(idx / (count / 3)); 
    const difficulty = diffs[level] || 'Khó';
    const num = idx + 7; // offset since we have hardcoded ones
    const concept = concepts[idx % concepts.length];
    
    let title, description, instructions, hint, solution, solutionExplanation, defaultCode, validationSnippet;
    
    if (type === 'html') {
      const c = concept as typeof htmlConcepts[0];
      title = `Bài ${num}: Ôn tập ${c.tag.toUpperCase()} - ${c.desc}`;
      description = `Tiếp tục hành trình với HTML, hãy thử sử dụng thẻ ${c.tag} để tạo ${c.desc}. Luyện tập sẽ giúp bạn nhớ lâu hơn!`;
      instructions = `Hãy viết một thẻ <${c.tag}>${c.tag !== 'br' && c.tag !== 'hr' ? ` đóng mở đầy đủ với nội dung "Cố lên"` : ``}.`;
      hint = `Cú pháp html cơ bản: <${c.tag}>${c.tag !== 'br' && c.tag !== 'hr' ? `nội dung</${c.tag}>` : ``}`;
      solution = `<${c.tag}>${c.tag !== 'br' && c.tag !== 'hr' ? `Cố lên</${c.tag}>` : ``}`;
      solutionExplanation = `Thẻ <${c.tag}> trong HTML đóng vai trò tạo ${c.desc}, giúp trình duyệt hiểu rõ cấu trúc nội dung.`;
      defaultCode = `<!-- Thêm thẻ ${c.tag} ở đây -->\n`;
      validationSnippet = `const code = document.body.innerHTML.toLowerCase(); return code.includes('<${c.tag}');`;
    } else if (type === 'css') {
      const c = concept as typeof cssConcepts[0];
      title = `Bài ${num}: Phong cách ${c.prop}`;
      description = `Trang trí web chuyên sâu với thuộc tính ${c.prop} để ${c.desc}.`;
      instructions = `Chuyển qua tab CSS, thiết lập ${c.prop}: ${c.val}; cho phần tử h1.`;
      hint = `Sử dụng cấu trúc: h1 { ${c.prop}: ${c.val}; }`;
      solution = `<style>\nh1 { ${c.prop}: ${c.val}; }\n</style>\n<h1>Thử nghiệm</h1>`;
      solutionExplanation = `Thuộc tính ${c.prop} khi nhận giá trị ${c.val} sẽ tự động ${c.desc}, làm trang web sinh động hơn hẳn.`;
      defaultCode = `<h1>Thử nghiệm</h1>\n<style>\nh1 {\n  /* nhập CSS vào tab CSS */\n}\n</style>`;
      validationSnippet = `const style = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join(' '); return style.includes('${c.prop}') && style.includes('${c.val.replace(";", "")}');`;
    } else {
      const c = concept as typeof jsConcepts[0];
      title = `Bài ${num}: Chuyên gia ${c.code.split(' ')[0]}`;
      description = `Tập trung vào logic với JavaScript: ${c.desc}.`;
      instructions = `Chuyển qua tab JS, hãy viết dòng lệnh: ${c.code}`;
      hint = `Bạn cứ copy/paste hoặc tự gõ lại chính xác: ${c.code}`;
      solution = `<script>\n${c.code}\n</script>`;
      solutionExplanation = `Lệnh ${c.code} giúp trình duyệt thực thi hành động: ${c.desc}. Viết code JS rất cần sự chính xác tuyệt đối.`;
      defaultCode = `<script>\n  // Viết lệnh vào tab JS\n</script>`;
      const kw = c.code.split(/[ (.=]/)[0];
      validationSnippet = `const jsCode = document.querySelector('script')?.textContent || ''; return jsCode.includes('${kw}');`;
    }

    return {
      id: `gen_${type}_${num}`,
      title,
      difficulty,
      type,
      kind: 'lesson',
      description,
      instructions,
      hint,
      solution,
      solutionExplanation,
      defaultCode,
      xpReward: 50 + (level * 50), // 50, 100, 150
      validationSnippet
    };
  });
};

export const CHALLENGES: Challenge[] = [
  // ==============================
  // HTML LESSONS
  // ==============================
  {
    id: 'html_1',
    title: 'Bài 1: Khởi nguồn của Web - Hello World',
    difficulty: 'Dễ',
    type: 'html',
    kind: 'lesson',
    description: 'Bất kỳ pháp sư lập trình nào cũng bắt đầu bằng một câu chú cơ bản nhất! Hãy tạo ra dòng chữ siêu to khổng lồ chào thế giới nhé.',
    instructions: 'Sử dụng thẻ <h1> mở và </h1> đóng. Ở giữa, hãy viết dòng chữ "Hello CodeQuest".',
    hint: 'Thẻ <h1> là thẻ tiêu đề (heading) to nhất. Bạn viết như thế này: <h1>Tin nhắn của bạn</h1>',
    solution: '<h1>Hello CodeQuest</h1>',
    solutionExplanation: 'Thẻ <h1> (Heading 1) được HTML ưu ái sử dụng cho tiêu đề chính của một trang. Trình duyệt tự động làm cho chữ to ra và in đậm. Đừng quên thẻ đóng </h1> nhé!',
    defaultCode: '<!-- Viết mã HTML của bạn vào dòng bên dưới -->\n',
    xpReward: 100,
    validationSnippet: "return document.body.innerHTML.includes('Hello CodeQuest') && document.querySelector('h1') !== null;",
  },
  {
    id: 'html_2',
    title: 'Bài 2: Viết một câu chuyện',
    difficulty: 'Dễ',
    type: 'html',
    kind: 'lesson',
    description: 'Thế giới Web không chỉ có tiêu đề to lớn! Thẻ đoạn văn giúp bạn viết những câu chuyện hay. Hãy nhấn mạnh một từ nào đó nhé!',
    instructions: 'Tạo một thẻ <p> chứa nội dung: "Lập trình thật thú vị!". Hãy bọc từ "thú vị" bằng thẻ <b> để làm nó in đậm nổi bật.',
    hint: 'Cấu trúc thẻ p: <p>Nội dung</p>. Cấu trúc thẻ b: <b>chữ in đậm</b>. Nhét thẻ <b> vào bên trong thẻ <p>.',
    solution: '<p>Lập trình thật <b>thú vị</b>!</p>',
    solutionExplanation: 'Thẻ <p> (Paragraph) dùng để viết đoạn văn. Thẻ <b> (Bold) dùng để in đậm văn bản bên trong. HTML cho phép lồng các thẻ vào nhau như những chiếc hộp matryoshka!',
    defaultCode: '<!-- Viết một đoạn văn p có chứa chữ in đậm b -->\n',
    xpReward: 120,
    validationSnippet: "const p = document.querySelector('p'); const b = document.querySelector('b'); return p && b && p.textContent.includes('Lập trình thật thú vị!') && b.textContent === 'thú vị';",
  },
  {
    id: 'html_3',
    title: 'Bài 3: Danh sách hành trang dũng sĩ',
    difficulty: 'Dễ',
    type: 'html',
    kind: 'lesson',
    description: 'Một dũng sĩ CodeQuest luôn cần có hành trang. Hãy lập danh sách những vật phẩm bạn mang theo.',
    instructions: 'Tạo một danh sách vô hướng bằng thẻ <ul>. Bên trong tạo 3 thẻ <li> với nội dung: "Bàn phím", "Chuột", "Cà phê".',
    hint: '<ul> (Unordered List) bọc bên ngoài. Bên trong là các mục con <li> (List Item).',
    solution: '<ul>\n  <li>Bàn phím</li>\n  <li>Chuột</li>\n  <li>Cà phê</li>\n</ul>',
    solutionExplanation: 'Cặp thẻ <ul> và <li> luôn đi cùng nhau. <ul> quy định kiểu danh sách (có dấu chấm tròn), còn <li> là từng món đồ trong danh sách đó. Cấu trúc lồng nhau rất quan trọng trong HTML!',
    defaultCode: '<!-- Viết thẻ ul và li ở bên dưới -->\n',
    xpReward: 150,
    validationSnippet: "const ul = document.querySelector('ul'); return ul && ul.querySelectorAll('li').length === 3 && document.body.innerHTML.includes('Cà phê');",
  },
  {
    id: 'html_4',
    title: 'Bài 4: Chèn hình ảnh yêu thích',
    difficulty: 'Trung bình',
    type: 'html',
    kind: 'lesson',
    description: 'Trang web mà không có hình ảnh thì thật khô khan! Hãy trưng bày bức tranh đẹp nhất của bạn.',
    instructions: 'Sử dụng thẻ <img> để chèn ảnh. Thêm thuộc tính src="https://picsum.photos/200" và alt="Anh dep".',
    hint: 'Thẻ <img> rất đặc biệt vì nó không có thẻ đóng! Cú pháp chuẩn là: <img src="..." alt="...">',
    solution: '<img src="https://picsum.photos/200" alt="Anh dep" />',
    solutionExplanation: 'Thẻ <img> (Image) tự đóng. Thuộc tính `src` (source) là đường dẫn tới bức ảnh. `alt` (alternative) là văn bản hiện ra nếu ảnh bị lỗi, rất cần thiết cho người đọcếm thị.',
    defaultCode: '<!-- Chèn ảnh bằng thẻ img -->\n',
    xpReward: 180,
    validationSnippet: "const img = document.querySelector('img'); return img && img.getAttribute('src') === 'https://picsum.photos/200' && img.getAttribute('alt') === 'Anh dep';",
  },
  {
    id: 'html_5',
    title: 'Bài 5: Cánh cửa thần kỳ',
    difficulty: 'Trung bình',
    type: 'html',
    kind: 'lesson',
    description: 'Web là một mạng lưới khổng lồ. Mọi thứ được liên kết với nhau bằng những đường link!',
    instructions: 'Tạo một thẻ liên kết <a> trỏ đến trang web "https://google.com". Nội dung của link là "Đến Google".',
    hint: 'Thẻ <a> (Anchor) dùng thuộc tính href để dẫn đường. Ví dụ: <a href="link">Câu chữ</a>.',
    solution: '<a href="https://google.com">Đến Google</a>',
    solutionExplanation: 'Thuộc tính href (hypertext reference) trong thẻ <a> giúp kết nối vô tận các trang web trên internet. Mặc định nó sẽ hiển thị màu xanh lam có gạch chân.',
    defaultCode: '<!-- Tạo đường liên kết ở đây -->\n',
    xpReward: 200,
    validationSnippet: "const a = document.querySelector('a'); return a && a.getAttribute('href') === 'https://google.com' && a.textContent === 'Đến Google';",
  },
  {
    id: 'html_6',
    title: 'Bài 6: Ô nhập liệu tuyệt đỉnh',
    difficulty: 'Khó',
    type: 'html',
    kind: 'lesson',
    description: 'Tương tác là linh hồn của web. Hãy tạo ra ô để người dùng nhập thông tin.',
    instructions: 'Thiết kế một ô nhập mật khẩu. Dùng thẻ <input> với type="password" và placeholder là "Nhập mật khẩu".',
    hint: 'Giống thẻ img, thẻ input không có thẻ đóng. Thuộc tính placeholder là chữ mờ hướng dẫn người dùng.',
    solution: '<input type="password" placeholder="Nhập mật khẩu" />',
    solutionExplanation: 'Thẻ <input> có thể thay hình đổi dạng cực mạnh tuỳ vào thuộc tính `type`. Type password tự động biến các ký tự thành chấm tròn đen để bảo mật.',
    defaultCode: '<!-- Thêm một input type password -->\n',
    xpReward: 250,
    validationSnippet: "const inp = document.querySelector('input'); return inp && inp.getAttribute('type') === 'password' && inp.getAttribute('placeholder') === 'Nhập mật khẩu';",
  },

  // ==============================
  // CSS LESSONS
  // ==============================
  {
    id: 'css_1',
    title: 'Bài 1: Phù thủy sắc màu',
    difficulty: 'Dễ',
    type: 'css',
    kind: 'lesson',
    description: 'HTML chỉ xây khung nhà, CSS mới là người sơn tường! Bắt đầu tô màu thôi.',
    instructions: 'Chuyển qua tab CSS. Biến màu chữ của tất cả các thẻ h1 thành màu đỏ (red).',
    hint: 'Chuyển sang tab CSS và gõ: h1 { color: red; }',
    solution: '<style>\n  h1 {\n    color: red;\n  }\n</style>\n<h1>Thế giới sắc màu</h1>',
    solutionExplanation: 'Selector `h1` sẽ nhắm mục tiêu vào tất cả thẻ <h1> trên trang. `color` là thuộc tính chỉnh màu chữ.',
    defaultCode: '<h1>Thế giới sắc màu</h1>\n<style>\n  /* Viết CSS trong tab CSS */\n</style>',
    xpReward: 120,
    validationSnippet: "const h1 = document.querySelector('h1'); return h1 && window.getComputedStyle(h1).color === 'rgb(255, 0, 0)';",
  },
  {
    id: 'css_2',
    title: 'Bài 2: Đổi phông nền rực rỡ',
    difficulty: 'Dễ',
    type: 'css',
    kind: 'lesson',
    description: 'Bây giờ chúng ta cần một màu nền ấn tượng cho bức tường của chúng ta.',
    instructions: 'Trong tab CSS, nhắm mục tiêu vào body và đổi màu nền (background-color) thành màu xanh kim loại (teal).',
    hint: 'Trong tab CSS gõ `body { background-color: teal; }`.',
    solution: '<style>\n  body {\n    background-color: teal;\n  }\n</style>\n<h2>CSS rất mạnh mẽ!</h2>',
    solutionExplanation: 'Màu nền của `body` lan toả ra toàn bộ trang web.',
    defaultCode: '<h2>CSS rất mạnh mẽ!</h2>\n<style>\n  /* Chuyển qua tab CSS */\n</style>',
    xpReward: 150,
    validationSnippet: "return window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 128, 128)' || window.getComputedStyle(document.body).backgroundColor === 'teal';",
  },
  {
    id: 'css_3',
    title: 'Bài 3: Trọng lượng của ngôn từ',
    difficulty: 'Trung bình',
    type: 'css',
    kind: 'lesson',
    description: 'Nhấn mạnh một điểm bằng Typography! Chỉnh kích thước to hơn và làm nó dày dặn hơn.',
    instructions: 'Chuyển sáng tab CSS, tìm ".magic-word". Đặt font-size là 40px và font-weight là bold.',
    hint: 'Chuyển sang tab CSS, cú pháp class: `.magic-word { font-size: 40px; font-weight: bold; }`.',
    solution: '<style>\n  .magic-word {\n    font-size: 40px;\n    font-weight: bold;\n  }\n</style>\n<p>CSS là một phép thuật <span class="magic-word">THỰC SỰ</span></p>',
    solutionExplanation: 'Class selector (.) vô cùng quan trọng, nhắm đến thẻ cụ thể mà không làm bể layout các thẻ khác.',
    defaultCode: '<p>CSS là một phép thuật <span class="magic-word">THỰC SỰ</span></p>\n<style>\n  /* Thêm CSS cho class .magic-word ở tab CSS */\n</style>',
    xpReward: 180,
    validationSnippet: "const sp = document.querySelector('.magic-word'); return sp && window.getComputedStyle(sp).fontSize === '40px' && (window.getComputedStyle(sp).fontWeight === '700' || window.getComputedStyle(sp).fontWeight === 'bold');",
  },
  {
    id: 'css_4',
    title: 'Bài 4: Đường cong hoàn mỹ',
    difficulty: 'Trung bình',
    type: 'css',
    kind: 'lesson',
    description: 'Một cái hộp vuông vức thì quá bình thường. Chúng ta cần những đường cong mềm mại!',
    instructions: 'Trong tab CSS cho .box, thêm viền đỏ 3px (3px solid red). Sau đó bo góc bằng border-radius: 12px.',
    hint: 'Tab CSS: .box { border: 3px solid red; border-radius: 12px; }',
    solution: '<style>\n  .box {\n    width: 100px; height: 100px;\n    border: 3px solid red;\n    border-radius: 12px;\n  }\n</style>\n<div class="box"></div>',
    solutionExplanation: '`border` và `border-radius` biến đổi toàn bộ hình dạng phần tử.',
    defaultCode: '<div class="box">Bo viền nhé</div>\n<style>\n  .box {\n    width: 100px; height: 100px;\n    /* Viết thêm CSS ở tab CSS */\n  }\n</style>',
    xpReward: 200,
    validationSnippet: "const box = document.querySelector('.box'); return box && window.getComputedStyle(box).borderWidth === '3px' && window.getComputedStyle(box).borderRadius === '12px';",
  },
  {
    id: 'css_5',
    title: 'Bài 5: Hít thở không gian',
    difficulty: 'Khó',
    type: 'css',
    kind: 'lesson',
    description: 'Padding (đệm trong) và Margin (đẩy ngoài) - Bí quyết giữ khoảng cách lịch sự trên Website.',
    instructions: 'Trong tab CSS, tạo padding 15px và margin 20px cho phần tử button.',
    hint: 'Tab CSS: button { padding: 15px; margin: 20px; }',
    solution: '<style>\n  button {\n    padding: 15px;\n    margin: 20px;\n    background: navy;\n    color: white;\n  }\n</style>\n<button>Nút béo mượt</button>',
    solutionExplanation: 'Padding đẩy từ viền vào lõi. Margin đẩy từ viền ra các phần tử xung quanh.',
    defaultCode: '<button>Nút béo mượt</button>\n<style>\n  button {\n    background: navy;\n    color: white;\n  }\n  /* Thêm padding và margin ở tab CSS */\n</style>',
    xpReward: 250,
    validationSnippet: "const btn = document.querySelector('button'); return btn && window.getComputedStyle(btn).padding === '15px' && window.getComputedStyle(btn).margin === '20px';",
  },
  {
    id: 'css_6',
    title: 'Bài 6: Sức mạnh Flexbox',
    difficulty: 'Khó',
    type: 'css',
    kind: 'lesson',
    description: 'Chiêu thức mạnh nhất của pháp sư CSS! Căn giữa một vật thể chưa bao giờ dễ dàng như vậy.',
    instructions: 'Trong tab CSS cho .container, thêm display: flex; căn ngang bằng justify-content: center; dọc: align-items: center;',
    hint: 'Tab CSS: .container { display: flex; justify-content: center; align-items: center; }',
    solution: '<style>\n  .container {\n    height: 100px;\n    background: #e2e8f0;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n  }\n</style>\n<div class="container">\n  <div>Lõi năng lượng</div>\n</div>',
    solutionExplanation: 'Flexbox đơn giản hoá ma trận layout cổ lỗ của website xưa.',
    defaultCode: '<div class="container">\n  <div>Lõi năng lượng</div>\n</div>\n<style>\n  .container {\n    height: 100px;\n    background: #e2e8f0;\n  }\n  /* Flexbox ở tab CSS */\n</style>',
    xpReward: 300,
    validationSnippet: "const box = document.querySelector('.container'); return box && window.getComputedStyle(box).display === 'flex' && window.getComputedStyle(box).justifyContent === 'center' && window.getComputedStyle(box).alignItems === 'center';",
  },

  // ==============================
  // JAVASCRIPT LESSONS
  // ==============================
  {
    id: 'js_1',
    title: 'Bài 1: Đầu bếp JavaScript',
    difficulty: 'Dễ',
    type: 'js',
    kind: 'lesson',
    description: 'JavaScript là người đầu bếp ra lệnh cho trình duyệt. Làm trình duyệt phát lên một hộp báo động cực bự.',
    instructions: 'Chuyển qua tab JS. Viết lệnh alert("Lập trình JS cực đỉnh!");',
    hint: 'Tab JS gõ: alert("...");',
    solution: '<script>\n  alert("Lập trình JS cực đỉnh!");\n</script>',
    solutionExplanation: 'Hàm `alert` là cách đơn giản nhất để test code, nó bật popup lên trình duyệt của người dùng.',
    defaultCode: '<script>\n  /* Chuyển qua tab JS */\n</script>',
    xpReward: 150,
    validationSnippet: "return document.querySelector('script') !== null && document.querySelector('script').textContent.includes('alert');",
  },
  {
    id: 'js_2',
    title: 'Bài 2: Nhật ký bí mật Console',
    difficulty: 'Dễ',
    type: 'js',
    kind: 'lesson',
    description: 'Alert thì phiền toái. Developers ngầu lòi thường ghi chép bí mật ở một màn hình gọi là Console.',
    instructions: 'Tab JS, hãy sử dụng lệnh console.log("Hành trình của tôi bắt đầu");',
    hint: 'Tab JS: console.log("...");',
    solution: '<script>\n  console.log("Hành trình của tôi bắt đầu");\n</script>',
    solutionExplanation: 'console.log() in thông điệp ra giao diện Development Tools của trình duyệt.',
    defaultCode: '<script>\n  // Dùng console.log ở tab JS nhé\n</script>',
    xpReward: 160,
    validationSnippet: "return document.querySelector('script') !== null && document.querySelector('script').textContent.includes('console.log');",
  },
  {
    id: 'js_3',
    title: 'Bài 3: Biến số vạn năng',
    difficulty: 'Trung bình',
    type: 'js',
    kind: 'lesson',
    description: 'JS lưu trữ thông tin trong các chiếc hộp gọi là Biến (Variable).',
    instructions: 'Tab JS: Tạo biến let có tên diemSo là 100. Sau đó chạy console.log(diemSo).',
    hint: 'Tab JS: let diemSo = 100; console.log(diemSo);',
    solution: '<script>\n  let diemSo = 100;\n  console.log(diemSo);\n</script>',
    solutionExplanation: 'Từ khoá `let` tạo 1 vùng nhớ để lưu dữ liệu có thể thay đổi sau này.',
    defaultCode: '<script>\n  // Tạo biến let ở tab JS\n</script>',
    xpReward: 200,
    validationSnippet: "const code = document.querySelector('script')?.textContent || ''; return code.includes('let diemSo') && code.includes('100');",
  },
  {
    id: 'js_4',
    title: 'Bài 4: Bàn tay ma thuật đổi mầu DOM',
    difficulty: 'Trung bình',
    type: 'js',
    kind: 'lesson',
    description: 'Sức mạnh lớn nhất của JS là thao túng HTML! Chúng ta có thể thay đổi thuộc tính của phần tử ngay lúc chạy.',
    instructions: 'Bên tab JS lấy nút bằng document.getElementById("btn") và đổi style.color thành "blue".',
    hint: 'Tab JS: document.getElementById("btn").style.color = "blue";',
    solution: '<button id="btn">Đổi tôi đi</button>\n<script>\n  document.getElementById("btn").style.color = "blue";\n</script>',
    solutionExplanation: 'Khi dùng JavaScript, thuộc tính CSS được chuyển thành đối tượng `style`.',
    defaultCode: '<button id="btn">Đổi tôi đi</button>\n<script>\n  // Đổi style bên tab JS\n</script>',
    xpReward: 250,
    validationSnippet: "const btn = document.getElementById('btn'); return btn && btn.style.color === 'blue';",
  },
  {
    id: 'js_5',
    title: 'Bài 5: Lắng nghe âm thanh sự kiện',
    difficulty: 'Khó',
    type: 'js',
    kind: 'lesson',
    description: 'Click, hover, type... mọi thứ người dùng làm là "sự kiện". JS có thể nghe lén mọi sự kiện đó.',
    instructions: 'Gắn thêm thuộc tính onclick="alert(\'Bùm!\')" vào biểu tượng HTML bên tab HTML.',
    hint: 'Tác động trực tiếp thẻ button ở Tab HTML: <button onclick="...">',
    solution: '<button onclick="alert(\'Bùm!\')">Nhấn nút phát nổ</button>',
    solutionExplanation: 'onclick kết nối thao tác bấm chuột của thực tế bằng hành động JS tức thời.',
    defaultCode: '<button>Nhấn nút phát nổ</button>',
    xpReward: 300,
    validationSnippet: "const btn = document.querySelector('button'); return btn && btn.hasAttribute('onclick');",
  },
  {
    id: 'js_6',
    title: 'Bài 6: Vòng lặp thời gian',
    difficulty: 'Khó',
    type: 'js',
    kind: 'lesson',
    description: 'Lập trình sinh ra để làm những việc máy móc nhàm chán lặp đi lặp lại. Giới thiệu vòng lặp for!',
    instructions: 'Sử dụng tab JS, viết vòng lặp for từ let i = 0; i < 5; i++. Gọi console.log(i).',
    hint: 'Tab JS: for (let i = 0; i < 5; i++) { ... }',
    solution: '<script>\n  for (let i = 0; i < 5; i++) {\n    console.log(i);\n  }\n</script>',
    solutionExplanation: 'Máy tính sẽ chạy liên tục 5 lần với tốc độ ánh sáng thay vì bạn phải tự tay copy mã 5 lần.',
    defaultCode: '<script>\n  // Viết code for lặp ở tab JS\n</script>',
    xpReward: 400,
    validationSnippet: "const code = document.querySelector('script')?.textContent || ''; return code.includes('for') && code.includes('console.log') && code.includes('i++');",
  },

  ...generateDetailedLessons('html', 100),
  ...generateDetailedLessons('css', 100),
  ...generateDetailedLessons('js', 100),
];

export const getNextChallenge = (completedIds: string[], kind: 'lesson' | 'challenge' = 'lesson') => {
  return CHALLENGES.find(c => c.kind === kind && !completedIds.includes(c.id));
};
