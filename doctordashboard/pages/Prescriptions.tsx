
import React, { useState } from 'react';
import { Plus, Trash2, Download, Save, User, FileText, Pill, Loader2, Check, Sun, CloudSun, Moon } from 'lucide-react';
import { Patient, HistoryEvent } from '../types';
import { jsPDF } from 'jspdf';
import * as api from '../api';

interface Medicine {
  name: string;
  dosage: string;
  schedule: { morning: boolean; afternoon: boolean; night: boolean };
  food: 'Before' | 'After';
  duration: string;
}

interface PrescriptionProps {
  patients: Patient[];
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAddHistory: (patientId: string, event: Omit<HistoryEvent, 'id' | 'date'>) => void;
}

const Prescriptions: React.FC<PrescriptionProps> = ({ patients, notify, onAddHistory }) => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '1 Tab', schedule: { morning: true, afternoon: false, night: true }, food: 'After', duration: '7 days' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSave = async () => {
    if (!diagnosis) {
      notify('Please provide a primary diagnosis.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const patient = patients.find(p => p.id === selectedPatientId);
      // Save prescription to backend
      await api.createPrescription({
        patientId: selectedPatientId,
        patientName: patient?.name || '',
        diagnosis,
        medicines: medicines.map(m => ({
          name: m.name,
          dosage: m.dosage,
          schedule: m.schedule,
          food: m.food,
          duration: m.duration,
        })),
        instructions,
      });

      onAddHistory(selectedPatientId, {
        type: 'prescription',
        title: 'New Digital Rx Issued',
        description: `Prescribed ${medicines.length} medicines for ${diagnosis}. Instruction: ${instructions || 'Follow daily schedule.'}`,
        status: 'active'
      });
      setSaveSuccess(true);
      notify('Prescription saved to database and sent to patient.', 'success');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving prescription:', err);
      notify(err.message || 'Failed to save prescription.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateMedicine = (idx: number, field: keyof Medicine, value: any) => {
    const updated = [...medicines];
    updated[idx] = { ...updated[idx], [field]: value };
    setMedicines(updated);
  };

  const toggleSchedule = (idx: number, time: keyof Medicine['schedule']) => {
    const updated = [...medicines];
    updated[idx].schedule = { ...updated[idx].schedule, [time]: !updated[idx].schedule[time] };
    setMedicines(updated);
  };

  const handleDownloadPDF = async () => {
    if (!diagnosis) {
      notify('Please enter a diagnosis before downloading.', 'error');
      return;
    }
    setIsDownloading(true);
    try {
      const doc = new jsPDF();
      const patient = patients.find(p => p.id === selectedPatientId) || patients[0];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(16, 185, 129);
      doc.text("VaidyaSetu", 10, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text("Advanced AI-Powered Healthcare Network", 10, 26);

      doc.setFontSize(9);
      doc.text("Apollo Specialty Hospitals", 150, 15);
      doc.text("Sector 12, Gurugram, India", 150, 20);
      doc.text("Tel: +91 0124 455 6677", 150, 25);
      doc.text("Email: care@vaidyasetu.ai", 150, 30);

      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(10, 35, 200, 35);

      doc.setFillColor(245, 245, 245);
      doc.rect(10, 40, 190, 25, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`Patient Name:`, 15, 48);
      doc.text(`Diagnosis:`, 15, 58);

      doc.setFont("helvetica", "normal");
      doc.text(patient?.name || 'Unknown', 45, 48);
      doc.text(diagnosis, 45, 58);

      doc.setFont("helvetica", "bold");
      doc.text(`Age/Gender:`, 110, 48);
      doc.text(`Date:`, 110, 58);

      doc.setFont("helvetica", "normal");
      doc.text(`${patient?.age} Y / ${patient?.gender}`, 135, 48);
      doc.text(new Date().toLocaleDateString('en-GB'), 135, 58);

      let curY = 80;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129);
      doc.text("MEDICINE & DOSAGE", 10, curY);
      doc.text("M-A-N", 100, curY);
      doc.text("TIMING", 130, curY);
      doc.text("DURATION", 165, curY);

      curY += 3;
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.2);
      doc.line(10, curY, 200, curY);

      curY += 10;
      doc.setTextColor(60);
      doc.setFont("helvetica", "normal");

      medicines.forEach((med) => {
        const sched = `${med.schedule.morning ? '1' : '0'}-${med.schedule.afternoon ? '1' : '0'}-${med.schedule.night ? '1' : '0'}`;
        doc.setFont("helvetica", "bold");
        doc.text(med.name || '-', 10, curY);
        doc.setFont("helvetica", "normal");
        doc.text(sched, 100, curY);
        doc.text(`${med.food} Food`, 130, curY);
        doc.text(med.duration, 165, curY);
        curY += 5;
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`Dosage: ${med.dosage}`, 12, curY);
        curY += 8;
        doc.setFontSize(10);
        doc.setTextColor(60);
        if (curY > 250) {
          doc.addPage();
          curY = 20;
        }
      });

      if (instructions) {
        curY += 10;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100);
        doc.text("Clinical Notes & Instructions:", 10, curY);
        curY += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const splitInstructions = doc.splitTextToSize(instructions, 180);
        doc.text(splitInstructions, 10, curY);
        curY += (splitInstructions.length * 5) + 10;
      }

      const footerY = 240;
      doc.setDrawColor(230, 230, 230);
      doc.line(10, footerY - 5, 200, footerY - 5);

      // Handwritten Signature Simulation (consistent with Reports page)
      doc.setFont("times", "italic");
      doc.setFontSize(16);
      doc.setTextColor(10, 15, 29);
      doc.text("Arjun Mehra", 140, footerY + 10);

      doc.setDrawColor(100);
      doc.setLineWidth(0.5);
      doc.line(140, footerY + 12, 190, footerY + 12);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text("Dr. Arjun Mehra", 140, footerY + 18);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Chief Cardiologist", 140, footerY + 22);
      doc.text("Reg ID: VS-2024-AM-01", 140, footerY + 26);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text("This is a digitally generated prescription through VaidyaSetu AI Healthcare Network.", 10, footerY + 35);
      doc.text("No physical signature is required for digital verification.", 10, footerY + 39);
      doc.save(`VaidyaSetu_Rx_${patient?.name.replace(/\s/g, '_')}_${new Date().getTime()}.pdf`);
      notify('Professional prescription downloaded.', 'success');
    } catch (err) {
      console.error(err);
      notify('Failed to generate professional PDF.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Digital Prescription</h2>
          <p className="text-gray-400 text-sm">Issue structured clinical guidance and medication</p>
        </div>
        <div className="flex gap-3">
          <button disabled={isDownloading} onClick={handleDownloadPDF} className="flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
            {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />} PDF
          </button>
          <button disabled={isSaving} onClick={handleSave} className={`flex items-center gap-2 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${saveSuccess ? 'bg-emerald-600' : 'bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95'}`}>
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : saveSuccess ? <Check size={18} /> : <><Save size={18} /> Save & Send</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-[#141b2d] rounded-2xl border border-gray-100 dark:border-white/5 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Select Patient</label>
              <div className="relative">
                <select
                  className="w-full bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm appearance-none focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-900 dark:text-white"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id} className="text-gray-900 dark:text-white dark:bg-[#141b2d]">
                      {p.name}
                    </option>
                  ))}
                </select>
                <User size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Primary Diagnosis</label>
              <input
                type="text"
                className="w-full bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/20 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-gray-900 dark:text-white"
                placeholder="e.g. Chronic Hypertension with Mild Arrhythmia"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141b2d] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Pill className="text-emerald-500" size={18} /> Medication Table</h3>
            <button onClick={() => setMedicines([...medicines, { name: '', dosage: '1 Tab', schedule: { morning: true, afternoon: false, night: false }, food: 'After', duration: '7 days' }])} className="text-emerald-500 text-xs font-bold flex items-center gap-1.5 hover:underline">
              <Plus size={16} /> Add Medicine
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {medicines.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-[2fr_1fr_1.2fr_1.2fr_1fr_50px] gap-4 px-6 py-4 items-center group hover:bg-emerald-500/[0.02] transition-colors">
                    <div>
                      <input
                        className="w-full bg-transparent border-none outline-none text-sm font-medium focus:text-emerald-500 transition-colors text-gray-900 dark:text-white"
                        placeholder="Medicine Name (e.g. Metformin 500mg)"
                        value={med.name}
                        onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        className="w-full bg-transparent border-none outline-none text-sm focus:text-emerald-500 transition-colors text-gray-900 dark:text-white"
                        placeholder="Dosage (e.g. 1 Tab)"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-center">
                      <div className="flex bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-1 gap-1 w-32">
                        <button
                          onClick={() => toggleSchedule(idx, 'morning')}
                          className={`flex-1 py-1 rounded-lg flex items-center justify-center transition-all ${med.schedule.morning ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-emerald-500'}`}
                        >
                          <Sun size={14} />
                        </button>
                        <button
                          onClick={() => toggleSchedule(idx, 'afternoon')}
                          className={`flex-1 py-1 rounded-lg flex items-center justify-center transition-all ${med.schedule.afternoon ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-emerald-500'}`}
                        >
                          <CloudSun size={14} />
                        </button>
                        <button
                          onClick={() => toggleSchedule(idx, 'night')}
                          className={`flex-1 py-1 rounded-lg flex items-center justify-center transition-all ${med.schedule.night ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-emerald-500'}`}
                        >
                          <Moon size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="flex bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-1 gap-1 w-32">
                        <button onClick={() => updateMedicine(idx, 'food', 'Before')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${med.food === 'Before' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-emerald-500'}`}>Before</button>
                        <button onClick={() => updateMedicine(idx, 'food', 'After')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${med.food === 'After' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-emerald-500'}`}>After</button>
                      </div>
                    </div>
                    <div>
                      <input
                        className="w-full bg-transparent border-none outline-none text-sm focus:text-emerald-500 transition-colors text-gray-900 dark:text-white"
                        placeholder="Duration (e.g. 7 days)"
                        value={med.duration}
                        onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => setMedicines(medicines.filter((_, i) => i !== idx))} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#141b2d] rounded-2xl border border-gray-100 dark:border-white/5 p-6 shadow-sm space-y-4">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> Additional Instructions & Clinical Notes</label>
          <textarea
            className="w-full bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/20 rounded-2xl p-4 text-sm min-h-[100px] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none text-gray-900 dark:text-white"
            placeholder="e.g. Avoid high-sodium diet..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
