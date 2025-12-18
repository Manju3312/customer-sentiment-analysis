
import React, { useState } from 'react';
import { FeedbackAnalysis } from './FeedbackAnalysis';
import { SentimentAnalysisResult } from '../types';
import { Sparkles, LogOut, CheckCircle2, MessageSquareHeart } from 'lucide-react';

interface Props {
  userName: string;
  onLogout: () => void;
}

export const CustomerPortal: React.FC<Props> = ({ userName, onLogout }) => {
  const [submitted, setSubmitted] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<SentimentAnalysisResult | null>(null);

  const handleSubmission = (result: SentimentAnalysisResult) => {
    setLastAnalysis(result);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Thank you, {userName.split(' ')[0]}!</h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-8">
            Your feedback has been analyzed by our AI. We've detected a 
            <span className="font-bold text-blue-600"> {lastAnalysis?.sentiment} </span> 
            tone and shared your insights with our team.
          </p>
          <div className="bg-slate-50 p-6 rounded-2xl mb-8 text-left border border-slate-100">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Our AI's Reflection</p>
            <p className="text-slate-700 font-medium italic">"{lastAnalysis?.summary}"</p>
          </div>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
          >
            Submit Another Feedback
          </button>
          <button 
            onClick={onLogout}
            className="mt-6 text-slate-400 font-bold text-sm hover:text-rose-500 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">Apex <span className="text-blue-500">Portal</span></span>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-rose-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Share Your Voice</h2>
            <p className="text-slate-500 text-lg font-medium flex items-center justify-center md:justify-start gap-2">
              <MessageSquareHeart className="w-5 h-5 text-rose-400" />
              Help us shape the future of our service.
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-white shadow-xl overflow-hidden">
            <FeedbackAnalysis onNewResult={handleSubmission} results={[]} />
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-slate-400 text-sm font-medium">
        Your data is analyzed anonymously using enterprise-grade AI.
      </footer>
    </div>
  );
};
