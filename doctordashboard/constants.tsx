
import { Patient, Activity, Appointment, RiskLevel, HistoryEvent } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Ananya Sharma',
    age: 42,
    gender: 'Female',
    risk: 'low',
    lastVisit: '2024-05-15',
    condition: 'Hypertension',
    vitals: { heartRate: 72, oxygen: 98, sleepScore: 85, stressLevel: 20 },
    contact: '+91 98765-43210',
    allergies: ['Penicillin', 'Peanuts'],
    image: 'https://picsum.photos/seed/ananya/200'
  },
  {
    id: '2',
    name: 'Rajesh Malhotra',
    age: 58,
    gender: 'Male',
    risk: 'high',
    lastVisit: '2024-05-20',
    condition: 'Type 2 Diabetes',
    vitals: { heartRate: 88, oxygen: 94, sleepScore: 45, stressLevel: 70 },
    contact: '+91 91234-56789',
    allergies: [],
    image: 'https://picsum.photos/seed/rajesh/200'
  },
  {
    id: '3',
    name: 'Isha Patel',
    age: 29,
    gender: 'Female',
    risk: 'medium',
    lastVisit: '2024-05-18',
    condition: 'Asthma',
    vitals: { heartRate: 78, oxygen: 96, sleepScore: 68, stressLevel: 45 },
    contact: '+91 99887-76655',
    allergies: ['Dust', 'Shellfish'],
    image: 'https://picsum.photos/seed/isha/200'
  },
  {
    id: '4',
    name: 'Vikram Deshmukh',
    age: 65,
    gender: 'Male',
    risk: 'critical',
    lastVisit: '2024-05-22',
    condition: 'Post-Op Recovery',
    vitals: { heartRate: 102, oxygen: 91, sleepScore: 30, stressLevel: 85 },
    contact: '+91 98200-11223',
    allergies: ['Latex'],
    image: 'https://picsum.photos/seed/vikram/200'
  }
];

export const MOCK_PATIENT_HISTORY: Record<string, HistoryEvent[]> = {
  '1': [
    { id: 'h1', type: 'appointment', date: 'May 22, 2024', title: 'Routine Follow-up', description: 'Monthly BP check and lifestyle review. Condition stable.', status: 'upcoming' },
    { id: 'h2', type: 'remark', date: 'May 15, 2024', title: 'Diagnosis Update', description: 'Patient shows consistent improvement. Lowered dosage of Telmisartan suggested for next month.' },
    { id: 'h3', type: 'prescription', date: 'May 10, 2024', title: 'Hypertension Regimen', description: 'Telmisartan 40mg - 1 Tab Morning, Amlodipine 5mg - 1 Tab Night.' },
    { id: 'h4', type: 'assignment', date: 'May 05, 2024', title: 'New Exercise Goal', description: 'Assigned 20 mins brisk walking, 4 days a week.' },
    { id: 'h5', type: 'ai_insight', date: 'May 01, 2024', title: 'HRV Anomaly', description: 'AI detected slightly elevated nocturnal HR. Doctor reviewed and found no acute concern.' },
  ]
};

export const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', patientName: 'Ananya Sharma', action: 'Uploaded Blood Lab Report', timestamp: '10 mins ago', type: 'report' },
  { id: '2', patientName: 'Dhruv Kapoor', action: 'Requested connection', timestamp: '45 mins ago', type: 'request' },
  { id: '3', patientName: 'Isha Patel', action: 'Submitted weekly diet log', timestamp: '2 hours ago', type: 'diet' },
  { id: '4', patientName: 'Rajesh Malhotra', action: 'Mood journal dip detected', timestamp: '3 hours ago', type: 'mood' }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', patientName: 'Ananya Sharma', time: '09:00 AM', type: 'Online', status: 'upcoming' },
  { id: '2', patientName: 'Rajesh Malhotra', time: '11:30 AM', type: 'In-Person', status: 'upcoming' },
  { id: '3', patientName: 'Isha Patel', time: '02:00 PM', type: 'Online', status: 'upcoming' }
];

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'bg-emerald-500/10 text-emerald-500',
  medium: 'bg-yellow-500/10 text-yellow-500',
  high: 'bg-orange-500/10 text-orange-500',
  critical: 'bg-red-500/10 text-red-500'
};
