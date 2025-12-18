
import React from 'react';
import { DashboardStats as IStats } from '../types';
import { MessageSquare, ThumbsUp, ThumbsDown, BarChart2 } from 'lucide-react';

interface Props {
  stats: IStats;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; iconColor: string }> = ({ title, value, icon, color, iconColor }) => (
  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] shadow-xl shadow-sky-500/5 border border-sky-100 flex items-center justify-between transition-all hover:translate-y-[-2px]">
    <div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black mt-1 text-slate-900">{value}</p>
    </div>
    <div className={`p-4 rounded-2xl ${color} ${iconColor} shadow-inner`}>
      {icon}
    </div>
  </div>
);

export const DashboardStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Feedback" 
        value={stats.totalFeedbacks} 
        icon={<MessageSquare className="w-6 h-6" />} 
        color="bg-sky-50"
        iconColor="text-sky-600"
      />
      <StatCard 
        title="Positive Feedback" 
        value={stats.positiveCount} 
        icon={<ThumbsUp className="w-6 h-6" />} 
        color="bg-teal-50"
        iconColor="text-teal-600"
      />
      <StatCard 
        title="Negative Feedback" 
        value={stats.negativeCount} 
        icon={<ThumbsDown className="w-6 h-6" />} 
        color="bg-rose-50"
        iconColor="text-rose-600"
      />
      <StatCard 
        title="Avg. Sentiment" 
        value={(stats.averageScore * 100).toFixed(1) + '%'} 
        icon={<BarChart2 className="w-6 h-6" />} 
        color="bg-cyan-50"
        iconColor="text-cyan-600"
      />
    </div>
  );
};
