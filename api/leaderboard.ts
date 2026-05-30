export default function handler(req: any, res: any) {
  // Mock Leaderboard Data
  res.status(200).json([
    { id: '1', name: 'Nguyễn Văn A', xp: 4500, level: 9, avatar: 'NA' },
    { id: '2', name: 'Trần Thị B', xp: 3200, level: 6, avatar: 'TB' },
    { id: '3', name: 'Lê Hoàng C', xp: 2800, level: 5, avatar: 'LC' },
    { id: '4', name: 'Phạm D', xp: 1500, level: 3, avatar: 'PD' },
    { id: '5', name: 'Khách', xp: 120, level: 1, avatar: 'K' },
  ]);
}
