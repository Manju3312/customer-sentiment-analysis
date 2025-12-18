
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  AreaChart, 
  Area, 
  CartesianGrid,
  PieChart,
  Pie
} from 'recharts';
import { SentimentAnalysisResult, SentimentLabel } from '../types';

interface Props {
  data: SentimentAnalysisResult[];
}

export const SentimentDistribution: React.FC<Props> = ({ data }) => {
  const counts = data.reduce((acc, curr) => {
    acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { name: 'POSITIVE', value: counts[SentimentLabel.POSITIVE] || 0, color: '#14b8a6' }, // Teal 500
    { name: 'NEUTRAL', value: counts[SentimentLabel.NEUTRAL] || 0, color: '#94a3b8' }, // Slate 400
    { name: 'NEGATIVE', value: counts[SentimentLabel.NEGATIVE] || 0, color: '#f43f5e' }, // Rose 500
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl shadow-sky-500/5 border border-sky-100 h-[450px] flex flex-col">
      <div className="flex flex-col mb-10">
        <h3 className="text-sm font-black text-slate-400 mb-6 uppercase tracking-[0.3em]">Sentiment Distribution</h3>
        
        {/* Refined Legend - Exactly matching user reference image */}
        <div className="flex items-center gap-12 py-2 self-start flex-wrap">
           {chartData.map((item) => (
             <div key={item.name} className="flex items-center gap-4 transition-opacity hover:opacity-80 cursor-default">
               <div 
                 className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.05)] border border-white/20" 
                 style={{ backgroundColor: item.color }}
               ></div>
               <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#64748b] leading-none">
                 {item.name}
               </span>
             </div>
           ))}
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#cbd5e1', fontSize: 11 }}
            />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ 
                borderRadius: '24px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)'
              }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Bar 
              dataKey="value" 
              radius={[14, 14, 0, 0]} 
              barSize={54}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const LanguageDistribution: React.FC<Props> = ({ data }) => {
  const counts = data.reduce((acc, curr) => {
    acc[curr.language] = (acc[curr.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(counts).map(([name, value]) => ({
    name: name.toUpperCase(),
    value
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const COLORS = ['#0891b2', '#0ea5e9', '#22d3ee', '#67e8f9', '#a5f3fc']; // Cyan scale

  return (
    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl shadow-sky-500/5 border border-sky-100 h-[450px] flex flex-col">
      <h3 className="text-sm font-black text-slate-400 mb-6 uppercase tracking-[0.3em]">Regional Mix</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '24px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6">
        {chartData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrendChart: React.FC<Props> = ({ data }) => {
  const chartData = [...data]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: (d.score * 100).toFixed(0)
    }));

  return (
    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2rem] shadow-xl shadow-sky-500/5 border border-sky-100 h-[450px] flex flex-col">
      <h3 className="text-sm font-black text-slate-400 mb-6 uppercase tracking-[0.3em]">Sentiment Pulse</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0891b2" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} unit="%" />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '24px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#0891b2" 
              fillOpacity={1} 
              fill="url(#colorScore)" 
              strokeWidth={4}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
