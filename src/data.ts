import { Challenge, Badge } from './types';
import { extraHtml, extraCss, extraJs } from './lessonsData';

const baseThresholds = [0, 500, 1200, 2500, 4500, 7000, 10000];
export const LEVEL_THRESHOLDS = Array.from({ length: 100 }, (_, i) => {
  if (i < baseThresholds.length) return baseThresholds[i];
  let xp = 10000;
  for (let j = 7; j <= i; j++) {
    xp += 3000 + (j - 6) * 500;
  }
  return xp;
});

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
  },
  streak_7: {
    id: 'streak_7',
    name: 'Ngọn lửa Đam mê',
    icon: 'Flame',
    description: 'Chuỗi 7 ngày học tập liên tiếp',
  },
  streak_30: {
    id: 'streak_30',
    name: 'Tháng nỗ lực',
    icon: 'Star',
    description: 'Chuỗi 30 ngày học tập liên tiếp',
  },
  streak_100: {
    id: 'streak_100',
    name: 'Huyền thoại',
    icon: 'Crown',
    description: 'Chuỗi 100 ngày học tập liên tiếp',
  }
};

export const CHALLENGES: Challenge[] = [];

export const getNextChallenge = (completedIds: string[], kind: 'lesson' | 'challenge' = 'lesson') => {
  return CHALLENGES.find(c => c.kind === kind && !completedIds.includes(c.id));
};
