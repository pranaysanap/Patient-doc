"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { registerPatient, getToken } from "@/lib/api";

function BackendSync({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    useEffect(() => {
        const syncWithBackend = async () => {
            if (status === 'authenticated' && session?.user) {
                // Only sync if we don't already have a backend token
                if (!getToken()) {
                    try {
                        await registerPatient({
                            name: session.user.name || 'Unknown',
                            email: session.user.email || '',
                            image: session.user.image || undefined,
                        });
                        console.log('✅ Synced with VaidyaSetu backend');
                    } catch (err) {
                        console.error('Failed to sync with backend:', err);
                    }
                }
            }
        };
        syncWithBackend();
    }, [session, status]);

    return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <BackendSync>{children}</BackendSync>
        </SessionProvider>
    );
}
