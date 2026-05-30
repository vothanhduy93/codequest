import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60; // Vercel function timeout

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { code, htmlCode, cssCode, jsCode, challengeTitle, challengeInstructions } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ' });
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

    res.status(200).json({ explanation: response.text });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: `Gia sư đang lỗi: ${err?.message || err}` });
  }
}
