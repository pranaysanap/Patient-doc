// Mock prescription data structure
export interface Prescription {
    id: string;
    doctorName: string;
    prescriptionType: string;
    dateIssued: Date;
    pdfUrl: string;
    notes?: string;
}

// Mock prescription data - this will be replaced with API calls later
export const mockPrescriptions: Prescription[] = [
    {
        id: "1",
        doctorName: "Dr. Sujal Jadhav",
        prescriptionType: "General Consultation",
        dateIssued: new Date("2026-02-08"),
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        notes: "Follow-up after 2 weeks"
    },
    {
        id: "2",
        doctorName: "Dr. Sujal Jadhav",
        prescriptionType: "Cardiac Check-up",
        dateIssued: new Date("2026-02-05"),
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        notes: "Continue medication as prescribed"
    },
    {
        id: "3",
        doctorName: "Dr. Sujal Jadhav",
        prescriptionType: "Skin Treatment",
        dateIssued: new Date("2026-01-28"),
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
    {
        id: "4",
        doctorName: "Dr. Sujal Jadhav",
        prescriptionType: "Vaccination Report",
        dateIssued: new Date("2026-01-15"),
        pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        notes: "Next vaccination due in 3 months"
    }
];

// Helper function to get all prescriptions
export const getPrescriptions = (): Prescription[] => {
    // Sort by date (newest first)
    return mockPrescriptions.sort((a, b) => b.dateIssued.getTime() - a.dateIssued.getTime());
};

// Helper function to download prescription PDF
export const downloadPrescription = (prescription: Prescription) => {
    const link = document.createElement('a');
    link.href = prescription.pdfUrl;
    link.download = `prescription-${prescription.doctorName.replace(/\s+/g, '-')}-${prescription.dateIssued.toISOString().split('T')[0]}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
