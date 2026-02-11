"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { registerPatient, getToken, getConsentStatus } from "@/lib/api";

function BackendSync({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [needsConsent, setNeedsConsent] = useState(false);

    useEffect(() => {
        const syncWithBackend = async () => {
            if (status === 'authenticated' && session?.user) {
                // Only sync if we don't already have a backend token
                if (!getToken()) {
                    try {
                        const result = await registerPatient({
                            name: session.user.name || 'Unknown',
                            email: session.user.email || '',
                            image: session.user.image || undefined,
                        });
                        console.log('✅ Synced with VaidyaSetu backend');

                        // Check if user needs to give consent (DPDP/HIPAA requirement)
                        if (result.hasConsent === false) {
                            setNeedsConsent(true);
                        }
                    } catch (err) {
                        console.error('Failed to sync with backend:', err);
                    }
                } else {
                    // Already have token — check consent status
                    try {
                        const consentResult = await getConsentStatus();
                        if (!consentResult.hasConsent) {
                            setNeedsConsent(true);
                        }
                    } catch {
                        // Consent check failed — don't block the app
                    }
                }
            }
        };
        syncWithBackend();
    }, [session, status]);

    // Pass consent state down via data attribute for other components to read
    return (
        <div data-needs-consent={needsConsent ? "true" : "false"}>
            {children}
        </div>
    );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <BackendSync>{children}</BackendSync>
        </SessionProvider>
    );
}
