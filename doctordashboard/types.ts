
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  risk: RiskLevel;
  lastVisit: string;
  condition: string;
  vitals: {
    heartRate: number;
    oxygen: number;
    sleepScore: number;
    stressLevel: number;
  };
  contact: string;
  allergies: string[];
  image: string;
}

export type HistoryEventType = 'prescription' | 'appointment' | 'remark' | 'assignment' | 'ai_insight' | 'diet' | 'report' | 'consultation';

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  date: string;
  title: string;
  description: string;
  status?: string;
  attachment?: string; // For downloadable reports
}

export interface Appointment {
  id: string;
  patientId?: string; // Added to link to patients
  patientName: string;
  time: string;
  type: 'Online' | 'In-Person';
  status: 'upcoming' | 'completed' | 'cancelled';
  meetingLink?: string;
}

export interface Activity {
  id: string;
  patientName: string;
  action: string;
  timestamp: string;
  type: 'report' | 'request' | 'diet' | 'mood';
}

export enum View {
  Dashboard = 'dashboard',
  Patients = 'patients',
  PatientDetail = 'patient-detail',
  Requests = 'requests',
  Prescriptions = 'prescriptions',
  Reports = 'reports',
  DietApprovals = 'diet-approvals',
  Wellness = 'wellness',
  Schedule = 'schedule',
  Notifications = 'notifications'
}
