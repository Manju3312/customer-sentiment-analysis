
import React, { useState, useEffect, useMemo } from 'react';
import { DashboardStats } from './components/DashboardStats';
import { SentimentDistribution, TrendChart, LanguageDistribution } from './components/SentimentChart';
import { FeedbackAnalysis } from './components/FeedbackAnalysis';
import { AuthScreen } from './components/AuthScreen';
import { CustomerPortal } from './components/CustomerPortal';
import { SentimentAnalysisResult, DashboardStats as IStats, SentimentLabel, UserSession } from './types';
import { 
  LayoutDashboard, Sparkles, BrainCircuit, Settings, LogOut, 
  MessageSquareText, TrendingUp, Loader2, BookOpenText, Database,
  CircleDot, Languages
} from 'lucide-react';
import { generateBatchFeedback, generateExecutiveSummary } from './services/geminiService';
import { mongoService } from './services/mongoService';

const SESSION_KEY = 'apex_auth_session';

const App: React.FC = () => {
  const [results, setResults] = useState<SentimentAnalysisResult[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [execSummary, setExecSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [caseStudyInput, setCaseStudyInput] = useState('Arctic Logistics Group');

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try { 
        const parsed = JSON.parse(savedSession);
        setSession(parsed);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const query = session?.role === 'customer' ? { userId: session.userId } : {};
      const data = await mongoService.feedback.find(query);
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch from MongoDB:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const stats: IStats = useMemo(() => {
    if (results.length === 0) return { totalFeedbacks: 0, averageScore: 0, positiveCount: 0, negativeCount: 0, neutralCount: 0 };
    const pos = results.filter(r => r.sentiment === SentimentLabel.POSITIVE).length;
    const neg = results.filter(r => r.sentiment === SentimentLabel.NEGATIVE).length;
    const neu = results.filter(r => r.sentiment === SentimentLabel.NEUTRAL).length;
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    return {
      totalFeedbacks: results.length,
      averageScore: totalScore / results.length,
      positiveCount: pos,
      negativeCount: neg,
      neutralCount: neu
    };
  }, [results]);

  const handleGenerateSimulation = async () => {
    setIsSimulating(true);
    try {
      const newItems = await generateBatchFeedback(caseStudyInput);
      const savedItems = await mongoService.feedback.insertMany(newItems);
      setResults(prev => [...savedItems, ...prev]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (results.length === 0) return;
    setIsSummarizing(true);
    try {
      const summary = await generateExecutiveSummary(results);
      setExecSummary(summary);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleNewResult = async (res: SentimentAnalysisResult) => {
    const docWithUser = { ...res, userId: session?.userId };
    const savedDoc = await mongoService.feedback.insertOne(docWithUser);
    setResults(p => [savedDoc, ...p]);
  };

  const handleResetData = async () => {
    if (confirm("Are you sure you want to clear the MongoDB collection?")) {
      await mongoService.feedback.deleteMany();
      setResults([]);
    }
  };

  if (!session) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (session.role === 'customer') {
    return <CustomerPortal userName={session.name} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex bg-sky-50/40">
      <aside className="w-72 bg-[#020617] text-slate-300 flex-shrink-0 hidden lg:flex flex-col border-r border-sky-900/50 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white mb-10">
            <div className="bg-gradient-to-tr from-cyan-400 to-sky-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Apex<span className="text-cyan-400 italic">AI</span></span>
          </div>
          
          <nav className="space-y-1.5">
            <SidebarItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active />
            <SidebarItem icon={<Languages className="w-5 h-5" />} label="Regional Analytics" />
            <SidebarItem icon={<BrainCircuit className="w-5 h-5" />} label="AI Training" />
            <SidebarItem icon={<MessageSquareText className="w-5 h-5" />} label="Database" />
            <div className="pt-6 pb-2 text-xs font-bold text-slate-500 uppercase tracking-widest px-4">Market Simulator</div>
            <div className="px-4 space-y-3">
              <input 
                type="text" 
                value={caseStudyInput}
                onChange={(e) => setCaseStudyInput(e.target.value)}
                placeholder="e.g. Retail Giant"
                className="w-full bg-[#1e293b] border border-cyan-900/50 rounded-lg p-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/50 transition-all outline-none"
              />
              <button 
                onClick={handleGenerateSimulation}
                disabled={isSimulating}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/20"
              >
                {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Gen Multi-Lingual
              </button>
            </div>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-sky-900/30">
          <div className="bg-[#1e293b]/50 rounded-xl p-4 text-xs mb-4 border border-cyan-900/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 flex items-center gap-1"><Database className="w-3 h-3 text-cyan-400" /> Node Data</p>
              <div className="flex items-center gap-1 text-cyan-300 font-bold uppercase tracking-widest text-[8px]">
                <CircleDot className="w-2 h-2 fill-current animate-pulse" />
                Live
              </div>
            </div>
            {/* Displaying 'contact' instead of 'email' */}
            <p className="font-semibold text-cyan-50 truncate">{session.contact}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-sky-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <h1 className="text-xl font-bold text-slate-800 lg:hidden flex items-center gap-2">Apex AI</h1>
          <div className="flex flex-col">
             <h1 className="text-xl font-bold text-slate-900 hidden lg:block tracking-tight">Intelligence Command</h1>
             <p className="text-xs text-cyan-600 font-semibold hidden lg:block">Ice Theme Active • Regional Analysis Live</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleResetData}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5 border border-rose-100 rounded-md hover:bg-rose-50 transition-all"
            >
              Clear DB
            </button>
            <div className="h-10 w-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-slate-700 font-bold text-sm shadow-sm overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.userId}`} alt="Avatar" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full">
          <DashboardStats stats={stats} />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <LanguageDistribution data={results} />
                </div>
                <div className="md:col-span-1">
                  <SentimentDistribution data={results} />
                </div>
                <div className="md:col-span-1">
                  <TrendChart data={results} />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-xl shadow-sky-500/5 border border-sky-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <BookOpenText className="w-32 h-32 text-cyan-600" />
                </div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-500" /> 
                    Regional Insights Summary
                  </h3>
                  <button 
                    onClick={handleGenerateSummary}
                    disabled={isSummarizing || results.length === 0}
                    className="text-xs bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 disabled:opacity-30 transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/20"
                  >
                    {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
                    Refresh Analysis
                  </button>
                </div>
                {execSummary ? (
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4 text-sm md:text-base">
                    {execSummary.split('\n').map((para, i) => para.trim() && <p key={i}>{para}</p>)}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center text-slate-400">
                    <BookOpenText className="w-12 h-12 mb-3 opacity-10 text-cyan-600" />
                    <p className="text-sm font-medium">Regional summary pending analysis.</p>
                  </div>
                )}
              </div>

              <FeedbackAnalysis 
                onNewResult={handleNewResult} 
                results={results} 
                isLoading={isLoadingData} 
              />
            </div>

            <aside className="space-y-8">
               <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] shadow-xl shadow-sky-500/5 border border-sky-100">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800">
                  <TrendingUp className="w-5 h-5 text-cyan-500" />
                  Global Keywords
                </h3>
                <div className="flex flex-wrap gap-2.5">
                   {results.length > 0 ? (
                     Array.from(new Set(results.flatMap(r => r.keywords)))
                      .slice(0, 20)
                      .map((word, idx) => (
                        <span key={idx} className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-50/50 text-cyan-700 border border-sky-100 hover:border-cyan-200 hover:bg-cyan-50 transition-all cursor-default">
                          {word}
                        </span>
                      ))
                   ) : (
                     <p className="text-slate-400 text-sm italic">Populating keywords...</p>
                   )}
                </div>
              </div>

              <div className="bg-[#020617] p-8 rounded-[2.5rem] shadow-2xl shadow-cyan-900/10 text-white relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500 rounded-full blur-[80px] opacity-20"></div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">Regional Loyalty</h3>
                <p className="text-slate-400 text-sm mb-6">Aggregate loyalty score across all regions.</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-black text-cyan-400">{(stats.averageScore * 100).toFixed(0)}</span>
                  <span className="text-xl font-bold text-slate-500 mb-1">/ 100</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-600 to-sky-400 transition-all duration-1000" 
                    style={{ width: `${stats.averageScore * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-rose-50/50 backdrop-blur-sm border border-rose-100 p-6 rounded-[2rem]">
                <h3 className="text-sm font-bold text-rose-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                  Pain Points by Region
                </h3>
                <div className="space-y-3">
                  {results.filter(r => r.sentiment === SentimentLabel.NEGATIVE).slice(0, 3).map(r => (
                    <div key={r._id} className="bg-white/80 p-3 rounded-xl border border-rose-200 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">{r.language}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{r.keywords[0]}</p>
                      </div>
                      <p className="text-xs text-rose-700 line-clamp-2 leading-relaxed italic">"{r.originalText}"</p>
                    </div>
                  ))}
                  {results.filter(r => r.sentiment === SentimentLabel.NEGATIVE).length === 0 && (
                     <p className="text-rose-400 text-xs italic">All regions reporting healthy sentiment.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <a 
    href="#" 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
      active 
        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' 
        : 'hover:bg-[#1e293b] text-slate-400 hover:text-white'
    }`}
  >
    <span className={active ? 'text-white' : 'group-hover:text-cyan-400 transition-colors'}>{icon}</span>
    {label}
  </a>
);

export default App;
