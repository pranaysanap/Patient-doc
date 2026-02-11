"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    grantConsent,
    getConsentStatus,
    updateConsent,
    withdrawAllConsent,
    getConsentHistory,
    exportMyData,
    deleteMyAccount,
    getMyAuditLog,
    getPrivacyPolicy,
} from "@/lib/api";
import { Shield, Download, Trash2, History, Eye, AlertTriangle, FileText, Lock, ExternalLink } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";

export default function PrivacyPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Tab state: "consent" or "policy"
    const [activeTab, setActiveTab] = useState<"consent" | "policy">("consent");

    const [hasConsent, setHasConsent] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showAuditLog, setShowAuditLog] = useState(false);
    const [consentHistory, setConsentHistory] = useState<any[]>([]);
    const [auditLog, setAuditLog] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");

    // Policy state
    const [policy, setPolicy] = useState<any>(null);
    const [policyLoading, setPolicyLoading] = useState(false);

    // Consent form state
    const [consents, setConsents] = useState({
        dataCollection: true,
        healthDataProcessing: true,
        aiAnalysis: true,
        doctorDataSharing: true,
        emailNotifications: true,
        emergencyServices: true,
        fitnessData: true,
        privacyPolicyAccepted: true,
        termsAccepted: true,
        isMinor: false,
        parentGuardianName: "",
        parentGuardianEmail: "",
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/sign-in");
            return;
        }
        if (status === "authenticated") {
            loadConsentStatus();
        }
    }, [status]);

    // Load policy when switching to policy tab
    useEffect(() => {
        if (activeTab === "policy" && !policy) {
            setPolicyLoading(true);
            getPrivacyPolicy()
                .then((res) => setPolicy(res.data))
                .catch(console.error)
                .finally(() => setPolicyLoading(false));
        }
    }, [activeTab]);

    const loadConsentStatus = async () => {
        try {
            const result = await getConsentStatus();
            setHasConsent(result.hasConsent);
            if (result.data?.consents) {
                setConsents((prev) => ({
                    ...prev,
                    dataCollection: result.data.consents.dataCollection?.granted ?? true,
                    healthDataProcessing: result.data.consents.healthDataProcessing?.granted ?? true,
                    aiAnalysis: result.data.consents.aiAnalysis?.granted ?? true,
                    doctorDataSharing: result.data.consents.doctorDataSharing?.granted ?? true,
                    emailNotifications: result.data.consents.emailNotifications?.granted ?? true,
                    emergencyServices: result.data.consents.emergencyServices?.granted ?? true,
                    fitnessData: result.data.consents.fitnessData?.granted ?? true,
                }));
            }
        } catch (err) {
            console.error("Failed to load consent:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGrantConsent = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await grantConsent(consents);
            setHasConsent(true);
            setMessage({ type: "success", text: "Consent recorded successfully! You can now use all features." });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Failed to save consent" });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateConsent = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const result = await updateConsent({
                healthDataProcessing: consents.healthDataProcessing,
                aiAnalysis: consents.aiAnalysis,
                doctorDataSharing: consents.doctorDataSharing,
                emailNotifications: consents.emailNotifications,
                emergencyServices: consents.emergencyServices,
                fitnessData: consents.fitnessData,
            });
            setMessage({ type: "success", text: `${result.changes?.length || 0} preference(s) updated` });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Failed to update consent" });
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        try {
            const result = await exportMyData();
            const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `vaidyasetu_data_export_${new Date().toISOString().split("T")[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setMessage({ type: "success", text: "Data exported successfully!" });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Export failed" });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteMyAccount(deleteReason);
            setMessage({ type: "success", text: "Account deleted. You will be redirected..." });
            setTimeout(() => router.push("/"), 3000);
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Deletion failed" });
        }
    };

    const loadHistory = async () => {
        try {
            const result = await getConsentHistory();
            setConsentHistory(result.data || []);
            setShowHistory(!showHistory);
        } catch (err) {
            console.error(err);
        }
    };

    const loadAuditLog = async () => {
        try {
            const result = await getMyAuditLog();
            setAuditLog(result.data || []);
            setShowAuditLog(!showAuditLog);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const consentItems = [
        { key: "dataCollection", label: "Core Data Collection", description: "Required to use VaidyaSetu. We collect your name, email, and basic profile information.", required: true },
        { key: "healthDataProcessing", label: "Health Data Processing", description: "Allow processing of your health vitals, medical records, and prescriptions for health monitoring.", required: false },
        { key: "aiAnalysis", label: "AI-Powered Analysis", description: "Allow Google Gemini AI to analyze your symptoms and provide health recommendations.", required: false },
        { key: "doctorDataSharing", label: "Doctor Data Sharing", description: "Share your health data with your assigned doctor for consultations and treatment.", required: false },
        { key: "emailNotifications", label: "Email Notifications", description: "Receive appointment confirmations, prescription updates, and health alerts via email.", required: false },
        { key: "emergencyServices", label: "Emergency Services", description: "Allow SOS feature to contact emergency services and share your location during emergencies.", required: false },
        { key: "fitnessData", label: "Fitness & Wearable Data", description: "Sync fitness data from Google Fit including steps, heart rate, and sleep tracking.", required: false },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                        <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">DPDP & HIPAA Compliant</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy & Data</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Manage your consent preferences and review our privacy policy — all in one place.
                    </p>
                </div>

                {/* Toggle Tabs */}
                <div className="flex items-center justify-center">
                    <div className="inline-flex bg-white dark:bg-gray-800 rounded-xl p-1.5 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <button
                            onClick={() => setActiveTab("consent")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "consent"
                                    ? "bg-emerald-600 text-white shadow-md"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            <Lock className="h-4 w-4" />
                            Consent
                        </button>
                        <button
                            onClick={() => setActiveTab("policy")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "policy"
                                    ? "bg-emerald-600 text-white shadow-md"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            <FileText className="h-4 w-4" />
                            Privacy Policy
                        </button>
                    </div>
                </div>

                {/* Status message */}
                {message && (
                    <div
                        className={`p-4 rounded-lg ${message.type === "success"
                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* ═══════ CONSENT TAB ═══════ */}
                {activeTab === "consent" && (
                    <>
                        {/* Consent Form */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                                {hasConsent ? "Your Privacy Preferences" : "Welcome! Please Review & Accept"}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Under the Digital Personal Data Protection Act (DPDP) 2023 and HIPAA, we need your explicit consent before processing your personal and health data.
                            </p>

                            <div className="space-y-4">
                                {consentItems.map((item) => (
                                    <label
                                        key={item.key}
                                        className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={consents[item.key as keyof typeof consents] as boolean}
                                            onChange={(e) => {
                                                if (item.required) return;
                                                setConsents((prev) => ({ ...prev, [item.key]: e.target.checked }));
                                            }}
                                            disabled={item.required}
                                            className="mt-1 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                                                {item.required && (
                                                    <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                                                        Required
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Privacy Policy & Terms checkboxes for first-time consent */}
                            {!hasConsent && (
                                <div className="mt-6 space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={consents.privacyPolicyAccepted}
                                            onChange={(e) => setConsents((prev) => ({ ...prev, privacyPolicyAccepted: e.target.checked }))}
                                            className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            I have read and accept the{" "}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setActiveTab("policy"); }}
                                                className="text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700"
                                            >
                                                Privacy Policy
                                            </button>
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={consents.termsAccepted}
                                            onChange={(e) => setConsents((prev) => ({ ...prev, termsAccepted: e.target.checked }))}
                                            className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            I accept the Terms of Service
                                        </span>
                                    </label>
                                </div>
                            )}

                            <button
                                onClick={hasConsent ? handleUpdateConsent : handleGrantConsent}
                                disabled={saving || (!hasConsent && (!consents.privacyPolicyAccepted || !consents.termsAccepted))}
                                className="mt-6 w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                            >
                                {saving ? "Saving..." : hasConsent ? "Update Preferences" : "Accept & Continue"}
                            </button>
                        </div>

                        {/* Data Rights Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Data Rights</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Under DPDP Act 2023 and HIPAA, you have the following rights over your personal data.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onClick={handleExportData} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left">
                                    <Download className="h-8 w-8 text-blue-500 shrink-0" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">Export My Data</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Download all your data in JSON format</div>
                                    </div>
                                </button>

                                <button onClick={loadHistory} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left">
                                    <History className="h-8 w-8 text-purple-500 shrink-0" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">Consent History</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">View all consent changes over time</div>
                                    </div>
                                </button>

                                <button onClick={loadAuditLog} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left">
                                    <Eye className="h-8 w-8 text-indigo-500 shrink-0" />
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">Access Log</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">See who accessed your data and when</div>
                                    </div>
                                </button>

                                <button onClick={() => setShowDeleteConfirm(!showDeleteConfirm)} className="flex items-center gap-3 p-4 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                                    <Trash2 className="h-8 w-8 text-red-500 shrink-0" />
                                    <div>
                                        <div className="font-medium text-red-600 dark:text-red-400">Delete Account</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Permanently delete all your data</div>
                                    </div>
                                </button>
                            </div>

                            {/* Consent History Panel */}
                            {showHistory && consentHistory.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-64 overflow-y-auto">
                                    <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Consent Change History</h3>
                                    {consentHistory.map((entry: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-200 dark:border-gray-700 last:border-0 text-sm">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${entry.action === "granted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {entry.action}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">{entry.purpose}</span>
                                            <span className="text-gray-400 text-xs ml-auto">{new Date(entry.timestamp).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Audit Log Panel */}
                            {showAuditLog && auditLog.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-64 overflow-y-auto">
                                    <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Data Access Log</h3>
                                    {auditLog.map((entry: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-200 dark:border-gray-700 last:border-0 text-sm">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${entry.phiAccessed ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                                {entry.action}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">{entry.path}</span>
                                            <span className="text-gray-400 text-xs ml-auto">{new Date(entry.timestamp).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Delete Confirmation */}
                            {showDeleteConfirm && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        <h3 className="font-medium text-red-700 dark:text-red-300">Permanent Account Deletion</h3>
                                    </div>
                                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                                        This will permanently delete your personal information, health metrics, and anonymize your prescriptions and appointments. Audit logs are retained for compliance. This action cannot be undone.
                                    </p>
                                    <textarea
                                        value={deleteReason}
                                        onChange={(e) => setDeleteReason(e.target.value)}
                                        placeholder="Reason for leaving (optional)"
                                        className="w-full p-2 rounded border border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 text-sm mb-3"
                                        rows={2}
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                                            Yes, Delete My Account
                                        </button>
                                        <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ═══════ POLICY TAB ═══════ */}
                {activeTab === "policy" && (
                    <>
                        {policyLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                            </div>
                        ) : policy ? (
                            <>
                                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                    Version {policy.version} · Effective {policy.effectiveDate} · Last Updated {policy.lastUpdated}
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 space-y-8">
                                    {/* Data Controller */}
                                    <section>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Controller</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <strong>{policy.dataController?.name}</strong>
                                            <br />
                                            Contact: {policy.dataController?.contact}
                                            <br />
                                            DPO: {policy.dataProtectionOfficer?.name} ({policy.dataProtectionOfficer?.email})
                                        </p>
                                    </section>

                                    {/* Applicable Laws */}
                                    <section>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Applicable Laws</h2>
                                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            {policy.applicableLaws?.map((law: string, i: number) => (
                                                <li key={i}>{law}</li>
                                            ))}
                                        </ul>
                                    </section>

                                    {/* Data Collected */}
                                    <section>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data We Collect</h2>
                                        <div className="space-y-3">
                                            {policy.dataCollected?.map((item: any, i: number) => (
                                                <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                                    <div className="font-medium text-gray-900 dark:text-white text-sm">{item.category}</div>
                                                    <div className="text-xs text-gray-500 mt-1">Examples: {item.examples}</div>
                                                    <div className="text-xs text-gray-500">Purpose: {item.purpose}</div>
                                                    <div className="text-xs text-emerald-600 dark:text-emerald-400">Legal basis: {item.legalBasis}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Third-Party Processors */}
                                    <section>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Third-Party Data Processors</h2>
                                        <div className="space-y-2">
                                            {policy.thirdPartyProcessors?.map((tp: any, i: number) => (
                                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                                    <ExternalLink className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{tp.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {tp.purpose} — Shared: {tp.dataShared}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Data Retention */}
                                    <section>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Retention</h2>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            {policy.dataRetention &&
                                                Object.entries(policy.dataRetention).map(([key, value]: [string, any]) => (
                                                    <div key={key} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                                                        <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                                                        <span className="text-gray-900 dark:text-white font-medium">{value}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </section>

                                    {/* Your Rights */}
                                    <section>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Rights</h2>
                                        <div className="space-y-2">
                                            {policy.patientRights?.map((r: any, i: number) => (
                                                <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                                    <div className="font-medium text-sm text-gray-900 dark:text-white">{r.right}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{r.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Security */}
                                    <section>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Security Measures</h2>
                                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            {policy.securityMeasures?.map((m: string, i: number) => (
                                                <li key={i}>{m}</li>
                                            ))}
                                        </ul>
                                    </section>

                                    {/* Breach Notification */}
                                    <section>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Breach Notification</h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {policy.breachNotification?.dpdp}
                                            <br />
                                            {policy.breachNotification?.hipaa}
                                            <br />
                                            Contact: {policy.breachNotification?.contact}
                                        </p>
                                    </section>
                                </div>

                                {/* Quick switch to consent */}
                                <div className="text-center">
                                    <button
                                        onClick={() => setActiveTab("consent")}
                                        className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                                    >
                                        <Lock className="h-4 w-4" />
                                        Manage your consent preferences
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500">Failed to load privacy policy. Please try again.</div>
                        )}
                    </>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
                    <p>VaidyaSetu complies with the Digital Personal Data Protection Act, 2023 (India) and HIPAA (USA).</p>
                    <p className="mt-1">Data Protection Officer: Dr. Sujal Jadhav — privacy@vaidyasetu.com</p>
                </div>
            </div>
            </div>
        </div>
    );
}
