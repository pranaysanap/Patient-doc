
import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX, Info, Clipboard, Loader2, Check } from 'lucide-react';
import { Patient, HistoryEvent, RiskLevel } from '../types';
import * as api from '../api';

interface RequestsProps {
  onAddPatient: (patient: Patient) => void;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAddHistory: (patientId: string, event: Omit<HistoryEvent, 'id' | 'date'>) => void;
}

interface PendingRequest {
  id: string;
  patientId: string;
  name: string;
  age: number;
  condition: string;
  summary: string;
  date: string;
  email: string;
}

const Requests: React.FC<RequestsProps> = ({ onAddPatient, notify, onAddHistory }) => {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);

  // Load pending requests from backend
  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        setIsLoadingRequests(true);
        const response = await api.fetchPendingPatients();
        const transformed: PendingRequest[] = response.data.map((p: any) => ({
          id: p.patientId,
          patientId: p.patientId,
          name: p.personalInfo.name,
          age: p.personalInfo.age || 0,
          condition: p.medicalInfo?.chronicConditions?.[0] || 'General Checkup',
          summary: p.medicalInfo?.chronicConditions?.length
            ? `Patient has: ${p.medicalInfo.chronicConditions.join(', ')}. ${p.medicalInfo.allergies?.length ? 'Allergies: ' + p.medicalInfo.allergies.join(', ') : 'No known allergies.'}`
            : 'New patient seeking connection. No medical history provided yet.',
          date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          email: p.personalInfo.email,
        }));
        setRequests(transformed);
      } catch (err: any) {
        console.error('Error loading pending requests:', err);
        // Keep showing empty state if backend fails
      } finally {
        setIsLoadingRequests(false);
      }
    };
    loadPendingRequests();
  }, []);

  const handleAction = async (req: PendingRequest, type: 'approve' | 'decline') => {
    setProcessingId(req.id);

    try {
      const newStatus = type === 'approve' ? 'connected' : 'rejected';
      await api.updatePatientConnectionStatus(req.patientId, newStatus);

      if (type === 'approve') {
        setApprovedIds(prev => [...prev, req.id]);

        const newPatient: Patient = {
          id: req.patientId,
          name: req.name,
          age: req.age,
          gender: 'Other',
          risk: 'low' as RiskLevel,
          lastVisit: new Date().toISOString().split('T')[0],
          condition: req.condition,
          vitals: {
            heartRate: 72,
            oxygen: 98,
            sleepScore: 80,
            stressLevel: 25
          },
          contact: req.email || 'N/A',
          allergies: [],
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.name)}&background=10b981&color=fff`
        };

        onAddPatient(newPatient);
        onAddHistory(newPatient.id, {
          type: 'remark',
          title: 'Patient Onboarded',
          description: `VaidyaSetu Connection Approved. Clinical monitoring initialized for ${req.name}.`,
          status: 'active'
        });
        notify(`Patient ${req.name} connected successfully!`, 'success');
      } else {
        notify(`Connection request from ${req.name} declined.`, 'info');
      }

      setTimeout(() => {
        setRequests(prev => prev.filter(r => r.id !== req.id));
        setProcessingId(null);
      }, 500);
    } catch (err: any) {
      console.error('Error processing request:', err);
      notify(err.message || 'Failed to process request.', 'error');
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Connection Requests</h2>
          <p className="text-gray-400 text-sm">Review patients asking to join your VaidyaSetu network</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/20">
          {requests.length} Pending
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#141b2d] rounded-3xl border border-dashed border-white/5 text-gray-500">
          <UserPlus size={48} className="mb-4 opacity-10" />
          <p className="font-bold">All caught up!</p>
          <p className="text-sm">No new connection requests to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`bg-white dark:bg-[#141b2d] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 flex flex-col hover:border-emerald-500/30 transition-all duration-500
                ${approvedIds.includes(req.id) ? 'opacity-0 scale-95 translate-y-4 pointer-events-none' : 'opacity-100 scale-100'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <UserPlus size={24} />
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{req.date}</span>
              </div>

              <h3 className="text-xl font-bold">{req.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{req.age} Yrs • {req.condition}</p>

              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl flex-1 mb-6">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase mb-2">
                  <Clipboard size={12} /> Health Summary
                </div>
                <p className="text-xs text-gray-400 leading-relaxed italic">
                  {req.summary}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    disabled={!!processingId}
                    onClick={() => handleAction(req, 'approve')}
                    className={`flex-1 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95
                      ${processingId === req.id ? 'bg-emerald-600' : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'}`}
                  >
                    {processingId === req.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : approvedIds.includes(req.id) ? (
                      <Check size={16} className="animate-in zoom-in" />
                    ) : (
                      <>
                        <UserCheck size={16} /> Approve
                      </>
                    )}
                  </button>
                  <button
                    disabled={!!processingId}
                    onClick={() => handleAction(req, 'decline')}
                    className="flex-1 bg-red-500/10 text-red-500 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <UserX size={16} /> Decline
                  </button>
                </div>
                <button className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2 active:scale-95">
                  <Info size={16} /> View Basic Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
