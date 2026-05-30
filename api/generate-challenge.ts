import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60; // Vercel function timeout

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { topic, weakness } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ' });
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
    res.status(200).json(data);
  } catch (err: any) {
    console.error(err);
    const msg = err?.message || String(err);
    const isQuota = msg.includes('429') || msg.includes('Quota exceeded');
    res.status(500).json({ error: isQuota ? 'Vượt quá giới hạn gọi AI (Quota exceeded). Vui lòng đợi một lát rồi thử lại nhé!' : `Lỗi sinh đề bài từ AI: ${msg}` });
  }
}
