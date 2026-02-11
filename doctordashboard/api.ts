/**
 * API Client for VaidyaSetu Backend
 * Handles all HTTP requests to the backend server
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

// Helper to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
};

// Auth APIs
export const doctorLogin = async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/doctor/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(error.error || 'Authentication failed');
    }

    const data = await response.json();

    // Store token in localStorage
    if (data.token) {
        localStorage.setItem('authToken', data.token);
    }

    return data;
};

// Patient APIs
export const fetchPatients = async () => {
    return fetchWithAuth(`${API_BASE_URL}/patients`);
};

export const fetchPatientById = async (patientId: string) => {
    return fetchWithAuth(`${API_BASE_URL}/patients/${patientId}`);
};

export const updatePatient = async (patientId: string, data: any) => {
    return fetchWithAuth(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const updatePatientConnectionStatus = async (
    patientId: string,
    connectionStatus: 'pending' | 'connected' | 'rejected'
) => {
    return fetchWithAuth(`${API_BASE_URL}/patients/${patientId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ connectionStatus }),
    });
};

// Appointment APIs
export const fetchAppointments = async (params?: { status?: string; startDate?: string; endDate?: string }) => {
    let url = `${API_BASE_URL}/appointments/doctor`;
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
    return fetchWithAuth(url);
};

export const createAppointment = async (appointmentData: any) => {
    return fetchWithAuth(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        body: JSON.stringify(appointmentData),
    });
};

export const updateAppointmentStatus = async (
    appointmentId: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
) => {
    return fetchWithAuth(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
};

export const addConsultationReport = async (
    appointmentId: string,
    report: { findings: string; recommendations?: string; followUpRequired?: boolean; followUpDate?: string }
) => {
    return fetchWithAuth(`${API_BASE_URL}/appointments/${appointmentId}/report`, {
        method: 'PUT',
        body: JSON.stringify(report),
    });
};

// Health Metrics APIs
export const fetchHealthMetrics = async (patientId: string) => {
    return fetchWithAuth(`${API_BASE_URL}/health-metrics/${patientId}/latest`);
};

export const fetchHealthMetricsHistory = async (patientId: string, limit?: number) => {
    let url = `${API_BASE_URL}/health-metrics/${patientId}/history`;
    if (limit) url += `?limit=${limit}`;
    return fetchWithAuth(url);
};

// Prescription APIs
export const fetchPrescriptions = async () => {
    return fetchWithAuth(`${API_BASE_URL}/prescriptions/doctor`);
};

export const fetchPrescriptionsByPatient = async (patientId: string) => {
    return fetchWithAuth(`${API_BASE_URL}/prescriptions/patient/${patientId}`);
};

export const createPrescription = async (prescriptionData: any) => {
    return fetchWithAuth(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        body: JSON.stringify(prescriptionData),
    });
};

export const updatePrescriptionStatus = async (
    prescriptionId: string,
    status: 'active' | 'completed' | 'discontinued'
) => {
    return fetchWithAuth(`${API_BASE_URL}/prescriptions/${prescriptionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
};

// Patient connection request APIs
export const fetchPendingPatients = async () => {
    return fetchWithAuth(`${API_BASE_URL}/patients/pending`);
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getAuthToken();
};

// Utility function to logout
export const logout = () => {
    localStorage.removeItem('authToken');
};

// Get current user info
export const getCurrentUser = async () => {
    return fetchWithAuth(`${API_BASE_URL}/auth/me`);
};
