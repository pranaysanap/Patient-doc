"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Heart, Activity, Shield } from "lucide-react";
import { useState } from "react";

export default function SignIn() {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl: "/dashboard" });
        } catch (error) {
            console.error("Sign in error:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
            <div className="container max-w-lg px-4 py-8">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <Stethoscope className="h-16 w-16 text-primary" />
                            <Heart className="h-6 w-6 text-primary absolute -bottom-1 -right-1 animate-pulse" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Welcome to VaidyaSetu
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        AI-Powered Healthcare at Your Fingertips
                    </p>
                </div>

                <Card className="border-2 shadow-xl">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
                        <CardDescription className="text-center">
                            Connect your Google account to access your health dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full h-12 text-lg font-semibold bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <div className="h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span>Continue with Google</span>
                                </div>
                            )}
                        </Button>

                        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                            <div className="text-center">
                                <div className="rounded-full bg-primary/10 p-3 inline-flex mb-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-xs text-muted-foreground">Health Tracking</p>
                            </div>
                            <div className="text-center">
                                <div className="rounded-full bg-primary/10 p-3 inline-flex mb-2">
                                    <Heart className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-xs text-muted-foreground">AI Diagnosis</p>
                            </div>
                            <div className="text-center">
                                <div className="rounded-full bg-primary/10 p-3 inline-flex mb-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-xs text-muted-foreground">Secure Data</p>
                            </div>
                        </div>

                        <p className="text-xs text-center text-muted-foreground pt-2">
                            By signing in, you agree to sync your health data from Google Fit
                            and other connected devices.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
