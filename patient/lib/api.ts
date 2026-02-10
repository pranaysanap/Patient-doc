/**
 * API Client for VaidyaSetu Patient Dashboard
 * Connects to the backend server at localhost:5000
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Token management
let authToken: string | null = null;

export const setToken = (token: string) => {
    authToken = token;
    if (typeof window !== 'undefined') {
        localStorage.setItem('vaidyasetu_token', token);
    }
};

export const getToken = (): string | null => {
    if (authToken) return authToken;
    if (typeof window !== 'undefined') {
        authToken = localStorage.getItem('vaidyasetu_token');
    }
    return authToken;
};

export const clearToken = () => {
    authToken = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('vaidyasetu_token');
        localStorage.removeItem('vaidyasetu_patient');
    }
};

// Store patient info
export const setPatientInfo = (patient: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('vaidyasetu_patient', JSON.stringify(patient));
    }
};

export const getPatientInfo = (): any | null => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('vaidyasetu_patient');
        if (stored) return JSON.parse(stored);
    }
    return null;
};

// Authenticated fetch helper
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
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

// ==================== AUTH ====================

/**
 * Register/login patient with NextAuth session data.
 * Called after Google Sign-In to sync patient with backend.
 */
export const registerPatient = async (userData: { name: string; email: string; image?: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/patient/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(error.error || 'Failed to register with backend');
    }

    const data = await response.json();

    if (data.token) {
        setToken(data.token);
    }
    if (data.user) {
        setPatientInfo(data.user);
    }

    return data;
};

/**
 * Get current user info from backend
 */
export const getCurrentUser = async () => {
    return fetchWithAuth(`${API_BASE_URL}/auth/me`);
};

// ==================== PRESCRIPTIONS ====================

/**
 * Fetch all prescriptions for the logged-in patient
 */
export const fetchMyPrescriptions = async () => {
    const patient = getPatientInfo();
    if (!patient?.patientId) {
        throw new Error('Patient not registered with backend');
    }
    return fetchWithAuth(`${API_BASE_URL}/prescriptions/patient/${patient.patientId}`);
};

// ==================== APPOINTMENTS ====================

/**
 * Fetch all appointments for the logged-in patient
 */
export const fetchMyAppointments = async () => {
    const patient = getPatientInfo();
    if (!patient?.patientId) {
        throw new Error('Patient not registered with backend');
    }
    return fetchWithAuth(`${API_BASE_URL}/appointments/patient/${patient.patientId}`);
};

/**
 * Book a new appointment
 */
export const bookAppointment = async (data: {
    appointmentDate: string;
    type: 'Online' | 'In-Person';
    purpose: string;
    notes?: string;
}) => {
    const patient = getPatientInfo();
    if (!patient?.patientId) {
        throw new Error('Patient not registered with backend');
    }
    return fetchWithAuth(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        body: JSON.stringify({
            patientId: patient.patientId,
            ...data,
        }),
    });
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (appointmentId: string) => {
    return fetchWithAuth(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
    });
};

// ==================== HEALTH METRICS ====================

/**
 * Get latest health metrics for the logged-in patient
 */
export const fetchMyHealthMetrics = async () => {
    const patient = getPatientInfo();
    if (!patient?.patientId) {
        throw new Error('Patient not registered with backend');
    }
    return fetchWithAuth(`${API_BASE_URL}/health-metrics/${patient.patientId}/latest`);
};

/**
 * Upload health metrics (e.g. from smartwatch)
 */
export const uploadHealthMetrics = async (data: {
    vitals: any;
    activity?: any;
}) => {
    const patient = getPatientInfo();
    if (!patient?.patientId) {
        throw new Error('Patient not registered with backend');
    }
    return fetchWithAuth(`${API_BASE_URL}/health-metrics/${patient.patientId}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

/**
 * Get health metrics history
 */
export const fetchHealthMetricsHistory = async (limit?: number) => {
    const patient = getPatientInfo();
    if (!patient?.patientId) {
        throw new Error('Patient not registered with backend');
    }
    let url = `${API_BASE_URL}/health-metrics/${patient.patientId}/history`;
    if (limit) url += `?limit=${limit}`;
    return fetchWithAuth(url);
};

// ==================== PATIENT PROFILE ====================

/**
 * Get patient profile from backend
 */
export const fetchMyProfile = async () => {
    const patient = getPatientInfo();
    if (!patient?.patientId) {
        throw new Error('Patient not registered with backend');
    }
    return fetchWithAuth(`${API_BASE_URL}/patients/${patient.patientId}`);
};

/**
 * Update patient profile
 */
export const updateMyProfile = async (data: {
    personalInfo?: any;
    medicalInfo?: any;
}) => {
    const patient = getPatientInfo();
    if (!patient?.patientId) {
        throw new Error('Patient not registered with backend');
    }
    return fetchWithAuth(`${API_BASE_URL}/patients/${patient.patientId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};
