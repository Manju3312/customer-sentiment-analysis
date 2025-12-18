
import React, { useState, useRef } from 'react';
import { SentimentAnalysisResult, SentimentLabel, FeedbackSource } from '../types';
import { 
  Send, Loader2, TrendingUp, AlertCircle, CheckCircle2, 
  ChevronRight, Hash, Sparkles, Image as ImageIcon, 
  Video as VideoIcon, Link as LinkIcon, Type as TextIcon,
  Upload, X, FileText, Globe, Circle, Instagram
} from 'lucide-react';
import { analyzeSentiment } from '../services/geminiService';

interface Props {
  onNewResult: (result: SentimentAnalysisResult) => void;
  results: SentimentAnalysisResult[];
  isLoading?: boolean;
}

export const FeedbackAnalysis: React.FC<Props> = ({ onNewResult, results, isLoading }) => {
  const [activeTab, setActiveTab] = useState<FeedbackSource>('text');
  const [inputText, setInputText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [reelInput, setReelInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setSelectedFile({
        data: base64,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let inputData: any = { sourceType: activeTab };

    if (activeTab === 'text') {
      if (!inputText.trim()) return;
      inputData.text = inputText;
    } else if (activeTab === 'url') {
      if (!urlInput.trim()) return;
      inputData.text = urlInput;
    } else if (activeTab === 'reel') {
      if (!reelInput.trim()) return;
      inputData.text = reelInput;
    } else {
      if (!selectedFile) return;
      inputData.file = { data: selectedFile.data, mimeType: selectedFile.mimeType };
      inputData.text = inputText;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeSentiment(inputData);
      onNewResult(result);
      setInputText('');
      setUrlInput('');
      setReelInput('');
      setSelectedFile(null);
    } catch (err) {
      setError("Analysis failed. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentDotColor = (label: SentimentLabel) => {
    switch (label) {
      case SentimentLabel.POSITIVE: return 'bg-emerald-500';
      case SentimentLabel.NEGATIVE: return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const getSourceIcon = (type: FeedbackSource) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <VideoIcon className="w-4 h-4" />;
      case 'url': return <LinkIcon className="w-4 h-4" />;
      case 'reel': return <Instagram className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI Multi-Lingual Processor</h3>
          <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto max-w-full">
            <TabButton active={activeTab === 'text'} onClick={() => setActiveTab('text')} icon={<TextIcon className="w-4 h-4" />} label="Text" />
            <TabButton active={activeTab === 'image'} onClick={() => setActiveTab('image')} icon={<ImageIcon className="w-4 h-4" />} label="Image" />
            <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={<VideoIcon className="w-4 h-4" />} label="Video" />
            <TabButton active={activeTab === 'reel'} onClick={() => setActiveTab('reel')} icon={<Instagram className="w-4 h-4 text-pink-500" />} label="Reels" />
            <TabButton active={activeTab === 'url'} onClick={() => setActiveTab('url')} icon={<LinkIcon className="w-4 h-4" />} label="Web" />
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-6">
          {activeTab === 'reel' ? (
            <div className="relative group">
              <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-500 w-5 h-5 group-focus-within:scale-110 transition-transform" />
              <input
                type="url"
                value={reelInput}
                onChange={(e) => setReelInput(e.target.value)}
                placeholder="Paste Instagram Reel URL (e.g., https://www.instagram.com/reels/...)"
                className="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all font-medium text-slate-700"
                disabled={isAnalyzing}
              />
            </div>
          ) : activeTab === 'url' ? (
            <div className="relative group">
              <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste review page URL or profile link..."
                className="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                disabled={isAnalyzing}
              />
            </div>
          ) : activeTab === 'text' ? (
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste customer feedback here... Gemini 3 Pro supports any regional language."
              className="w-full min-h-[160px] p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none text-slate-700 font-medium leading-relaxed"
              disabled={isAnalyzing}
            />
          ) : (
            <div className="space-y-4">
              <div 
                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedFile ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-slate-100/50'
                }`}
              >
                <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept={activeTab === 'image' ? 'image/*' : 'video/*'} />
                {selectedFile ? (
                  <div className="flex items-center gap-5 w-full max-w-md bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    {activeTab === 'image' ? (
                       <img src={`data:${selectedFile.mimeType};base64,${selectedFile.data}`} className="w-16 h-16 object-cover rounded-xl shadow-md" alt="Preview" />
                    ) : (
                       <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                         <VideoIcon className="w-6 h-6 opacity-50" />
                       </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate text-sm">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{selectedFile.mimeType}</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="p-2.5 hover:bg-rose-100 text-rose-500 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-5">
                      <Upload className="w-7 h-7 text-blue-500" />
                    </div>
                    <p className="font-bold text-slate-900 text-lg">Upload Feedback Visuals</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-xs text-center font-medium">Gemini will analyze sentiment directly from images or video frames.</p>
                  </>
                )}
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Add context to the file (optional)..."
                className="w-full min-h-[100px] p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none text-slate-700 font-medium"
                disabled={isAnalyzing}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-5 pt-2">
             {isAnalyzing && (
               <div className="flex items-center gap-2">
                 <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                 <span className="text-xs text-blue-500 font-black uppercase tracking-widest">Mining Social Signals...</span>
               </div>
             )}
             <button
              type="submit"
              disabled={isAnalyzing || (activeTab === 'text' && !inputText.trim()) || (activeTab === 'url' && !urlInput.trim()) || (activeTab === 'reel' && !reelInput.trim()) || (['image', 'video'].includes(activeTab) && !selectedFile)}
              className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 disabled:opacity-30 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Analyze {activeTab === 'reel' ? 'Instagram Reel' : 'Feedback'}
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-rose-500 text-sm font-bold flex items-center gap-2 p-4 bg-rose-50 rounded-2xl border border-rose-100"><AlertCircle className="w-4 h-4" /> {error}</p>}
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
            <Globe className="w-5 h-5 text-blue-500" /> Multi-Platform Insight Stream
          </h3>
          <span className="px-4 py-1.5 bg-slate-200/50 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">{results.length} PROCESSED</span>
        </div>
        <div className="divide-y divide-slate-100 max-h-[1000px] overflow-y-auto scrollbar-hide">
          {results.length === 0 ? (
            <div className="p-24 text-center flex flex-col items-center opacity-40">
              {isLoading ? <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" /> : <Sparkles className="w-16 h-16 text-slate-200 mb-6" />}
              <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em]">{isLoading ? 'Syncing DB...' : 'Awaiting Signals'}</p>
            </div>
          ) : (
            results.map((item) => (
              <div key={item._id} className="p-10 hover:bg-slate-50/50 transition-all border-l-[6px] border-transparent hover:border-blue-500 group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2.5 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
                      <div className={`w-2.5 h-2.5 rounded-full ${getSentimentDotColor(item.sentiment)} shadow-sm`}></div>
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                        {item.sentiment}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                      <Globe className="w-3.5 h-3.5" />
                      {item.language}
                    </div>
                    
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      item.sourceType === 'reel' ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-slate-100/50 text-slate-500 border-slate-100'
                    }`}>
                      {getSourceIcon(item.sourceType)}
                      {item.sourceType === 'reel' ? 'Instagram Reel' : item.sourceType}
                    </div>
                  </div>
                  <time className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-7 flex gap-6">
                    {item.sourcePreview ? (
                      <div className="flex-shrink-0">
                         {item.sourceType === 'image' ? (
                            <img src={item.sourcePreview} className="w-32 h-32 object-cover rounded-2xl shadow-lg border-2 border-white ring-1 ring-slate-100" alt="Analysis context" />
                         ) : (
                            <div className="w-32 h-32 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                               <VideoIcon className="w-10 h-10 opacity-30" />
                            </div>
                         )}
                      </div>
                    ) : item.sourceType === 'reel' ? (
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <Instagram className="w-10 h-10 opacity-60" />
                        </div>
                      </div>
                    ) : null}
                    <div className="flex-1">
                      <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">SOURCE CONTENT</h4>
                      <p className="text-slate-900 font-bold leading-relaxed italic text-xl md:text-2xl decoration-blue-500/20 underline underline-offset-8">
                        "{item.originalText}"
                      </p>
                    </div>
                  </div>
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AI REFLECTION</h4>
                      <p className="text-sm text-slate-700 font-bold leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-xl shadow-blue-600/20 text-white">
                      <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> STRATEGIC INSIGHT
                      </h4>
                      <p className="text-sm font-bold leading-relaxed opacity-95">
                        {item.actionableInsight}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shrink-0 ${
      active ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    {label}
  </button>
);
