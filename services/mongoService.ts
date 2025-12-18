
import { SentimentAnalysisResult, UserDocument, UserRole } from '../types';

/**
 * Apex AI - MongoDB Integration Service
 * Updated to handle 'contact' (email or phone) as the primary identifier.
 */

const STORAGE_KEYS = {
  FEEDBACK: 'apex_db_feedback',
  USERS: 'apex_db_users'
};

const getCollection = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveCollection = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mongoService = {
  /**
   * Feedback Collection Operations
   */
  feedback: {
    find: async (query: any = {}): Promise<SentimentAnalysisResult[]> => {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 400));
      const all = getCollection<SentimentAnalysisResult>(STORAGE_KEYS.FEEDBACK);
      
      return all.filter(item => {
        if (query.userId && item.userId !== query.userId) return false;
        if (query.sentiment && item.sentiment !== query.sentiment) return false;
        return true;
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    insertOne: async (doc: Omit<SentimentAnalysisResult, '_id'>): Promise<SentimentAnalysisResult> => {
      const all = getCollection<SentimentAnalysisResult>(STORAGE_KEYS.FEEDBACK);
      const newDoc = { ...doc, _id: `fdb_${Math.random().toString(36).substr(2, 9)}` };
      saveCollection(STORAGE_KEYS.FEEDBACK, [newDoc, ...all]);
      return newDoc;
    },

    insertMany: async (docs: Omit<SentimentAnalysisResult, '_id'>[]): Promise<SentimentAnalysisResult[]> => {
      const all = getCollection<SentimentAnalysisResult>(STORAGE_KEYS.FEEDBACK);
      const newDocs = docs.map(d => ({ ...d, _id: `fdb_${Math.random().toString(36).substr(2, 9)}` }));
      saveCollection(STORAGE_KEYS.FEEDBACK, [...newDocs, ...all]);
      return newDocs;
    },

    deleteMany: async (query: any = {}): Promise<void> => {
      if (Object.keys(query).length === 0) {
        saveCollection(STORAGE_KEYS.FEEDBACK, []);
      }
    }
  },

  /**
   * Users Collection Operations
   */
  users: {
    findOne: async (query: { contact: string }): Promise<UserDocument | null> => {
      const all = getCollection<UserDocument>(STORAGE_KEYS.USERS);
      return all.find(u => u.contact === query.contact) || null;
    },

    insertOne: async (user: Omit<UserDocument, '_id' | 'createdAt'>): Promise<UserDocument> => {
      const all = getCollection<UserDocument>(STORAGE_KEYS.USERS);
      const newUser: UserDocument = {
        ...user,
        _id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      saveCollection(STORAGE_KEYS.USERS, [...all, newUser]);
      return newUser;
    }
  }
};
