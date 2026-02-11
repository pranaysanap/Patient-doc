"use client";

import { useEffect, useState } from "react";
import { getTermsOfService } from "@/lib/api";
import { FileText } from "lucide-react";

export default function TermsPage() {
    const [terms, setTerms] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTermsOfService()
            .then(res => setTerms(res.data))
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
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Legal Document</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Version {terms?.version} · Effective {terms?.effectiveDate}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{terms?.platform}</h2>

                    <div className="space-y-4">
                        {terms?.summary?.map((item: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                                <span className="text-emerald-500 font-bold text-sm shrink-0">{i + 1}.</span>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                            </div>
                        ))}
                    </div>

                    {terms?.disclaimer && (
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <h3 className="font-medium text-amber-700 dark:text-amber-300 text-sm mb-2">Important Disclaimer</h3>
                            <p className="text-xs text-amber-600 dark:text-amber-400">{terms.disclaimer}</p>
                        </div>
                    )}
                </div>

                <div className="text-center text-xs text-gray-400 py-4">
                    <a href="/privacy-policy" className="text-emerald-600 dark:text-emerald-400 underline mr-4">Privacy Policy</a>
                    <a href="/privacy-consent" className="text-emerald-600 dark:text-emerald-400 underline">Manage Preferences</a>
                </div>
            </div>
        </div>
    );
}
