import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/generate-challenge', (req, res) => {
    const randomId = Math.floor(Math.random() * 99999);
    const px = Math.floor(Math.random() * 50) + 10;
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const pColor = colors[Math.floor(Math.random() * colors.length)];
    
    res.json({
      title: 'Thử thách Vô Hạn #' + randomId,
      instructions: 'Sử dụng CSS, tạo class ".box-inf-' + randomId + '" có margin: ' + px + 'px và background-color: ' + pColor + '.',
      type: 'css',
      defaultCode: '<div class="box-inf-' + randomId + '"></div>\n<style>\n\n</style>',
      validationSnippet: 'const el = document.querySelector(".box-inf-' + randomId + '"); if (!el) return false; const style = window.getComputedStyle(el); return style.margin === "' + px + 'px";',
      xpReward: 20
    });
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
