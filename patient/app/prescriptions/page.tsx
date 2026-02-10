'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { Sidebar } from "@/components/layout/sidebar";

// Dynamically import the Prescription List component
const PrescriptionList = dynamic(
    () => import('@/components/prescriptions/prescription-list'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-lg font-medium">Loading Prescriptions...</p>
                </div>
            </div>
        )
    }
);

export default function PrescriptionsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <main className="flex-1 py-8 overflow-y-auto">
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[80vh]">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="text-lg font-medium">Loading Your Prescriptions...</p>
                        </div>
                    </div>
                }>
                    <PrescriptionList />
                </Suspense>
            </main>
        </div>
    );
}
