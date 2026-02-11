
import React, { useState } from 'react';
import { 
  ArrowLeft, Heart, Wind, Moon, Thermometer, BrainCircuit, Activity, 
  ShieldAlert, Sparkles, MessageSquare, Clipboard, Send, Phone, MapPin, Mail, AlertCircle, PlusCircle,
  Pill, Calendar, History, ListFilter, Loader2, Check, FileText, Download, Eye, ExternalLink, X, User
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Patient, RiskLevel, HistoryEvent, HistoryEventType } from '../types';
import { RISK_COLORS } from '../constants';

const vitalsHistory = [
  { time: '00:00', hr: 72, oxygen: 98 },
  { time: '04:00', hr: 68, oxygen: 99 },
  { time: '08:00', hr: 75, oxygen: 98 },
  { time: '12:00', hr: 82, oxygen: 96 },
  { time: '16:00', hr: 78, oxygen: 97 },
  { time: '20:00', hr: 85, oxygen: 95 },
  { time: '23:59', hr: 74, oxygen: 98 },
];

interface PatientDetailProps {
  patient: Patient;
  history: HistoryEvent[];
  onBack: () => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAddHistory: (patientId: string, event: Omit<HistoryEvent, 'id' | 'date'>) => void;
}

type Tab = 'overview' | 'monitoring' | 'history' | 'reports';

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, history, onBack, notify, onAddHistory }) => {
  const [remark, setRemark] = useState('');
  const [conditionStatus, setConditionStatus] = useState<string>('Stable');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedReport, setSelectedReport] = useState<HistoryEvent | null>(null);

  const handleLogAction = () => {
    if (!remark.trim()) {
      notify('Please enter a note before saving.', 'error');
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      onAddHistory(patient.id, {
        type: 'remark',
        title: `Condition Status: ${conditionStatus}`,
        description: remark,
      });
      setIsSaving(false);
      setSaveSuccess(true);
      notify(`Action logged for ${patient.name}. Timeline updated.`, 'success');
      setRemark('');
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 1500);
  };

  const assignIntervention = (label: string, iconType: HistoryEventType) => {
    onAddHistory(patient.id, {
      type: iconType,
      title: `Assigned Intervention: ${label}`,
      description: `Doctor assigned a new activity task to improve patient compliance.`,
      status: 'pending'
    });
    notify(`Task "${label}" assigned and logged to history.`, 'success');
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'prescription': return <Pill size={16} />;
      case 'appointment': return <Calendar size={16} />;
      case 'remark': return <MessageSquare size={16} />;
      case 'assignment': return <ListFilter size={16} />;
      case 'ai_insight': return <Sparkles size={16} />;
      case 'diet': return <Clipboard size={16} />;
      case 'report': return <FileText size={16} />;
      case 'consultation': return <Clipboard size={16} />;
      default: return <History size={16} />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'prescription': return 'text-purple-500 bg-purple-500/10';
      case 'appointment': return 'text-blue-500 bg-blue-500/10';
      case 'remark': return 'text-emerald-500 bg-emerald-500/10';
      case 'assignment': return 'text-orange-500 bg-orange-500/10';
      case 'ai_insight': return 'text-teal-500 bg-teal-500/10';
      case 'diet': return 'text-amber-500 bg-amber-500/10';
      case 'report': return 'text-cyan-500 bg-cyan-500/10';
      case 'consultation': return 'text-emerald-500 bg-emerald-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition-colors active:scale-95">
          <ArrowLeft size={20} /> Back to List
        </button>
        <div className="flex bg-white dark:bg-[#141b2d] rounded-xl p-1 border border-gray-100 dark:border-white/5 shadow-sm">
          {(['overview', 'monitoring', 'history', 'reports'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all capitalize
                ${activeTab === tab 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'overview' && (
            <>
              <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${RISK_COLORS[patient.risk]}`}>
                    {patient.risk} Risk Profile
                  </span>
                </div>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <img src={patient.image} alt={patient.name} className="w-32 h-32 rounded-3xl object-cover ring-4 ring-emerald-500/20" />
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold">{patient.name}</h2>
                      <p className="text-emerald-500 font-medium">Patient ID: #VS-00{patient.id}294</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg"><Calendar size={14} /> {patient.age} Years, {patient.gender}</div>
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg"><Phone size={14} /> {patient.contact}</div>
                    </div>
                    <div className="flex gap-2">
                      {patient.allergies.map(a => <span key={a} className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded-lg text-xs font-medium border border-red-500/10">{a} Allergy</span>)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Heart Rate', value: `${patient.vitals.heartRate} bpm`, icon: Heart, color: 'rose' },
                  { label: 'Blood Oxygen', value: `${patient.vitals.oxygen}%`, icon: Wind, color: 'blue' },
                  { label: 'Sleep Quality', value: `${patient.vitals.sleepScore}/100`, icon: Moon, color: 'purple' },
                  { label: 'Stress Level', value: `${patient.vitals.stressLevel}/100`, icon: Thermometer, color: 'orange' },
                ].map((vital, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#141b2d] rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-${vital.color}-500/10 text-${vital.color}-500`}><vital.icon size={20} /></div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{vital.label}</p>
                    <h4 className="text-xl font-bold mt-1">{vital.value}</h4>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'monitoring' && (
            <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-6"><Activity className="text-emerald-500" size={20} /> Continuous Vital Monitoring</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vitalsHistory}>
                    <defs><linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="time" tick={{fill: '#94a3b8', fontSize: 10}} />
                    <YAxis tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="hr" stroke="#f43f5e" fill="url(#colorHr)" strokeWidth={2} name="Heart Rate" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-3"><History className="text-emerald-500" size={24} /> Interaction Timeline</h3>
              </div>
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/50 before:via-emerald-500/20 before:to-transparent">
                {history.map((event) => (
                  <div key={event.id} className="relative flex items-start gap-6 group">
                    <div className={`mt-0.5 z-10 w-10 h-10 rounded-full border-4 border-white dark:border-[#141b2d] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-white/5 p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm group-hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{event.date}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 capitalize px-2 py-0.5 bg-emerald-500/10 rounded-full">{event.type}</span>
                      </div>
                      <h4 className="font-bold text-base mb-1">{event.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-8 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-3"><FileText className="text-emerald-500" size={24} /> Consultation & Lab Reports</h3>
                <span className="text-xs text-gray-400">{history.filter(e => e.type === 'report' || e.type === 'consultation').length} Total Reports</span>
              </div>
              
              <div className="space-y-4">
                {history.filter(e => e.type === 'report' || e.type === 'consultation').length === 0 ? (
                  <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                    <FileText size={40} className="mx-auto opacity-20 mb-4" />
                    <p className="font-bold">No reports shared yet</p>
                    <p className="text-xs">Consultation summaries and lab uploads will appear here.</p>
                  </div>
                ) : (
                  history.filter(e => e.type === 'report' || e.type === 'consultation').map((report) => (
                    <div key={report.id} className="p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] hover:bg-emerald-500/[0.03] transition-all flex items-start gap-4 group">
                      <div className={`p-3 rounded-xl flex-shrink-0 ${getEventColor(report.type)}`}>
                        {report.type === 'consultation' ? <Clipboard size={24} /> : <FileText size={24} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">{report.title}</h4>
                          <span className="text-[10px] text-gray-400 font-bold">{report.date}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{report.description}</p>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setSelectedReport(report)}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-500 hover:underline"
                          >
                            <Eye size={12}/> View Full
                          </button>
                          <button 
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-emerald-500"
                            onClick={() => notify(`Downloading ${report.title}...`, 'info')}
                          >
                            <Download size={12}/> Download PDF
                          </button>
                        </div>
                      </div>
                      {report.type === 'consultation' && (
                        <div className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Dr. Arjun Mehra</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
            <h3 className="font-bold flex items-center gap-2"><Clipboard size={18} /> Central Action Hub</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 uppercase tracking-wider font-bold">Mark Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Improving', 'Stable', 'Declining', 'Critical'].map(s => (
                    <button key={s} onClick={() => setConditionStatus(s)} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${conditionStatus === s ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-gray-100 dark:border-white/5 text-gray-500'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <textarea className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-3 text-sm h-24" placeholder="Log clinical remarks..." value={remark} onChange={(e) => setRemark(e.target.value)} />
              <button disabled={isSaving} onClick={handleLogAction} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Log Action & Alert Patient</>}
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
             <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Quick Interventions</h3>
             <div className="space-y-2">
               {[
                 { label: 'Schedule Follow-up', iconType: 'appointment' },
                 { label: 'Do Meditation', iconType: 'assignment' },
                 { label: 'Cardio Check', iconType: 'assignment' },
               ].map((item, idx) => (
                 <button key={idx} onClick={() => assignIntervention(item.label, item.iconType as any)} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all text-xs">
                   {item.label} <PlusCircle size={14} />
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Report View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setSelectedReport(null)}
          ></div>
          <div className="relative bg-white dark:bg-[#141b2d] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-8 border-b border-gray-200 dark:border-white/5 flex items-center justify-between text-white ${selectedReport.type === 'consultation' ? 'bg-emerald-500' : 'bg-cyan-500'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  {selectedReport.type === 'consultation' ? <Clipboard size={32} /> : <FileText size={32} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedReport.title}</h3>
                  <p className="text-xs text-white/80 font-medium">Recorded on {selectedReport.date}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)} 
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Patient Name</p>
                   <p className="font-bold text-gray-900 dark:text-white">{patient.name}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Category</p>
                   <p className="font-bold text-gray-900 dark:text-white capitalize">{selectedReport.type}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                   <MessageSquare size={14} className="text-emerald-500" />
                   Full Clinical Observations
                </h4>
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 prose dark:prose-invert max-w-none">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              {selectedReport.type === 'consultation' && (
                <div className="p-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Attending Physician</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Dr. Arjun Mehra (Reg ID: VS-2024-AM-01)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-gray-200 dark:border-white/5 flex gap-4">
              <button 
                onClick={() => notify('Downloading detailed report PDF...', 'info')}
                className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} /> Download Copy
              </button>
              <button 
                onClick={() => setSelectedReport(null)}
                className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
