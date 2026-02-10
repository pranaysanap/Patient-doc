"use client";

import { useState, useEffect } from "react";
import { Phone, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function SOSButton() {
    const [isPressed, setIsPressed] = useState(false);
    const [showEmergency, setShowEmergency] = useState(false);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showEmergency && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            // Simulate calling
        }
        return () => clearTimeout(timer);
    }, [showEmergency, countdown]);

    const handleLongPressStart = () => {
        setIsPressed(true);
        // In a real app, we'd use a timer to detect long press
        // For demo, click opens the dialog
    };

    const handleLongPressEnd = () => setIsPressed(false);

    return (
        <>
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Button
                    size="lg"
                    className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.5)] border-4 border-red-400 animate-pulse flex flex-col items-center justify-center p-0"
                    onClick={() => {
                        setShowEmergency(true);
                        setCountdown(5);
                    }}
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1">SOS</span>
                    <Phone className="h-6 w-6 mt-[-2px]" />
                </Button>
            </motion.div>

            <Dialog open={showEmergency} onOpenChange={setShowEmergency}>
                <DialogContent className="sm:max-w-md border-red-500/50 bg-destructive/10 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-red-500 flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6" /> EMERGENCY MODE
                        </DialogTitle>
                        <DialogDescription className="text-foreground/90 text-lg">
                            Contacting emergency services and sharing your live location in:
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="text-7xl font-black text-red-500 tabular-nums animate-ping">
                            {countdown}
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">Press Cancel if this was a mistake.</p>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" className="w-full h-12 text-lg" onClick={() => setShowEmergency(false)}>
                            CANCEL
                        </Button>
                        <Button variant="destructive" className="w-full h-12 text-lg animate-pulse" disabled={countdown === 0}>
                            CALL NOW
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
