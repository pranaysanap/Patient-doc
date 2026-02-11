"use client";

import { useEffect, useState } from "react";
import { getPrivacyPolicy } from "@/lib/api";
import { Shield, ExternalLink } from "lucide-react";

export default function PrivacyPolicyPage() {
    const [policy, setPolicy] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPrivacyPolicy()
            .then(res => setPolicy(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                        <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Legal Document</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Version {policy?.version} · Effective {policy?.effectiveDate} · Last Updated {policy?.lastUpdated}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 space-y-8">
                    {/* Data Controller */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Controller</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>{policy?.dataController?.name}</strong><br />
                            Contact: {policy?.dataController?.contact}<br />
                            DPO: {policy?.dataProtectionOfficer?.name} ({policy?.dataProtectionOfficer?.email})
                        </p>
                    </section>

                    {/* Applicable Laws */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Applicable Laws</h2>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {policy?.applicableLaws?.map((law: string, i: number) => (
                                <li key={i}>{law}</li>
                            ))}
                        </ul>
                    </section>

                    {/* Data Collected */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Data We Collect</h2>
                        <div className="space-y-3">
                            {policy?.dataCollected?.map((item: any, i: number) => (
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
                            {policy?.thirdPartyProcessors?.map((tp: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                    <ExternalLink className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{tp.name}</div>
                                        <div className="text-xs text-gray-500">{tp.purpose} — Shared: {tp.dataShared}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Retention</h2>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {policy?.dataRetention && Object.entries(policy.dataRetention).map(([key, value]: [string, any]) => (
                                <div key={key} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{value}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Rights</h2>
                        <div className="space-y-2">
                            {policy?.patientRights?.map((r: any, i: number) => (
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
                            {policy?.securityMeasures?.map((m: string, i: number) => (
                                <li key={i}>{m}</li>
                            ))}
                        </ul>
                    </section>

                    {/* Breach Notification */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Breach Notification</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {policy?.breachNotification?.dpdp}<br />
                            {policy?.breachNotification?.hipaa}<br />
                            Contact: {policy?.breachNotification?.contact}
                        </p>
                    </section>
                </div>

                <div className="text-center text-xs text-gray-400 py-4">
                    <a href="/privacy-consent" className="text-emerald-600 dark:text-emerald-400 underline">Manage your privacy preferences</a>
                </div>
            </div>
        </div>
    );
}
