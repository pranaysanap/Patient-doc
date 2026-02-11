
import React, { useState, useMemo } from 'react';
import { FileText, Search, Download, CheckCircle2, Loader2, AlertCircle, Eye, Clock, Calendar, X, User, FileSearch, ShieldCheck } from 'lucide-react';
import { HistoryEvent } from '../types';
import { jsPDF } from 'jspdf';

interface ReportProps {
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAddHistory: (patientId: string, event: Omit<HistoryEvent, 'id' | 'date'>) => void;
}

type ReportStatus = 'Awaiting' | 'Reviewed' | 'Urgent';

interface ReportData {
  id: string;
  patientId: string;
  name: string;
  patient: string;
  date: string; // ISO format for sorting
  displayDate: string;
  size: string;
  type: string;
  status: ReportStatus;
}

const Reports: React.FC<ReportProps> = ({ notify, onAddHistory }) => {
  const [reports, setReports] = useState<ReportData[]>([
    { 
      id: '1', 
      patientId: '1', 
      name: 'Comprehensive Metabolic Panel', 
      patient: 'Ananya Sharma', 
      date: '2024-05-22T10:30:00Z', 
      displayDate: 'May 22, 10:30 AM',
      size: '2.4 MB', 
      type: 'PDF', 
      status: 'Awaiting'
    },
    { 
      id: '2', 
      patientId: '4', 
      name: 'Cardiac MRI Contrast Scan', 
      patient: 'Vikram Deshmukh', 
      date: '2024-05-22T08:15:00Z', 
      displayDate: 'May 22, 08:15 AM',
      size: '45.1 MB', 
      type: 'DICOM', 
      status: 'Urgent'
    },
    { 
      id: '3', 
      patientId: '2', 
      name: 'Lipid Profile & LDL/HDL', 
      patient: 'Rajesh Malhotra', 
      date: '2024-05-21T16:45:00Z', 
      displayDate: 'May 21, 04:45 PM',
      size: '1.1 MB', 
      type: 'PDF', 
      status: 'Reviewed'
    },
    { 
      id: '4', 
      patientId: '3', 
      name: 'Pulmonary Function Test', 
      patient: 'Isha Patel', 
      date: '2024-05-22T11:00:00Z', 
      displayDate: 'May 22, 11:00 AM',
      size: '3.2 MB', 
      type: 'PDF', 
      status: 'Awaiting'
    },
  ]);

  const [activeTab, setActiveTab] = useState<ReportStatus>('Awaiting');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const sortedReports = useMemo(() => {
    return [...reports]
      .filter(r => r.status === activeTab)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reports, activeTab]);

  const generateReportPDF = async (report: ReportData) => {
    const doc = new jsPDF();
    
    // Header Branding
    doc.setFillColor(10, 15, 29); // Dark navy
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("VAIDYASETU", 15, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text("PRECISION AI HEALTHCARE NETWORK", 15, 28);
    
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.text("Ref ID: " + report.id + "-" + Math.random().toString(36).substr(2, 5).toUpperCase(), 150, 15);
    doc.text("Generated: " + new Date().toLocaleString(), 150, 20);
    doc.text("Clinic: Apollo Specialty, Gurugram", 150, 25);

    // Patient Information Block
    doc.setFillColor(245, 248, 250);
    doc.rect(15, 50, 180, 35, 'F');
    
    doc.setTextColor(10, 15, 29);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT INFORMATION", 20, 58);
    
    doc.setFont("helvetica", "normal");
    doc.text("Name: " + report.patient, 20, 68);
    doc.text("Patient UID: VS-PX-" + report.patientId.padStart(4, '0'), 20, 75);
    
    doc.text("Report Date: " + report.displayDate, 110, 68);
    doc.text("Status: " + report.status, 110, 75);

    // Main Content
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(10, 15, 29);
    doc.text("CLINICAL FINDINGS: " + report.name.toUpperCase(), 15, 100);
    
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(15, 105, 195, 105);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    
    const findings = report.name.toLowerCase().includes('cardiac') 
      ? [
          "1. Left ventricular ejection fraction (LVEF) is calculated at 62%, within the lower normal limit.",
          "2. Trace mitral regurgitation noted without hemodynamic significance.",
          "3. No significant pericardial effusion or evidence of intracardiac thrombus.",
          "4. AI Analysis: Consistent with post-recovery baseline. No immediate intervention required."
        ]
      : report.name.toLowerCase().includes('metabolic')
      ? [
          "1. Glucose levels (Fasting): 98 mg/dL (Normal: 70-100 mg/dL).",
          "2. Blood Urea Nitrogen (BUN): 14 mg/dL (Normal: 7-20 mg/dL).",
          "3. Creatinine: 0.9 mg/dL (Normal: 0.7-1.3 mg/dL).",
          "4. Sodium/Potassium Electrolyte Balance: Stable.",
          "5. Conclusion: Metabolic profile indicates stable organ function."
        ]
      : [
          "1. Initial diagnostic scan shows no acute abnormalities in the primary region of interest.",
          "2. Secondary biomarkers are consistent with the patient's existing longitudinal history.",
          "3. Recommendation: Continue current therapeutic regimen and monitor for symptomatic changes.",
          "4. Follow-up: Re-evaluate in 3 months or per clinical necessity."
        ];

    let yPos = 115;
    findings.forEach(line => {
      const splitText = doc.splitTextToSize(line, 175);
      doc.text(splitText, 20, yPos);
      yPos += (splitText.length * 7);
    });

    // Sign off - Signature Block
    doc.setDrawColor(200, 200, 200);
    doc.line(130, 240, 190, 240);
    
    // Doctor's "Handwritten" Signature Simulation using Times Italic
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(10, 15, 29);
    doc.text("Arjun Mehra", 140, 235); // Above the line
    
    // Official Designation
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Dr. Arjun Mehra", 130, 248);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Chief Cardiologist", 130, 253);
    doc.text("Reg ID: VS-2024-AM-01", 130, 258);

    // Footer Disclaimer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const disclaimer = "CONFIDENTIAL: This document contains protected health information (PHI) and is intended solely for clinical review. HIPAA compliance requires secure handling and storage of this document. Digital signature verified by VaidyaSetu AI Network.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 180);
    doc.text(splitDisclaimer, 15, 275);

    // Final Save
    doc.save(`VaidyaSetu_Report_${report.patient.replace(/\s/g, '_')}_${report.id}.pdf`);
  };

  const handleDownload = async (report: ReportData) => {
    if (processingId) return;
    
    setProcessingId(report.id);
    notify(`Generating clinical PDF for ${report.patient}...`, 'info');
    
    // Small delay to simulate "work" for the UI spinner
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      await generateReportPDF(report);
      
      onAddHistory(report.patientId, {
        type: 'report',
        title: 'Official Report Generated',
        description: `Clinician generated and downloaded a formal clinical PDF for: "${report.name}".`,
      });

      notify(`Secure PDF Downloaded successfully.`, 'success');
    } catch (err) {
      notify(`Failed to generate report. Please try again.`, 'error');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewReport = (report: ReportData) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const markAsReviewed = (reportId: string, pId: string, pName: string, rName: string) => {
    setProcessingId(reportId);
    setTimeout(() => {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'Reviewed' as ReportStatus } : r));
      onAddHistory(pId, {
        type: 'report',
        title: 'Report Reviewed',
        description: `Clinically reviewed "${rName}" for patient ${pName}. Moved to archive.`,
      });
      notify(`"${rName}" marked as reviewed.`, 'success');
      setProcessingId(null);
      if (selectedReport?.id === reportId) setIsViewModalOpen(false);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Clinical Data Repository</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Manage and review patient diagnostic reports</p>
        </div>
        
        <div className="flex bg-white dark:bg-[#141b2d] rounded-xl p-1 border border-gray-100 dark:border-white/5 shadow-sm">
          {(['Awaiting', 'Urgent', 'Reviewed'] as ReportStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all relative
                ${activeTab === tab 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-gray-500 hover:text-emerald-500'}`}
            >
              {tab}
              {tab !== 'Reviewed' && reports.filter(r => r.status === tab).length > 0 && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] border-2 border-[#0a0f1d]
                  ${tab === 'Urgent' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                  {reports.filter(r => r.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {sortedReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#141b2d] rounded-3xl border border-dashed border-white/5 text-gray-500">
              <FileSearch size={48} className="mb-4 opacity-10" />
              <p className="font-bold text-lg text-gray-400">Clear Queue</p>
              <p className="text-sm">No {activeTab.toLowerCase()} reports to review at this time.</p>
            </div>
          ) : (
            sortedReports.map((report) => (
              <div 
                key={report.id} 
                className={`bg-white dark:bg-[#141b2d] rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden
                  ${processingId === report.id ? 'opacity-50 pointer-events-none' : 'opacity-100'}
                  ${selectedReport?.id === report.id ? 'ring-2 ring-emerald-500 border-transparent' : ''}`}
                onClick={() => handleViewReport(report)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 
                      ${report.status === 'Urgent' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-white">{report.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="font-bold text-emerald-500 uppercase tracking-wider">{report.patient}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {report.displayDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReport(report);
                      }}
                      className="flex items-center gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(report);
                      }}
                      title="Secure Download"
                      className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-emerald-500 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-90"
                    >
                      {processingId === report.id ? <Loader2 size={16} className="animate-spin text-emerald-500" /> : <Download size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-[#141b2d] rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl p-8 flex flex-col min-h-[400px]">
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 shadow-inner">
                <ShieldCheck size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security & Protocol</h3>
                <p className="text-xs text-gray-400 mt-2 px-4 leading-relaxed">
                  All diagnostic files are encrypted. Access is logged for HIPAA compliance. Select a report to preview and initiate secure download.
                </p>
              </div>
              <div className="w-full pt-4 space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] font-bold text-gray-500 uppercase flex items-center justify-between">
                   <span>Server Status</span>
                   <span className="text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Operational</span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] font-bold text-gray-500 uppercase flex items-center justify-between">
                   <span>Storage Node</span>
                   <span className="text-gray-900 dark:text-white">AS-SOUTH-12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report View Modal */}
      {isViewModalOpen && selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setIsViewModalOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-[#0a0f1d] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/5">
            <div className={`p-10 border-b border-gray-200 dark:border-white/5 flex items-center justify-between text-white ${selectedReport.status === 'Urgent' ? 'bg-gradient-to-r from-red-600 to-rose-500' : 'bg-gradient-to-r from-emerald-600 to-teal-500'}`}>
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <FileText size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{selectedReport.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/80 font-bold uppercase tracking-widest">{selectedReport.patient}</span>
                    <span className="w-1 h-1 rounded-full bg-white/40"></span>
                    <span className="text-xs text-white/80 font-bold uppercase tracking-widest">{selectedReport.displayDate}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="p-3 hover:bg-white/20 rounded-2xl transition-colors active:scale-90"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                   <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Patient Profile</p>
                   <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <User size={16} className="text-emerald-500" />
                     {selectedReport.patient}
                   </p>
                </div>
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                   <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Secure Metadata</p>
                   <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <Clock size={16} className="text-blue-500" />
                     {selectedReport.type} • {selectedReport.size}
                   </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest flex items-center gap-2">
                   <AlertCircle size={14} className="text-emerald-500" />
                   Review Status & Priority
                </h4>
                <div className="flex gap-4">
                  <div className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedReport.status === 'Urgent' ? 'bg-red-500 text-white border-red-500' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                    {selectedReport.status} Priority
                  </div>
                  {selectedReport.status !== 'Reviewed' && (
                    <button 
                      onClick={() => markAsReviewed(selectedReport.id, selectedReport.patientId, selectedReport.patient, selectedReport.name)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/10 text-gray-500 hover:text-emerald-500 hover:border-emerald-500/40 transition-all flex items-center gap-2"
                    >
                      {processingId === selectedReport.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Mark as Reviewed
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest flex items-center gap-2">
                   <FileText size={14} className="text-emerald-500" />
                   Quick Observation Summary
                </h4>
                <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    This document represents the official diagnostic findings for {selectedReport.patient}. 
                    Preliminary AI triage suggests the findings are consistent with the current treatment plan. 
                    Please review the detailed {selectedReport.type} file for comprehensive biomarkers and spatial data.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-gray-200 dark:border-white/5 flex gap-4 bg-gray-50/50 dark:bg-white/[0.02]">
              <button 
                onClick={() => handleDownload(selectedReport)}
                className="flex-[2] py-5 rounded-[1.5rem] bg-emerald-500 text-white font-bold text-base hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {processingId === selectedReport.id ? <Loader2 className="animate-spin" size={24} /> : <><Download size={24} /> Download Secure File</>}
              </button>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 py-5 rounded-[1.5rem] bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white font-bold text-base hover:bg-gray-300 dark:hover:bg-white/20 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
