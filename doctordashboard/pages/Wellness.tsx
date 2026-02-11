
import React, { useState } from 'react';
import { BrainCircuit, Smile, Frown, Meh, MessageSquare, Zap, Cloud, Moon, Send, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Patient, HistoryEvent } from '../types';

const moodData = [
  { day: 'Mon', score: 8 },
  { day: 'Tue', score: 7 },
  { day: 'Wed', score: 4 },
  { day: 'Thu', score: 6 },
  { day: 'Fri', score: 9 },
  { day: 'Sat', score: 8 },
  { day: 'Sun', score: 9 },
];

interface WellnessProps {
  patients: Patient[];
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAddHistory: (patientId: string, event: Omit<HistoryEvent, 'id' | 'date'>) => void;
}

const Wellness: React.FC<WellnessProps> = ({ patients, notify, onAddHistory }) => {
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const handleGlobalIntervention = (label: string) => {
    setProcessingAction(label);
    
    // Slight artificial delay for UX feedback
    setTimeout(() => {
      patients.forEach(patient => {
        onAddHistory(patient.id, {
          type: 'assignment',
          title: `Network Recommendation: ${label}`,
          description: `Doctor sent a fleet-wide mental wellness task: ${label}. Following up on general network mood trends.`,
          status: 'pending'
        });
      });

      notify(`Broadcasting complete: "${label}" sent to all ${patients.length} patients.`, 'success');
      setProcessingAction(null);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mental Wellness Overview</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Psychological health indicators and mood tracking</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleGlobalIntervention('Urgent Stress Check-in')}
            className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Zap size={18} />
            Group Wellness Alert
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Mood Trend */}
          <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <BrainCircuit className="text-emerald-500" size={20} />
                Network Mood Index
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">Optimal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">Alert Level</span>
                </div>
              </div>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={4} dot={{r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 italic">Aggregate data from {patients.length} connected patients showing stable mental health trends this week.</p>
          </div>

          {/* Quick Logs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                <h3 className="font-black text-xs mb-4 uppercase tracking-widest text-gray-400">Recent Journals</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Ananya S.', text: 'Feeling much calmer today. Meditation helped.', mood: 'Smile' },
                    { name: 'Rajesh M.', text: 'Sleep was disrupted again. Anxious about work.', mood: 'Frown' },
                    { name: 'Isha P.', text: 'Stable energy levels throughout the day.', mood: 'Meh' },
                  ].map((log, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-emerald-500/20 transition-all cursor-pointer">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold text-gray-900 dark:text-white">{log.name}</span>
                         {log.mood === 'Smile' ? <Smile size={16} className="text-emerald-500" /> : log.mood === 'Frown' ? <Frown size={16} className="text-red-500" /> : <Meh size={16} className="text-yellow-500" />}
                       </div>
                       <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic line-clamp-2">"{log.text}"</p>
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                <h3 className="font-black text-xs mb-4 uppercase tracking-widest text-gray-400">Quick Interventions (Broadcast to All)</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Suggest Breathing Exercise', color: 'blue' },
                    { label: 'Recommend Therapy Session', color: 'emerald' },
                    { label: 'Send Encouragement', color: 'purple' },
                    { label: 'Assign Mood Check-in', color: 'orange' },
                  ].map((action, i) => (
                    <button 
                      key={i} 
                      disabled={!!processingAction}
                      onClick={() => handleGlobalIntervention(action.label)}
                      className={`w-full p-3 rounded-xl border border-${action.color}-500/30 bg-${action.color}-500/5 text-${action.color}-600 dark:text-${action.color}-400 text-xs font-bold hover:bg-${action.color}-500 hover:text-white transition-all flex items-center justify-between active:scale-[0.98] disabled:opacity-50`}
                    >
                      {processingAction === action.label ? (
                        <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Broadcasting...</span>
                      ) : action.label}
                      <Zap size={14} className={processingAction === action.label ? 'animate-pulse' : ''} />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 text-center mt-4 italic">Note: Actions above will be logged to the history of every connected patient.</p>
             </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-8">
           <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-8 text-white space-y-6 shadow-2xl">
              <h3 className="font-bold text-lg">Wellness Metrics</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400">
                    <Cloud size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Avg Anxiety</p>
                    <p className="text-xl font-bold">Moderate <span className="text-xs text-emerald-500 font-normal">(-4%)</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400">
                    <Zap size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Meditation Compliance</p>
                    <p className="text-xl font-bold">82% <span className="text-xs text-emerald-500 font-normal">(Target 85)</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-purple-400">
                    <Moon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Sleep Efficiency</p>
                    <p className="text-xl font-bold">74% <span className="text-xs text-red-400 font-normal">(-2%)</span></p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <button 
                  onClick={() => notify('Weekly aggregate wellness report generated and sent to hospital board.', 'info')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  <Send size={18} />
                  Send Weekly Report
                </button>
              </div>
           </div>

           <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
             <h4 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Urgent Outreach Needed</h4>
             <div className="space-y-3">
                {[
                  { name: 'Rajesh Malhotra', reason: 'High Stress Alert' },
                  { name: 'Vikram Deshmukh', reason: 'Mood Drop (Critical)' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-[10px] font-bold text-red-500">{p.reason}</p>
                    </div>
                    <button 
                      onClick={() => notify(`Direct encrypted channel opened with ${p.name}.`, 'info')}
                      className="text-[10px] font-black uppercase text-red-500 hover:underline active:scale-95"
                    >
                      Contact Now
                    </button>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Wellness;
