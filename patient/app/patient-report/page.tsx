'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { Sidebar } from "@/components/layout/sidebar";

// Dynamically import the Patient Report Analysis component
const PatientReportAnalysis = dynamic(
  () => import('@/components/patient-report/patient-report-analysis'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg font-medium">Loading Report Analysis Tools...</p>
        </div>
      </div>
    )
  }
);

export default function PatientReportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 py-8 overflow-y-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-lg font-medium">Initializing AI Analysis Engine...</p>
            </div>
          </div>
        }>
          <PatientReportAnalysis />
        </Suspense>
      </main>
    </div>
  );
} 