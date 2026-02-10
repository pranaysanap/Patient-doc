"use client";

import { motion } from "framer-motion";
import { FileText, Inbox } from "lucide-react";
import { getPrescriptions } from "@/lib/prescriptions";
import PrescriptionCard from "./prescription-card";

export default function PrescriptionList() {
    const prescriptions = getPrescriptions();

    return (
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Prescriptions</h1>
                        <p className="text-muted-foreground">
                            View and download your medical prescriptions
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Prescriptions</p>
                        <p className="text-2xl font-bold text-primary">{prescriptions.length}</p>
                    </div>
                    {prescriptions.length > 0 && (
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Latest Prescription</p>
                            <p className="text-sm font-medium">
                                {new Date(prescriptions[0].dateIssued).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Prescription Grid */}
            {prescriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prescriptions.map((prescription, index) => (
                        <PrescriptionCard
                            key={prescription.id}
                            prescription={prescription}
                            index={index}
                        />
                    ))}
                </div>
            ) : (
                // Empty State
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center justify-center py-16 px-4"
                >
                    <div className="p-6 rounded-full bg-muted/50 mb-4">
                        <Inbox className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Prescriptions Yet</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                        Your prescriptions will appear here once your doctor uploads them.
                        Check back after your next appointment.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
