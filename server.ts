import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/translate', async (req, res) => {
    try {
      const { title, description, instructions, hint } = req.body;
      if (!title && !description) return res.status(400).json({ error: 'Missing content' });
      
      const translateText = async (text: string) => {
        if (!text) return text;
        
        // Split text if it's too long, but usually these are short enough for GET request
        // Using POST is better for larger texts
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(text);
        const r = await fetch(url);
        if (!r.ok) throw new Error('Translation failed');
        const data = await r.json();
        return data[0].map((s: any) => s[0]).join('');
      };

      const translatePost = async (text: string) => {
        if (!text) return text;
        
        const placeholders: string[] = [];
        let counter = 0;
        
        const protect = (match: string) => {
          const placeholder = `__${counter}__`;
          placeholders.push(match);
          counter++;
          return placeholder;
        };
        
        let protectedText = text;
        
        // Protect backticks (e.g. `head` or `body`)
        // Using [^`]* to match anything inside backticks
        protectedText = protectedText.replace(/`[^`]*`/g, protect);
        
        // Protect HTML tags (e.g. <body>, <h1>)
        protectedText = protectedText.replace(/<[^>]+>/g, protect);
        
        // Protect specific technical keywords
        const keywords = ['HTML', 'CSS', 'JS', 'JavaScript', 'Flexbox', 'Grid', 'DOM', 'tag', 'element', 'attribute', 'property', 'value', 'selector', 'class', 'id', 'margin', 'padding'];
        const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
        protectedText = protectedText.replace(keywordRegex, protect);

        const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ q: protectedText }).toString()
        });
        
        if (!r.ok) throw new Error('Translation failed');
        const data = await r.json();
        if (!data || !data[0]) return text;
        
        let translatedText = data[0].map((s: any) => s[0]).join('');
        
        // Restore placeholders
        for (let i = 0; i < placeholders.length; i++) {
          const restoreRegex = new RegExp(`__\\s*${i}\\s*__`, 'g');
          translatedText = translatedText.replace(restoreRegex, placeholders[i]);
        }
        
        return translatedText;
      };

      const translatedTitle = await translatePost(title);
      const translatedDesc = await translatePost(description);
      const translatedInst = await translatePost(instructions);
      const translatedHint = await translatePost(hint);

      res.json({
        title: translatedTitle,
        description: translatedDesc,
        instructions: translatedInst,
        hint: translatedHint
      });
    } catch (e: any) {
      console.error('Translation error:', e);
      res.status(500).json({ error: e.message || 'Lỗi server khi dịch' });
    }
  });

  app.get('/api/leaderboard', (req, res) => {
    res.json([
      { id: '1', name: 'Nguyễn Văn A', xp: 4500, level: 9, avatar: 'NA' },
      { id: '2', name: 'Trần Thị B', xp: 3200, level: 6, avatar: 'TB' },
      { id: '3', name: 'Lê Hoàng C', xp: 2800, level: 5, avatar: 'LC' },
      { id: '4', name: 'Phạm D', xp: 1500, level: 3, avatar: 'PD' },
      { id: '5', name: 'Khách', xp: 120, level: 1, avatar: 'K' },
    ]);
  });

  app.get('/api/community', (req, res) => {
    res.json([
      { id: '1', author: 'Lê Hoàng C', title: 'Làm sao căn giữa một div?', content: 'Tôi đã thử thuộc tính margin nhưng chưa được.', likes: 12, replies: 3 },
      { id: '2', author: 'Trần Thị B', title: 'Flexbox vs Grid, chọn gì bây giờ?', content: 'Mọi người tư vấn giúp mình trong trường hợp nào dùng cái nào.', likes: 25, replies: 8 },
      { id: '3', author: 'Nguyễn Văn A', title: 'Chia sẻ tut JS cơ bản', content: 'Mình vừa viết một guide nhỏ về Promise.', likes: 45, replies: 10 },
    ]);
  });

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
