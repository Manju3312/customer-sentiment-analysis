
import { GoogleGenAI, Type } from "@google/genai";
import { SentimentAnalysisResult, SentimentLabel, FeedbackSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.STRING,
      description: "One of: Positive, Negative, Neutral",
    },
    score: {
      type: Type.NUMBER,
      description: "A confidence score from 0.0 to 1.0 (1.0 is very positive, 0.0 is very negative)",
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Key themes or product features mentioned",
    },
    summary: {
      type: Type.STRING,
      description: "A 10-word summary of the core message in English",
    },
    actionableInsight: {
      type: Type.STRING,
      description: "A concrete recommendation for the business in English",
    },
    language: {
      type: Type.STRING,
      description: "The detected language of the input (e.g., Hindi, Tamil, Spanish, English, etc.)",
    }
  },
  required: ["sentiment", "score", "keywords", "summary", "actionableInsight", "language"]
};

interface AnalysisInput {
  text?: string;
  file?: {
    data: string;
    mimeType: string;
  };
  sourceType: FeedbackSource;
}

export const analyzeSentiment = async (input: AnalysisInput): Promise<SentimentAnalysisResult> => {
  const parts: any[] = [];
  
  let promptPrefix = `Analyze this customer feedback. Gemini supports regional languages: identify the language used. 
  Extract sentiment, keywords, and provide an English summary/insight regardless of the input language.
  Input can be in Hindi, Tamil, Telugu, Spanish, French, or any other regional language. `;
  
  if (input.sourceType === 'url' || input.sourceType === 'reel') {
    const contextType = input.sourceType === 'reel' ? 'Instagram Reel' : 'URL';
    promptPrefix += `Visit this ${contextType} and analyze reviews, comments, and the content itself: ${input.text}. 
    For Reels, focus on audience sentiment in the comments and the tone of the creator.`;
  } else if (input.text) {
    parts.push({ text: input.text });
  }

  if (input.file) {
    parts.push({
      inlineData: {
        data: input.file.data,
        mimeType: input.file.mimeType,
      }
    });
    promptPrefix += ` Analyze the visual/audio content for sentiment and language cues.`;
  }

  parts.unshift({ text: promptPrefix });

  const config: any = {
    responseMimeType: "application/json",
    responseSchema: ANALYSIS_SCHEMA,
  };

  // For URLs and Reels, we use googleSearch grounding
  if (input.sourceType === 'url' || input.sourceType === 'reel') {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config,
  });

  const data = JSON.parse(response.text || "{}");
  
  let sentiment = SentimentLabel.NEUTRAL;
  const s = (data.sentiment || "").toLowerCase();
  if (s.includes("positive")) sentiment = SentimentLabel.POSITIVE;
  else if (s.includes("negative")) sentiment = SentimentLabel.NEGATIVE;

  return {
    _id: crypto.randomUUID(),
    originalText: input.text || `Analyzed ${input.sourceType} content`,
    sourceType: input.sourceType,
    sourcePreview: input.file ? `data:${input.file.mimeType};base64,${input.file.data}` : undefined,
    sentiment,
    score: data.score || 0.5,
    keywords: data.keywords || [],
    summary: data.summary || "",
    actionableInsight: data.actionableInsight || "Monitor for further similar feedback.",
    timestamp: new Date().toISOString(),
    language: data.language || "Unknown"
  };
};

export const generateBatchFeedback = async (businessType: string): Promise<SentimentAnalysisResult[]> => {
  const BATCH_SCHEMA = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING },
        sentiment: { type: Type.STRING },
        score: { type: Type.NUMBER },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        summary: { type: Type.STRING },
        actionableInsight: { type: Type.STRING },
        language: { type: Type.STRING }
      },
      required: ["text", "sentiment", "score", "keywords", "summary", "actionableInsight", "language"]
    }
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Generate 5 realistic customer reviews for a "${businessType}". Include a mix of English and regional languages like Hindi, Tamil, or Spanish to demonstrate multi-lingual support. At least one should represent a social media comment or reel feedback.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: BATCH_SCHEMA,
    },
  });

  const items = JSON.parse(response.text || "[]");
  return items.map((item: any) => ({
    ...item,
    _id: crypto.randomUUID(),
    originalText: item.text,
    sourceType: Math.random() > 0.8 ? 'reel' : 'text',
    sentiment: item.sentiment.includes("Positive") ? SentimentLabel.POSITIVE : item.sentiment.includes("Negative") ? SentimentLabel.NEGATIVE : SentimentLabel.NEUTRAL,
    timestamp: new Date(Date.now() - Math.random() * 10000000).toISOString()
  }));
};

export const generateExecutiveSummary = async (history: SentimentAnalysisResult[]): Promise<string> => {
  if (history.length === 0) return "No data available for summary.";
  const dataString = history.slice(0, 20).map(h => `[${h.language} | ${h.sourceType} | ${h.sentiment}] ${h.originalText}`).join("\n");
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Provide a 3-paragraph executive summary focusing on sentiment trends across different regions, languages, and platforms (including social media/Instagram Reels) based on this data:\n${dataString}`,
  });
  return response.text || "Summary generation failed.";
};
