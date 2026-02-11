
import React, { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Video, User, Plus, ChevronLeft, ChevronRight, MoreVertical, X, Check, Loader2, MapPin, Edit3, ClipboardCheck, FileText, PhoneCall } from 'lucide-react';
import { Appointment } from '../types';
import * as api from '../api';

interface ScheduleProps {
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAddHistory: (patientId: string, event: any) => void;
  patients?: any[];
}

const Schedule: React.FC<ScheduleProps> = ({ notify, onAddHistory, patients = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [reportText, setReportText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [newApp, setNewApp] = useState({
    patientId: patients[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    customTime: '10:15',
    type: 'Online' as 'Online' | 'In-Person',
    notes: ''
  });

  // Load appointments from backend
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await api.fetchAppointments();
        const transformed: Appointment[] = response.data.map((a: any) => ({
          id: a.appointmentId,
          patientId: a.patientId,
          patientName: a.patientId, // Will be resolved below
          time: new Date(a.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          type: a.type,
          status: a.status === 'confirmed' || a.status === 'pending' ? 'upcoming' : a.status,
          meetingLink: a.meetingLink || '',
        }));
        // Resolve patient names from the patients prop
        const resolvedApps = transformed.map(a => {
          const patient = patients.find(p => p.id === a.patientId);
          return { ...a, patientName: patient?.name || a.patientId };
        });
        setAppointments(resolvedApps);
      } catch (err) {
        console.error('Error loading appointments:', err);
        // Fallback to empty if backend is unavailable
      } finally {
        setIsLoading(false);
      }
    };
    loadAppointments();
  }, [patients]);

  const hours = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diffToMonday));
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        fullDate: d.toISOString().split('T')[0],
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        year: d.getFullYear()
      };
    });
  }, []);

  const currentMonthRange = useMemo(() => {
    if (weekDays.length === 0) return '';
    const first = weekDays[0];
    const last = weekDays[4];
    return `${first.month} ${first.date} – ${last.date}, ${first.year}`;
  }, [weekDays]);

  const formatTime = (time24: string) => {
    const [hoursStr, minutes] = time24.split(':');
    const h = parseInt(hoursStr);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);
    const finalTime = isCustomTime ? formatTime(newApp.customTime) : newApp.time;
    const patient = patients.find(p => p.id === newApp.patientId);

    try {
      // Build appointment date from date + time
      const appointmentDate = new Date(`${newApp.date} ${finalTime}`);

      const response = await api.createAppointment({
        patientId: newApp.patientId,
        appointmentDate: appointmentDate.toISOString(),
        type: newApp.type,
        purpose: newApp.notes || 'Consultation',
        notes: newApp.notes,
      });

      const scheduledApp: Appointment = {
        id: response.data.appointmentId,
        patientId: newApp.patientId,
        patientName: patient?.name || 'Unknown',
        time: finalTime,
        type: newApp.type,
        status: 'upcoming',
        meetingLink: response.data.meetingLink || '',
      };
      setAppointments(prev => [scheduledApp, ...prev]);
      onAddHistory(newApp.patientId, {
        type: 'appointment',
        title: `Appointment Scheduled: ${newApp.type}`,
        description: `Scheduled for ${newApp.date} at ${finalTime}. Note: ${newApp.notes || 'No extra notes provided.'}`,
        status: 'upcoming'
      });

      const meetInfo = response.data.meetingLink && newApp.type === 'Online'
        ? `\n📧 Emails with Google Meet link sent to both you and ${patient?.name}.`
        : '\n📧 Confirmation emails sent.';
      notify(`Meeting with ${patient?.name} scheduled.${meetInfo}`, 'success');
      setIsModalOpen(false);
      setIsCustomTime(false);
      setNewApp({ ...newApp, notes: '' });
    } catch (err: any) {
      console.error('Error scheduling appointment:', err);
      notify(err.message || 'Failed to schedule appointment.', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleJoinCall = (app: Appointment) => {
    if (app.meetingLink) {
      window.open(app.meetingLink, '_blank');
    } else {
      notify(`No meeting link available for this appointment.`, 'info');
    }
  };

  const handleCompleteClick = (app: Appointment) => {
    setSelectedApp(app);
    setIsReportModalOpen(true);
  };

  const submitConsultationReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsScheduling(true);
    try {
      await api.addConsultationReport(selectedApp.id, {
        findings: reportText,
        recommendations: reportText,
        followUpRequired: false,
      });

      onAddHistory(selectedApp.patientId || '1', {
        type: 'consultation',
        title: `Consultation Report: ${selectedApp.time} Visit`,
        description: reportText,
        status: 'completed'
      });

      setAppointments(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status: 'completed' } : a));
      notify(`Consultation completed. Report shared with ${selectedApp.patientName}.`, 'success');
      setIsReportModalOpen(false);
      setReportText('');
    } catch (err: any) {
      console.error('Error submitting report:', err);
      notify(err.message || 'Failed to submit consultation report.', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consultation Schedule</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Manage active consultations and complete patient visit reports</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus size={18} /> New Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white dark:bg-[#141b2d] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="text-emerald-500" size={18} /> {currentMonthRange}
            </h3>
            <div className="flex gap-1">
              <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-gray-500"><ChevronLeft size={18} /></button>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-gray-500"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] border-b border-gray-200 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02]">
                <div className="p-4 border-r border-gray-200 dark:border-white/5"></div>
                {weekDays.map((day, idx) => (
                  <div key={idx} className="p-4 text-center border-r border-gray-200 dark:border-white/5 last:border-r-0">
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">{day.name}</p>
                    <p className={`text-lg font-bold ${new Date().toISOString().split('T')[0] === day.fullDate ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>{day.date}</p>
                  </div>
                ))}
              </div>
              {hours.map(hour => (
                <div key={hour} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] border-b border-gray-200 dark:border-white/5 last:border-b-0 h-24 group">
                  <div className="p-2 border-r border-gray-200 dark:border-white/5 text-[10px] font-black text-gray-500 dark:text-gray-400 text-right pr-4 pt-1">{hour}</div>
                  {weekDays.map((day, idx) => (
                    <div key={`${idx}-${hour}`} className="relative p-1 border-r border-gray-200 dark:border-white/5 last:border-r-0 hover:bg-emerald-500/5 cursor-pointer group/cell">
                      <button
                        onClick={() => { setNewApp(prev => ({ ...prev, time: hour, date: day.fullDate })); setIsModalOpen(true); }}
                        className="absolute bottom-2 right-2 opacity-0 group-hover/cell:opacity-100 transition-opacity bg-white dark:bg-[#0f172a] p-1.5 rounded-full shadow-lg border border-gray-100 dark:border-white/10"
                      >
                        <Plus size={14} className="text-emerald-500" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#141b2d] rounded-2xl p-6 border border-gray-200 dark:border-white/5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
              Active Queue
              <span className="text-xs text-emerald-500 font-bold">{appointments.filter(a => a.status !== 'completed').length} Pending</span>
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {appointments.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  <Clock size={32} className="mx-auto opacity-10 mb-2" />
                  <p className="text-xs">No appointments scheduled</p>
                </div>
              )}
              {appointments.map(app => (
                <div key={app.id} className={`p-4 rounded-2xl border transition-all ${app.status === 'completed' ? 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 opacity-60' : 'bg-white dark:bg-[#1e293b] border-emerald-500/10 hover:border-emerald-500/40 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg tracking-wider ${app.status === 'completed' ? 'bg-gray-200 text-gray-500' : 'bg-emerald-500/10 text-emerald-500 uppercase'}`}>{app.time}</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                      {app.type === 'Online' ? <Video size={12} className="text-blue-500" /> : <MapPin size={12} className="text-purple-500" />}
                      {app.type}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{app.patientName}</h4>
                    <p className="text-[10px] text-gray-500 font-medium">Standard clinical consultation</p>
                  </div>

                  {app.status !== 'completed' && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={() => handleJoinCall(app)}
                        className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-all active:scale-95 shadow-md shadow-emerald-500/10"
                      >
                        <PhoneCall size={12} /> Join Call
                      </button>
                      <button
                        onClick={() => handleCompleteClick(app)}
                        className="flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95"
                      >
                        <Check size={12} /> Completed
                      </button>
                    </div>
                  )}
                  {app.status === 'completed' && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/5 p-2 rounded-lg">
                      <ClipboardCheck size={14} /> Report Sent to Patient Profile
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Post-Consultation Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsReportModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#141b2d] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-emerald-500 text-white">
              <div>
                <h3 className="text-xl font-bold">Consultation Outcome Report</h3>
                <p className="text-xs text-white/80 font-medium">Sharing findings for {selectedApp?.patientName}</p>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={submitConsultationReport} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><User size={20} /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Patient</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedApp?.patientName}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2"><ClipboardCheck size={14} /> Clinical Findings & Summary</label>
                  <textarea
                    required
                    value={reportText}
                    onChange={e => setReportText(e.target.value)}
                    placeholder="Enter diagnosis, advice, and instructions for the patient profile..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm text-gray-900 dark:text-white h-48 resize-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsReportModalOpen(false)} className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">Discard</button>
                <button type="submit" disabled={isScheduling} className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                  {isScheduling ? <Loader2 size={18} className="animate-spin" /> : <><FileText size={18} /> Submit & Send Report</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#141b2d] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-emerald-500 text-white">
              <div>
                <h3 className="text-xl font-bold">Schedule New Appointment</h3>
                <p className="text-xs text-white/80 font-medium">Establish a new consultation slot</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Select Patient *</label>
                  <select
                    required
                    value={newApp.patientId}
                    onChange={e => setNewApp({ ...newApp, patientId: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm text-gray-900 dark:text-white"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id} className="text-gray-900 dark:text-white dark:bg-[#141b2d]">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date *</label>
                    <input required type="date" value={newApp.date} onChange={e => setNewApp({ ...newApp, date: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm text-gray-900 dark:text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Time Slot *</label>
                      <button type="button" onClick={() => setIsCustomTime(!isCustomTime)} className="text-[10px] font-bold text-emerald-500 hover:underline flex items-center gap-1"><Edit3 size={10} /> {isCustomTime ? 'List' : 'Custom'}</button>
                    </div>
                    {isCustomTime ? (
                      <input required type="time" value={newApp.customTime} onChange={e => setNewApp({ ...newApp, customTime: e.target.value })} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm text-gray-900 dark:text-white" />
                    ) : (
                      <select
                        required
                        value={newApp.time}
                        onChange={e => setNewApp({ ...newApp, time: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm text-gray-900 dark:text-white"
                      >
                        {hours.map(h => (
                          <option key={h} value={h} className="text-gray-900 dark:text-white dark:bg-[#141b2d]">{h}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Meeting Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setNewApp({ ...newApp, type: 'Online' })} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-xs transition-all ${newApp.type === 'Online' ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400' : 'bg-transparent border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400'}`}><Video size={16} /> Online</button>
                    <button type="button" onClick={() => setNewApp({ ...newApp, type: 'In-Person' })} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-xs transition-all ${newApp.type === 'In-Person' ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400' : 'bg-transparent border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400'}`}><MapPin size={16} /> In-Person</button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Meeting Notes</label>
                  <textarea value={newApp.notes} onChange={e => setNewApp({ ...newApp, notes: e.target.value })} placeholder="Describe visit purpose..." className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm text-gray-900 dark:text-white h-24 resize-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" disabled={isScheduling} className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">{isScheduling ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Confirm Meeting</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
