"use client";

import { useState, useEffect } from "react";
import { Phone, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type CallStatus = 'idle' | 'calling' | 'success' | 'error';

export function SOSButton() {
    const [isPressed, setIsPressed] = useState(false);
    const [showEmergency, setShowEmergency] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [callMessage, setCallMessage] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showEmergency && countdown > 0 && callStatus === 'idle') {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0 && callStatus === 'idle') {
            // Automatically trigger emergency call when countdown reaches 0
            handleEmergencyCall();
        }
        return () => clearTimeout(timer);
    }, [showEmergency, countdown, callStatus]);

    const handleEmergencyCall = async (manual = false) => {
        setCallStatus('calling');
        setCallMessage('Contacting emergency services...');

        try {
            // Gather user information (you might want to get this from user context/profile)
            const callData = {
                patientName: 'Emergency Contact', // Replace with actual patient name if available
                location: await getCurrentLocation(),
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                triggerType: manual ? 'manual' : 'automatic'
            };

            console.log('🚨 Triggering emergency call...', callData);

            const response = await fetch('/api/emergency', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(callData),
            });

            const result = await response.json();

            if (result.success) {
                setCallStatus('success');
                setCallMessage('Emergency services have been notified successfully!');

                toast({
                    title: "Emergency Alert Sent",
                    description: "Emergency contact has been called and notified via SMS.",
                    variant: "default",
                });

                // Auto-close dialog after success
                setTimeout(() => {
                    setShowEmergency(false);
                    resetComponent();
                }, 3000);

            } else {
                throw new Error(result.error || 'Failed to send emergency alert');
            }

        } catch (error) {
            console.error('Emergency call failed:', error);
            setCallStatus('error');
            setCallMessage(error instanceof Error ? error.message : 'Failed to contact emergency services. Please call manually.');

            toast({
                title: "Emergency Call Failed",
                description: "Unable to contact emergency services automatically. Please call manually.",
                variant: "destructive",
            });
        }
    };

    const getCurrentLocation = async (): Promise<string> => {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        resolve(`Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`);
                    },
                    () => {
                        resolve('Location unavailable');
                    },
                    { timeout: 5000 }
                );
            } else {
                resolve('Geolocation not supported');
            }
        });
    };

    const resetComponent = () => {
        setCountdown(5);
        setCallStatus('idle');
        setCallMessage('');
        setIsPressed(false);
    };

    const handleCancel = () => {
        setShowEmergency(false);
        resetComponent();
    };

    const handleLongPressStart = () => {
        setIsPressed(true);
    };

    const handleLongPressEnd = () => setIsPressed(false);

    const getStatusIcon = () => {
        switch (callStatus) {
            case 'calling':
                return <Loader2 className="h-6 w-6 animate-spin" />;
            case 'success':
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'error':
                return <XCircle className="h-6 w-6 text-red-500" />;
            default:
                return <AlertTriangle className="h-6 w-6" />;
        }
    };

    const getStatusColor = () => {
        switch (callStatus) {
            case 'calling':
                return 'text-blue-500';
            case 'success':
                return 'text-green-500';
            case 'error':
                return 'text-red-500';
            default:
                return 'text-red-500';
        }
    };

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
                        resetComponent();
                    }}
                    disabled={callStatus === 'calling'}
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-1">SOS</span>
                    <Phone className="h-6 w-6 mt-[-2px]" />
                </Button>
            </motion.div>

            <Dialog open={showEmergency} onOpenChange={(open) => {
                if (!open && callStatus !== 'calling') {
                    handleCancel();
                }
            }}>
                <DialogContent className="sm:max-w-md border-red-500/50 bg-destructive/10 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className={`text-2xl font-bold flex items-center gap-2 ${getStatusColor()}`}>
                            {getStatusIcon()}
                            {callStatus === 'calling' ? 'CALLING EMERGENCY' :
                                callStatus === 'success' ? 'EMERGENCY SENT' :
                                    callStatus === 'error' ? 'CALL FAILED' : 'EMERGENCY MODE'}
                        </DialogTitle>
                        <DialogDescription className="text-foreground/90 text-lg">
                            {callStatus === 'idle' && countdown > 0 &&
                                'Contacting emergency services and sharing your live location in:'
                            }
                            {callStatus !== 'idle' && callMessage}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center py-8">
                        {callStatus === 'idle' && countdown > 0 && (
                            <>
                                <div className="text-7xl font-black text-red-500 tabular-nums animate-ping">
                                    {countdown}
                                </div>
                                <p className="text-sm text-muted-foreground mt-4">Press Cancel if this was a mistake.</p>
                            </>
                        )}

                        {callStatus === 'calling' && (
                            <div className="flex flex-col items-center">
                                <Loader2 className="h-16 w-16 animate-spin text-blue-500 mb-4" />
                                <p className="text-lg font-medium">Calling emergency contact...</p>
                                <p className="text-sm text-muted-foreground mt-2">Please wait while we connect you.</p>
                            </div>
                        )}

                        {callStatus === 'success' && (
                            <div className="flex flex-col items-center">
                                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                                <p className="text-lg font-medium text-green-600">Emergency services notified!</p>
                                <p className="text-sm text-muted-foreground mt-2">Call and SMS sent successfully.</p>
                            </div>
                        )}

                        {callStatus === 'error' && (
                            <div className="flex flex-col items-center">
                                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                                <p className="text-lg font-medium text-red-600">Call Failed</p>
                                <p className="text-sm text-muted-foreground mt-2 text-center">Please call emergency services manually.</p>
                                <p className="text-xs text-muted-foreground mt-2">Emergency: 911 | Police: 100 | Fire: 101</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {callStatus === 'idle' && (
                            <>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 text-lg"
                                    onClick={handleCancel}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full h-12 text-lg animate-pulse"
                                    onClick={() => handleEmergencyCall(true)}
                                >
                                    CALL NOW
                                </Button>
                            </>
                        )}

                        {callStatus === 'calling' && (
                            <Button
                                variant="outline"
                                className="w-full h-12 text-lg"
                                disabled
                            >
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Calling...
                            </Button>
                        )}

                        {(callStatus === 'success' || callStatus === 'error') && (
                            <Button
                                variant="outline"
                                className="w-full h-12 text-lg"
                                onClick={handleCancel}
                            >
                                CLOSE
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
