"use client";

import { motion } from "framer-motion";
import { FileText, Download, Eye, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Prescription, downloadPrescription } from "@/lib/prescriptions";
import { useState } from "react";
import { PdfViewerDialog } from "./pdf-viewer-dialog";

interface PrescriptionCardProps {
    prescription: Prescription;
    index: number;
}

export default function PrescriptionCard({ prescription, index }: PrescriptionCardProps) {
    const [showPdfViewer, setShowPdfViewer] = useState(false);

    const handleDownload = () => {
        downloadPrescription(prescription);
    };

    const handleView = () => {
        setShowPdfViewer(true);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
            >
                <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50 bg-card">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{prescription.prescriptionType}</CardTitle>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                        <User className="h-3 w-3" />
                                        {prescription.doctorName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{format(prescription.dateIssued, "PPP")}</span>
                        </div>

                        {prescription.notes && (
                            <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 py-2 bg-primary/5 rounded-r">
                                {prescription.notes}
                            </p>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="default"
                                className="flex-1 gap-2"
                                onClick={handleView}
                            >
                                <Eye className="h-4 w-4" />
                                View PDF
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 gap-2"
                                onClick={handleDownload}
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <PdfViewerDialog
                open={showPdfViewer}
                onOpenChange={setShowPdfViewer}
                pdfUrl={prescription.pdfUrl}
                title={`${prescription.prescriptionType} - ${prescription.doctorName}`}
            />
        </>
    );
}
