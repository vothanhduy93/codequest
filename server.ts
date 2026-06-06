import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

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

  app.post('/api/solve-challenge', async (req, res) => {
    try {
      const { id, title, description, instructions, defaultCode } = req.body;
      if (!id || !title) return res.status(400).json({ error: 'Missing challenge info' });
      
      const prompt = `You are a coding instructor. I will provide you with a programming challenge, including its instructions and default starting code.
Your task is to provide the FINAL CORRECT CODE that solves the challenge.

Challenge Title: ${title}
Instructions: ${instructions}
Description: ${description}
Default Code:
\`\`\`
${defaultCode}
\`\`\`

Return ONLY the raw solved code, without any markdown formatting or explanations. Do not include \`\`\`html or \`\`\`. Just the raw code.`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      let solution = response.text || '';
      solution = solution.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '').trim();

      // Save it back to the database for future use!
      await updateDoc(doc(db, 'challenges', id), { solution });

      res.json({ solution });
    } catch (e: any) {
      console.error('Solve error:', e);
      res.status(500).json({ error: e.message || 'Error generating solution' });
    }
  });

  app.post('/api/trigger-fill-missing', async (req, res) => {
    res.json({ message: 'Background filling job started.' });

    (async () => {
      try {
        console.log('[API] Starting to fill missing solutions...');
        const querySnapshot = await getDocs(collection(db, 'challenges'));
        const missing: any[] = [];
        querySnapshot.forEach(d => {
            const data = d.data();
            if (!data.solution || data.solution.trim() === '') {
                missing.push({ id: d.id, ...data });
            }
        });
        console.log(`[API] Found ${missing.length} missing solutions.`);

        let processed = 0;
        for (const item of missing) {
            try {
               const prompt = `You are a coding instructor. I will provide you with a programming challenge, including its instructions and default starting code.
Your task is to provide the FINAL CORRECT CODE that solves the challenge.

Challenge Title: ${item.title}
Instructions: ${item.instructions}
Description: ${item.description}
Default Code:
\`\`\`
${item.defaultCode}
\`\`\`

Return ONLY the raw solved HTML/CSS/JS code, without any markdown formatting or explanations. Do not include \`\`\`html or \`\`\`. Just the raw code.`;

               const response = await ai.models.generateContent({
                   model: 'gemini-2.5-flash',
                   contents: prompt,
               });

               let solution = response.text || '';
               solution = solution.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '').trim();

               await updateDoc(doc(db, 'challenges', item.id), { solution });
               processed++;
               console.log(`[API] [${processed}/${missing.length}] Updated ${item.id} - ${item.title}`);
            } catch (err: any) {
               console.error(`[API] Failed to process ${item.id}:`, err?.message || err);
               if (err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429) {
                   missing.push(item); // Retry later
                   await new Promise(r => setTimeout(r, 65000));
               } else if (err?.status === 503 || err?.message?.includes("demand")) {
                   missing.push(item);
                   await new Promise(r => setTimeout(r, 15000));
               }
            }
            // wait 5 seconds between requests
            await new Promise(r => setTimeout(r, 5000));
        }
        console.log('[API] Background filling job finished.');
      } catch (err: any) {
        console.error('[API] Fatal error:', err);
      }
    })();
  });

  app.post('/api/trigger-audit', async (req, res) => {
    res.json({ message: 'Background audit job started.' });

    (async () => {
      try {
        console.log('[API] Starting background audit job...');
        const querySnapshot = await getDocs(collection(db, 'challenges'));
        const toAudit: any[] = [];
        querySnapshot.forEach(d => {
            const data = d.data();
            if (data.solution && (!data.auditStatus || data.auditStatus === 'PENDING')) {
                toAudit.push({ id: d.id, ...data });
            }
        });
        console.log(`[API] Found ${toAudit.length} solutions to audit.`);

        let processed = 0;
        let pIndex = 0;
        while (pIndex < toAudit.length) {
            const item = toAudit[pIndex];
            let attempt = 0;
            let success = false;
            while (attempt < 3 && !success) {
                try {
                   const prompt = `You are an expert coding auditor. I will provide you with a programming challenge and its proposed solution.
Your task is to determine if the solution accurately and effectively fulfills all the challenge instructions.

Challenge Title: ${item.title}
Instructions: ${item.instructions}
Description: ${item.description}
Default Code:
\`\`\`
${item.defaultCode}
\`\`\`

Proposed Solution:
\`\`\`
${item.solution}
\`\`\`

Evaluate the solution. Check if there are any syntax errors, if it produces the expected outcome, and if it adheres to all instructions.`;

                   const response = await ai.models.generateContent({
                       model: 'gemini-flash-latest',
                       contents: prompt,
                       config: {
                           responseMimeType: 'application/json',
                           responseSchema: {
                               type: "OBJECT",
                               properties: {
                                   status: {
                                       type: "STRING",
                                       description: "Either 'PASS' if the solution is completely correct, or 'FAIL' if it is incorrect or missing requirements.",
                                       enum: ["PASS", "FAIL"]
                                   },
                                   feedback: {
                                       type: "STRING",
                                       description: "A short review explaining why it passed or failed. If it failed, point out exactly what is wrong."
                                   }
                               },
                               required: ["status", "feedback"]
                           }
                       }
                   });

                   const auditResult = JSON.parse(response.text || '{}');
                   
                   await updateDoc(doc(db, 'challenges', item.id), { 
                       auditStatus: auditResult.status || 'ERROR',
                       auditFeedback: auditResult.feedback || 'Failed to parse audit result.'
                   });

                   processed++;
                   console.log(`[API] [${processed}/${toAudit.length}] Audited ${item.id} - ${item.title} -> ${auditResult.status}`);
                   success = true;
                } catch (err: any) {
                   console.error(`[API] Failed to audit ${item.id}:`, err?.message || err);
                   if (err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429) {
                       await new Promise(r => setTimeout(r, 65000));
                   } else if (err?.status === 503 || err?.message?.includes("demand")) {
                       await new Promise(r => setTimeout(r, 15000));
                   }
                   attempt++;
                }
            }
            if (!success) {
                // If completely failed, move it to end of queue to try later
                toAudit.push(item);
            }
            pIndex++;
            // wait 4.5 seconds between requests (limit 15 RPM for Free Tier)
            await new Promise(r => setTimeout(r, 4500));
        }
        console.log('[API] Background audit job finished.');
      } catch (err: any) {
        console.error('[API] Fatal error in background audit:', err);
      }
    })();
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

  app.get('/api/fcc-sync', async (req, res) => {
    try {
      const folders = [
        { url: 'https://github.com/freeCodeCamp/freeCodeCamp/tree/main/curriculum/challenges/english/blocks/basic-html-and-html5', type: 'html' },
        { url: 'https://github.com/freeCodeCamp/freeCodeCamp/tree/main/curriculum/challenges/english/blocks/basic-css', type: 'css' },
        { url: 'https://github.com/freeCodeCamp/freeCodeCamp/tree/main/curriculum/challenges/english/blocks/css-flexbox', type: 'css' },
        { url: 'https://github.com/freeCodeCamp/freeCodeCamp/tree/main/curriculum/challenges/english/blocks/css-grid', type: 'css' },
        { url: 'https://github.com/freeCodeCamp/freeCodeCamp/tree/main/curriculum/challenges/english/blocks/basic-javascript', type: 'js' },
        { url: 'https://github.com/freeCodeCamp/freeCodeCamp/tree/main/curriculum/challenges/english/blocks/es6', type: 'js' }
      ];

      const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
        try {
          const r = await fetch(url, { headers: { 'User-Agent': 'AI-Studio-Applet' } });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return await r.text();
        } catch (e) {
          if (retries > 0) return fetchWithRetry(url, retries - 1);
          throw e;
        }
      };

      const allFiles = [];
      for (const folder of folders) {
        try {
          const html = await fetchWithRetry(folder.url);
          const links = [...new Set([...html.matchAll(/href=\"([^\"]+\.md)\"/g)].map(m => m[1]))];
          const rawUrls = links.map(link => ({
            download_url: 'https://raw.githubusercontent.com' + link.replace('/blob/', '/'),
            type: folder.type
          }));
          allFiles.push(...rawUrls);
        } catch (error) {
          console.error(`Failed to fetch ${folder.url}`, error);
        }
      }

      if (allFiles.length === 0) {
        return res.status(500).json({ error: 'Failed to access Github API (rate limit?)' });
      }

      const challenges = [];
      let globalId = 1000;
      
      // Process in batches to avoid overwhelming the network
      const batchSize = 30;
      // Truncate to a reasonable amount if needed, or fetch all (up to 185)
      // Here let's just fetch all of them but in chunks
      for (let i = 0; i < allFiles.length; i += batchSize) {
        const batch = allFiles.slice(i, i + batchSize);
        const mdContents = await Promise.all(
          batch.map(async (f) => {
            try {
              const text = await fetch(f.download_url).then(r => r.text());
              return { text, type: f.type };
            } catch (e) {
              return null;
            }
          })
        );

        for (const item of mdContents) {
          if (!item) continue;
          const { text, type } = item;
          let title = "Tự động tải";
          let titleMatch = text.match(/title:\s+(.*)/);
          if (titleMatch) title = titleMatch[1].replace(/['"]/g, '');
          
          let desc = "Không có mô tả.";
          let descMatch = text.match(/# --description--\n\n([\s\S]*?)\n\n# --instructions--/);
          if (descMatch) desc = descMatch[1].replace(/```html/g, '').replace(/```css/g, '').replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '');
          
          let instructions = 'Hãy làm theo hướng dẫn hệ thống';
          let instructionsMatch = text.match(/# --instructions--\n\n([\s\S]*?)\n\n# --hints--/);
          if (instructionsMatch) instructions = instructionsMatch[1].replace(/```html/g, '').replace(/```css/g, '').replace(/```javascript/g, '').replace(/```js/g, '').replace(/```/g, '');

          let defaultCode = '<!-- Code ở đây -->\n';
          let defaultCodeMatch = text.match(/## --seed-contents--\n\n```[a-z]*\n([\s\S]*?)```/);
          if (defaultCodeMatch) defaultCode = defaultCodeMatch[1];
          else {
             let altSeedMatch = text.match(/# --seed--\n\n```[a-z]*\n([\s\S]*?)```/);
             if (altSeedMatch) defaultCode = altSeedMatch[1];
          }

          let solution = '...';
          let solutionMatch = text.match(/# --solutions--\n\n```[a-z]*\n([\s\S]*?)```/);
          if (solutionMatch) solution = solutionMatch[1];

          challenges.push({
            id: `fcc_${globalId++}`,
            title: `${title}`,
            difficulty: 'Trung bình',
            type: type,
            kind: 'lesson',
            description: desc,
            instructions: instructions,
            hint: 'Đọc kỹ yêu cầu',
            solution: solution,
            defaultCode: defaultCode,
            xpReward: 100,
            validationSnippet: 'return true;' // Auto pass for demo
          });
        }
      }
      
      res.json(challenges);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to sync with Github API' });
    }
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
