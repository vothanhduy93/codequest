import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/tutor', async (req, res) => {
    try {
      const { code, htmlCode, cssCode, jsCode, challengeTitle, challengeInstructions } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY' });
      }

      let codeToReview = code;
      if (typeof htmlCode !== 'undefined') {
        codeToReview = `=== Tab HTML ===\n${htmlCode}\n`;
        codeToReview += `=== Tab CSS ===\n${cssCode}\n`;
        codeToReview += `=== Tab JS ===\n${jsCode}\n`;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Em là một học sinh đang làm bài tập lập trình cơ bản có tên: "${challengeTitle}".
Nhiệm vụ của bài tập: "${challengeInstructions}"
Mã nguồn em viết trong giao diện gồm nhiều tab riêng biệt như sau:
\`\`\`
${codeToReview}
\`\`\`
Nhưng đoạn mã này đang bị lỗi hoặc làm sai nhiệm vụ. Hãy đóng vai một Gia sư AI vui vẻ, kiên nhẫn và giải thích 1-1 bằng ngôn ngữ tiếng Việt cực kì dễ hiểu (ngắn gọn, ví dụ: "Em quên đóng thẻ <h1> rồi kìa!" hoặc "Chỗ này dư một khoảng trắng nhé"). Nhắm đúng vào lỗi, không cần cung cấp toàn bộ đáp án trừ khi cực kỳ cần thiết. Hãy trả về format bằng Markdown, ngắn gọn trong 1-3 câu.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ explanation: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'Gia sư đang bận nghỉ phép, hãy thử lại.' });
    }
  });

  app.post('/api/generate-challenge', async (req, res) => {
    try {
      const { topic, weakness } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let context = 'hãy tạo một bài tập ngẫu nhiên về lập trình web cơ bản cho người mới bắt đầu học.';
      if (topic) {
        context = `chủ đề về: ${topic}.`;
      } else if (weakness) {
        context = `lưu ý người dùng đang bị yếu mảng: "${weakness}", hãy tập trung xoáy sâu vào lỗi này để luyện tập.`;
      }
      
      const prompt = `Em là một chuyên gia thiết kế bài kiểm tra lập trình web (HTML/CSS/JS). Dựa trên yêu cầu sau: ${context}
Hãy sinh ra một đề bài lập trình (tối đa độ khó cơ bản/trung bình), trả về dưới dạng JSON gồm:
- "title": Tên bài tập (ngắn gọn)
- "instructions": Yêu cầu của bài tập (mô tả yêu cầu cụ thể, vui vẻ)
- "type": "html" (chỉ html/css), "css", hoặc "js" (phù hợp với mảng cần kiểm tra)
- "defaultCode": Khung code cho trước (gồm HTML, thẻ <style>, thẻ <script>, ví dụ: "<div id='box'></div>\\n<style>\\n#box { ... }\\n</style>"). Nếu chỉ test css, nhớ tạo sẵn element html.
- "validationSnippet": Đoạn mã JavaScript độc lập để kiểm tra (return true nếu pass, return false/throw error nếu rớt). Snippet này chạy trong môi trường có DOM (document) của iframe. Viết thành hàm hoặc chỉ cần các lệnh như: "if (!document.getElementById('box')) return false; if (window.getComputedStyle(document.getElementById('box')).borderRadius !== '50%') return false; return true;". Hãy cẩn thận và linh hoạt.
- "xpReward": Số điểm KN nhận được (từ 10 đến 50)
Return JSON schema only, no markup in output (we will parse JSON).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              instructions: { type: 'STRING' },
              type: { type: 'STRING' },
              defaultCode: { type: 'STRING' },
              validationSnippet: { type: 'STRING' },
              xpReward: { type: 'INTEGER' }
            },
            required: ['title', 'instructions', 'type', 'defaultCode', 'validationSnippet', 'xpReward']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'Lỗi sinh đề bài từ AI.' });
    }
  });

  app.post('/api/review-code', async (req, res) => {
    try {
      const { code, challengeTitle } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Em là hệ thống Đánh giá Chất lượng Mã nguồn (AI Code Reviewer / Clean Code Analyst).
Đây là bài tập: "${challengeTitle}".
Người dùng đã vượt qua bài test (chạy thành công). Đây là mã nguồn của họ:
\`\`\`
${code}
\`\`\`
Vui lòng đánh giá đoạn mã này theo tiêu chí:
1. Tính tối ưu (Performance)
2. Độ sạch sẽ (Clean Code / Best Practices)
3. Điểm đánh giá tính bằng sao (VD: 4/5)
4. Một đoạn mã gợi ý ngắn gọn (nếu có thể viết tốt hơn).

Trả về phản hồi bằng Tiếng Việt thân thiện, rõ ràng, trình bày dưới định dạng Markdown để hiển thị trên web. Không quá dài dòng.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ review: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: `Hệ thống đánh giá lỗi: ${err?.message || err}` });
    }
  });

  app.get('/api/leaderboard', (req, res) => {
    // Mock Leaderboard Data
    res.json([
      { id: '1', name: 'Nguyễn Văn A', xp: 4500, level: 9, avatar: 'NA' },
      { id: '2', name: 'Trần Thị B', xp: 3200, level: 6, avatar: 'TB' },
      { id: '3', name: 'Lê Hoàng C', xp: 2800, level: 5, avatar: 'LC' },
      { id: '4', name: 'Phạm D', xp: 1500, level: 3, avatar: 'PD' },
      { id: '5', name: 'Khách', xp: 120, level: 1, avatar: 'K' },
    ]);
  });

  app.get('/api/community', (req, res) => {
    // Mock Community Posts
    res.json([
      { id: '1', author: 'Lê Hoàng C', title: 'Làm sao căn giữa một div?', content: 'Tôi đã thử thuộc tính margin nhưng chưa được.', likes: 12, replies: 3 },
      { id: '2', author: 'Trần Thị B', title: 'Flexbox vs Grid, chọn gì bây giờ?', content: 'Mọi người tư vấn giúp mình trong trường hợp nào dùng cái nào.', likes: 25, replies: 8 },
      { id: '3', author: 'Nguyễn Văn A', title: 'Chia sẻ tut JS cơ bản', content: 'Mình vừa viết một guide nhỏ về Promise.', likes: 45, replies: 10 },
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
