import { fetchMyPrescriptions, getToken } from './api';

// Prescription interface used by the patient UI
export interface Prescription {
    id: string;
    doctorName: string;
    prescriptionType: string;
    dateIssued: Date;
    pdfUrl: string;
    notes?: string;
    patientName?: string;
    // Extended fields from backend
    medicines?: Array<{
        name: string;
        dosage: string;
        schedule: { morning: boolean; afternoon: boolean; night: boolean };
        food: string;
        duration: string;
    }>;
    status?: string;
}

// Mock prescription data - fallback when backend is unavailable
const mockPrescriptions: Prescription[] = [
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

// Fetch prescriptions from backend, with fallback to mock data
export const getPrescriptions = (): Prescription[] => {
    // This is the synchronous version (used by the existing UI)
    // For backend data, use getPrescriptionsAsync()
    return mockPrescriptions.sort((a, b) => b.dateIssued.getTime() - a.dateIssued.getTime());
};

// Async version that fetches from backend
export const getPrescriptionsAsync = async (): Promise<Prescription[]> => {
    try {
        // Only try backend if we have a token
        if (!getToken()) {
            return getPrescriptions();
        }

        const response = await fetchMyPrescriptions();

        if (response.success && response.data && response.data.length > 0) {
            // Get patient name from localStorage / session
            const storedPatient = localStorage.getItem('vaidyasetu_patient');
            let patientName = 'Patient';
            if (storedPatient) {
                try { patientName = JSON.parse(storedPatient).name || 'Patient'; } catch {}
            }
            // Fallback: try NextAuth session name
            if (patientName === 'Patient') {
                try {
                    const sessionStr = document.cookie
                        .split('; ')
                        .find(c => c.startsWith('next-auth.session-token'));
                    // Also check localStorage for the user's Google name
                    const keys = Object.keys(localStorage);
                    for (const key of keys) {
                        if (key.includes('nextauth') || key.includes('session')) {
                            try {
                                const val = JSON.parse(localStorage.getItem(key) || '');
                                if (val?.user?.name) { patientName = val.user.name; break; }
                            } catch {}
                        }
                    }
                } catch {}
            }

            return response.data.map((rx: any) => ({
                id: rx.prescriptionId || rx._id,
                doctorName: rx.doctorName || 'Dr. Sujal Jadhav',
                prescriptionType: rx.diagnosis || 'General Consultation',
                dateIssued: new Date(rx.issuedDate),
                pdfUrl: rx.pdfUrl || '',
                notes: rx.instructions || '',
                patientName: rx.patientName || patientName,
                medicines: rx.medicines || [],
                status: rx.status,
            }));
        }

        // Fallback to mock if no backend prescriptions found
        return getPrescriptions();
    } catch (err) {
        console.error('Failed to fetch prescriptions from backend:', err);
        return getPrescriptions();
    }
};

// Helper function to download prescription PDF
export const downloadPrescription = (prescription: Prescription) => {
    if (!prescription.pdfUrl) {
        console.warn('No PDF URL available for this prescription');
        return;
    }
    const link = document.createElement('a');
    link.href = prescription.pdfUrl;
    link.download = `prescription-${prescription.doctorName.replace(/\s+/g, '-')}-${prescription.dateIssued.toISOString().split('T')[0]}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
