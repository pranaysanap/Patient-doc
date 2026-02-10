"use client";

import { useRef } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Prescription } from "@/lib/prescriptions";
import { format } from "date-fns";

interface PdfViewerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    prescription: Prescription;
    title: string;
    // Keep legacy support
    pdfUrl?: string;
}

export function PdfViewerDialog({ open, onOpenChange, prescription, title }: PdfViewerDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!printRef.current) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <html><head><title>Prescription - ${prescription.doctorName}</title>
            <style>
                body { margin: 0; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; }
                @media print { body { padding: 0; } }
            </style>
            </head><body>${printRef.current.innerHTML}</body></html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
    };

    const handleDownloadPDF = async () => {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        const medicines = prescription.medicines || [];
        const dateStr = format(prescription.dateIssued, "dd/MM/yyyy");

        // ---- Header ----
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129);
        doc.text("VaidyaSetu", 10, 18);

        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.setFont("helvetica", "normal");
        doc.text("AI-Powered Healthcare Network", 10, 23);

        doc.setFontSize(8);
        doc.text("Apollo Specialty Hospitals", 150, 12);
        doc.text("Sector 12, Gurugram, India", 150, 16);
        doc.text("Tel: +91 0124 455 6677", 150, 20);
        doc.text("Email: care@vaidyasetu.ai", 150, 24);

        // Line
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.8);
        doc.line(10, 28, 200, 28);

        // Rx TITLE
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 50);
        doc.text("PRESCRIPTION", 82, 37);

        // Patient info box
        doc.setFillColor(245, 250, 248);
        doc.roundedRect(10, 42, 190, 22, 3, 3, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text("Patient:", 15, 50);
        doc.text("Diagnosis:", 15, 58);
        doc.text("Date:", 140, 50);
        doc.text("Rx ID:", 140, 58);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(30);
        doc.text(prescription.patientName || "—", 35, 50);
        doc.text(prescription.prescriptionType, 40, 58);
        doc.text(dateStr, 155, 50);
        doc.text(prescription.id.substring(0, 16), 155, 58);

        // ---- Medicine Table ----
        let y = 74;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);

        // Table header
        doc.setFillColor(16, 185, 129);
        doc.roundedRect(10, y - 5, 190, 8, 2, 2, "F");
        doc.text("MEDICINE", 14, y);
        doc.text("DOSAGE", 75, y);
        doc.text("SCHEDULE", 105, y);
        doc.text("TIMING", 145, y);
        doc.text("DURATION", 172, y);

        y += 8;
        doc.setTextColor(40);

        if (medicines.length > 0) {
            medicines.forEach((med, i) => {
                const isEven = i % 2 === 0;
                if (isEven) {
                    doc.setFillColor(250, 250, 252);
                    doc.rect(10, y - 4, 190, 10, "F");
                }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.text(med.name || "—", 14, y + 2);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text(med.dosage || "—", 75, y + 2);

                const sched = [];
                if (med.schedule?.morning) sched.push("Morning");
                if (med.schedule?.afternoon) sched.push("Afternoon");
                if (med.schedule?.night) sched.push("Night");
                doc.text(sched.join(", ") || "—", 105, y + 2);

                doc.text(`${med.food || "After"} Food`, 145, y + 2);
                doc.text(med.duration || "—", 172, y + 2);

                y += 10;
                if (y > 250) { doc.addPage(); y = 20; }
            });
        } else {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(140);
            doc.text("No medicines listed", 14, y + 2);
            y += 10;
        }

        // ---- Instructions ----
        if (prescription.notes) {
            y += 6;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(16, 185, 129);
            doc.text("INSTRUCTIONS & CLINICAL NOTES", 14, y);
            y += 6;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(60);
            const lines = doc.splitTextToSize(prescription.notes, 180);
            doc.text(lines, 14, y);
            y += lines.length * 4 + 6;
        }

        // ---- Footer / Signature ----
        const footerY = Math.max(y + 20, 230);

        doc.setDrawColor(200);
        doc.setLineWidth(0.3);
        doc.line(10, footerY - 8, 200, footerY - 8);

        // Signature
        doc.setFont("times", "italic");
        doc.setFontSize(18);
        doc.setTextColor(16, 40, 80);
        doc.text("Dr. Sujal Jadhav", 138, footerY + 2);

        doc.setDrawColor(80);
        doc.setLineWidth(0.4);
        doc.line(138, footerY + 4, 195, footerY + 4);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(50);
        doc.text("Dr. Sujal Jadhav", 138, footerY + 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text("General Physician", 138, footerY + 14);
        doc.text("Reg No: VS-2024-SJ-001", 138, footerY + 18);

        // Stamp-like seal
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.6);
        doc.circle(30, footerY + 8, 12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(16, 185, 129);
        doc.text("VAIDYASETU", 21, footerY + 6);
        doc.text("VERIFIED", 23, footerY + 10);
        doc.setFontSize(5);
        doc.text("DIGITAL RX", 23, footerY + 14);

        // Disclaimer
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        doc.setTextColor(160);
        doc.text("This is a digitally generated prescription via VaidyaSetu AI Healthcare Network. Verified electronically.", 10, footerY + 28);
        doc.text(`Generated on ${format(new Date(), 'PPP')} | Prescription ID: ${prescription.id}`, 10, footerY + 32);

        doc.save(`VaidyaSetu_Rx_${prescription.prescriptionType.replace(/\s+/g, '_')}_${format(prescription.dateIssued, 'yyyy-MM-dd')}.pdf`);
    };

    const medicines = prescription.medicines || [];
    const dateStr = format(prescription.dateIssued, "MMMM dd, yyyy");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 pt-5 pb-3 border-b flex-row items-center justify-between">
                    <div>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>View your prescription document below</DialogDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-1" /> Print
                        </Button>
                        <Button size="sm" onClick={handleDownloadPDF}>
                            <Download className="h-4 w-4 mr-1" /> Download PDF
                        </Button>
                    </div>
                </DialogHeader>

                {/* Rendered Prescription Document */}
                <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <div
                        ref={printRef}
                        className="max-w-[750px] mx-auto bg-white text-gray-900 shadow-xl rounded-lg overflow-hidden"
                        style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
                    >
                        {/* Green top bar */}
                        <div style={{ height: 6, background: 'linear-gradient(to right, #10b981, #14b8a6)' }} />

                        {/* Header */}
                        <div style={{ padding: '24px 32px 16px', borderBottom: '2px solid #10b981' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#10b981', margin: 0, letterSpacing: -1 }}>
                                        VaidyaSetu
                                    </h1>
                                    <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>
                                        AI-Powered Healthcare Network
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: 11, color: '#666', lineHeight: 1.6 }}>
                                    <strong style={{ color: '#333' }}>Apollo Specialty Hospitals</strong><br />
                                    Sector 12, Gurugram, India<br />
                                    Tel: +91 0124 455 6677<br />
                                    Email: care@vaidyasetu.ai
                                </div>
                            </div>
                        </div>

                        {/* PRESCRIPTION Title */}
                        <div style={{ textAlign: 'center', padding: '12px 0 8px', background: '#f8fffe' }}>
                            <span style={{
                                fontSize: 13,
                                fontWeight: 700,
                                letterSpacing: 4,
                                color: '#10b981',
                                textTransform: 'uppercase' as const,
                            }}>
                                &#8478; Digital Prescription
                            </span>
                        </div>

                        {/* Patient Info */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 12,
                            padding: '16px 32px',
                            background: '#fafbfc',
                            borderTop: '1px solid #eee',
                            borderBottom: '1px solid #eee',
                        }}>
                            <div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 1 }}>Patient</span>
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '2px 0 0' }}>
                                    {prescription.patientName || 'Patient'}
                                </p>
                            </div>
                            <div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 1 }}>Date Issued</span>
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '2px 0 0' }}>
                                    {dateStr}
                                </p>
                            </div>
                            <div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 1 }}>Diagnosis</span>
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '2px 0 0' }}>
                                    {prescription.prescriptionType}
                                </p>
                            </div>
                            <div>
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 1 }}>Prescription ID</span>
                                <p style={{ fontSize: 12, fontWeight: 500, color: '#666', margin: '2px 0 0', fontFamily: 'monospace' }}>
                                    {prescription.id}
                                </p>
                            </div>
                        </div>

                        {/* Medicines Table */}
                        <div style={{ padding: '20px 32px' }}>
                            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' as const, letterSpacing: 2, marginBottom: 12 }}>
                                &#128138; Prescribed Medications
                            </h3>

                            {medicines.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: '#10b981', color: 'white' }}>
                                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11 }}>#</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11 }}>Medicine</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11 }}>Dosage</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11 }}>Schedule</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11 }}>Timing</th>
                                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11 }}>Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicines.map((med, i) => {
                                            const sched = [];
                                            if (med.schedule?.morning) sched.push("Morning");
                                            if (med.schedule?.afternoon) sched.push("Afternoon");
                                            if (med.schedule?.night) sched.push("Night");
                                            return (
                                                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fffe', borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '10px 12px', color: '#999', fontWeight: 500 }}>{i + 1}</td>
                                                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1a1a2e' }}>{med.name || '—'}</td>
                                                    <td style={{ padding: '10px 12px', color: '#555' }}>{med.dosage || '—'}</td>
                                                    <td style={{ padding: '10px 12px', color: '#555' }}>{sched.join(', ') || '—'}</td>
                                                    <td style={{ padding: '10px 12px', color: '#555' }}>{med.food || 'After'} Food</td>
                                                    <td style={{ padding: '10px 12px', color: '#555' }}>{med.duration || '—'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic', textAlign: 'center', padding: 20 }}>
                                    No medicines listed for this prescription.
                                </p>
                            )}
                        </div>

                        {/* Instructions */}
                        {prescription.notes && (
                            <div style={{ padding: '0 32px 20px' }}>
                                <h3 style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' as const, letterSpacing: 2, marginBottom: 8 }}>
                                    &#128221; Instructions &amp; Clinical Notes
                                </h3>
                                <div style={{
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    borderLeft: '4px solid #10b981',
                                    borderRadius: 6,
                                    padding: '12px 16px',
                                    fontSize: 13,
                                    color: '#333',
                                    lineHeight: 1.6,
                                }}>
                                    {prescription.notes}
                                </div>
                            </div>
                        )}

                        {/* Signature & Footer */}
                        <div style={{
                            padding: '20px 32px 16px',
                            borderTop: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                        }}>
                            {/* Verified Stamp */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    border: '3px solid #10b981',
                                    display: 'flex',
                                    flexDirection: 'column' as const,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0.7,
                                    transform: 'rotate(-12deg)',
                                }}>
                                    <span style={{ fontSize: 9, fontWeight: 800, color: '#10b981', letterSpacing: 1 }}>VAIDYASETU</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981' }}>VERIFIED</span>
                                    <span style={{ fontSize: 7, color: '#10b981' }}>DIGITAL RX</span>
                                </div>
                            </div>

                            {/* Doctor Signature */}
                            <div style={{ textAlign: 'right' }}>
                                <p style={{
                                    fontFamily: "'Times New Roman', serif",
                                    fontSize: 26,
                                    fontStyle: 'italic',
                                    color: '#1a1a4e',
                                    margin: '0 0 4px',
                                    lineHeight: 1,
                                }}>
                                    Dr. Sujal Jadhav
                                </p>
                                <div style={{ width: 180, height: 1, background: '#666', marginLeft: 'auto', marginBottom: 6 }} />
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#333', margin: 0 }}>Dr. Sujal Jadhav</p>
                                <p style={{ fontSize: 10, color: '#777', margin: '1px 0' }}>General Physician</p>
                                <p style={{ fontSize: 10, color: '#777', margin: 0 }}>Reg No: VS-2024-SJ-001</p>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div style={{
                            padding: '10px 32px 14px',
                            borderTop: '1px solid #f0f0f0',
                            background: '#fafafa',
                        }}>
                            <p style={{ fontSize: 9, color: '#bbb', margin: 0, lineHeight: 1.5, textAlign: 'center' }}>
                                This is a digitally generated prescription via VaidyaSetu AI Healthcare Network.
                                Verified electronically — no physical signature required. | Generated on {format(new Date(), 'PPP')} | ID: {prescription.id}
                            </p>
                        </div>

                        {/* Green bottom bar */}
                        <div style={{ height: 4, background: 'linear-gradient(to right, #10b981, #14b8a6)' }} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
