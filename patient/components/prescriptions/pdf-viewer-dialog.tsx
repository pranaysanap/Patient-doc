"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface PdfViewerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pdfUrl: string;
    title: string;
}

export function PdfViewerDialog({ open, onOpenChange, pdfUrl, title }: PdfViewerDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        View your prescription document below
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden rounded-lg border border-border">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title="Prescription PDF"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
