
export enum SentimentLabel {
  POSITIVE = 'Positive',
  NEGATIVE = 'Negative',
  NEUTRAL = 'Neutral'
}

export type FeedbackSource = 'text' | 'image' | 'video' | 'url' | 'reel';

export type UserRole = 'admin' | 'customer' | 'none';

export interface UserDocument {
  _id: string;
  contact: string; // Changed from email to contact
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface UserSession {
  role: UserRole;
  name: string;
  contact: string; // Changed from email to contact
  userId: string;
}

export interface SentimentAnalysisResult {
  _id: string;
  userId?: string;
  originalText: string;
  sourceType: FeedbackSource;
  sourcePreview?: string;
  sentiment: SentimentLabel;
  score: number;
  keywords: string[];
  summary: string;
  actionableInsight: string;
  timestamp: string;
  language: string; // Added to support regional language tracking
}

export interface DashboardStats {
  totalFeedbacks: number;
  averageScore: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}
