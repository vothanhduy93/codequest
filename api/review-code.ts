import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60; // Vercel function timeout

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { code, challengeTitle } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ' });
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

    res.status(200).json({ review: response.text });
  } catch (err: any) {
    console.error(err);
    const msg = err?.message || String(err);
    const isQuota = msg.includes('429') || msg.includes('Quota exceeded');
    res.status(500).json({ error: isQuota ? 'Vượt quá giới hạn gọi AI (Quota exceeded). Vui lòng đợi một lát rồi thử lại nhé!' : `Hệ thống đánh giá lỗi: ${msg}` });
  }
}
