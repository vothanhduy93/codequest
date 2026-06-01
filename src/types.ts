export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: 'html' | 'css' | 'javascript';
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  photoURL?: string;
  xp: number;
  level: number;
  badges: Badge[];
  completedChallenges: string[];
  streak?: number;
  streakFreezes?: number;
  coins?: number;
  lastActiveDate?: string;
  lastLoginDate?: string;
  questProgress?: {
    challengesCompleted: number;
    xpGained: number;
    date: string;
    claimed: string[];
  };
  snippets?: Snippet[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  type: 'html' | 'css' | 'js';
  kind: 'lesson' | 'challenge';
  description: string;
  instructions: string;
  hint: string;
  solution?: string;
  defaultCode: string;
  xpReward: number;
  validationSnippet: string; // JavaScript code to validate the iframe content
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  level: number;
  avatar: string;
}

export interface Post {
  id: string;
  author: string;
  authorId?: string;
  title: string;
  content: string;
  likes: number;
  replies: number;
  createdAt?: any;
}
