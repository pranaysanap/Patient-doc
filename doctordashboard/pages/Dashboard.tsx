
import React, { useMemo } from 'react';
import { Users, UserPlus, Calendar, Utensils, FileText, ArrowUpRight, TrendingUp, AlertTriangle, BrainCircuit, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MOCK_ACTIVITIES } from '../constants';
import { View, Patient, RiskLevel } from '../types';

const data = [
  { name: 'Mon', apps: 8, monitored: 32 },
  { name: 'Tue', apps: 12, monitored: 38 },
  { name: 'Wed', apps: 10, monitored: 35 },
  { name: 'Thu', apps: 15, monitored: 42 },
  { name: 'Fri', apps: 14, monitored: 40 },
  { name: 'Sat', apps: 4, monitored: 25 },
  { name: 'Sun', apps: 2, monitored: 22 },
];

interface DashboardProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ patients, onSelectPatient, onNavigate }) => {
  const riskDistribution = useMemo(() => {
    const counts: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    patients.forEach(p => counts[p.risk]++);
    return [
      { name: 'Low', value: counts.low, color: '#10b981' },
      { name: 'Medium', value: counts.medium, color: '#eab308' },
      { name: 'High', value: counts.high, color: '#f97316' },
      { name: 'Critical', value: counts.critical, color: '#ef4444' },
    ];
  }, [patients]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Connected Patients', value: patients.length.toString(), icon: Users, color: 'emerald', change: '+1 this mo.' },
          { label: 'Pending Requests', value: '2', icon: UserPlus, color: 'blue', change: '1 new' },
          { label: 'Today\'s Appointments', value: '6', icon: Calendar, color: 'purple', change: '4 completed' },
          { label: 'Diet Approvals', value: '3', icon: Utensils, color: 'orange', change: 'Pending' },
          { label: 'Reports to Review', value: '5', icon: FileText, color: 'rose', change: '1 Urgent' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-default">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${stat.color}-500/10 text-${stat.color}-500`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
              <span className="text-xs font-bold text-emerald-500">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Activity Trend</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Appointments vs Active Monitoring</p>
              </div>
              <select className="bg-gray-100 dark:bg-white/5 border-none outline-none rounded-lg px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="monitored" stroke="#10b981" fillOpacity={1} fill="url(#colorApps)" strokeWidth={3} />
                  <Area type="monotone" dataKey="apps" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Risk Distribution</h3>
               <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  {riskDistribution.map((r) => (
                    <div key={r.name} className="flex items-center gap-2 text-xs font-medium">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: r.color}}></div>
                      <span className="text-gray-600 dark:text-gray-400">{r.name}: {r.value}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Emergency Alerts</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-bold text-red-600 dark:text-red-500">Critical HR Spike</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Vikram Deshmukh - Anomalous tachycardia detected.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <TrendingUp className="text-orange-500 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-500">Oxygen Variance</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Rajesh Malhotra - Low SpO2 persistence.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
              <button onClick={() => onNavigate(View.Notifications)} className="text-xs font-bold text-emerald-500 hover:underline">View All</button>
            </div>
            <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {MOCK_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="flex gap-4 group cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center 
                    ${activity.type === 'report' ? 'bg-blue-500/10 text-blue-500' : 
                      activity.type === 'request' ? 'bg-emerald-500/10 text-emerald-500' : 
                      activity.type === 'diet' ? 'bg-orange-500/10 text-orange-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {activity.type === 'report' ? <FileText size={18} /> : 
                     activity.type === 'request' ? <UserPlus size={18} /> : 
                     activity.type === 'diet' ? <Utensils size={18} /> : <BrainCircuit size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-emerald-500 transition-colors">{activity.patientName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{activity.action}</p>
                    <p className="text-[10px] font-medium text-gray-400 mt-1">{activity.timestamp}</p>
                  </div>
                  <ArrowUpRight size={14} className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-4">Network Integrity</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                   <ShieldCheck size={20} className="text-emerald-500" />
                   <div>
                      <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">HIPAA Connection</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">All Vital Channels Secure</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
