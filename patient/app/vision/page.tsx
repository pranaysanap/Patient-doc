"use client";

import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostureCorrector } from "@/components/vision/posture-corrector";

export default function VisionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </Link>
            <div>
                 <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Activity className="h-8 w-8 text-primary" /> 
                    AI Body Tracking
                 </h1>
                 <p className="text-muted-foreground">Real-time computer vision analysis for rehabilitation and posture.</p>
            </div>
        </div>
        
        <PostureCorrector />
      </div>
    </div>
  );
}
