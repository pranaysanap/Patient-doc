"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Check } from "lucide-react";
import { motion } from "framer-motion";

interface PremiumGateProps {
    featureName: string;
    featureDescription: string;
    children?: React.ReactNode;
    userIsPremium?: boolean; // This will be connected to actual user state later
}

export function PremiumGate({
    featureName,
    featureDescription,
    children,
    userIsPremium = false
}: PremiumGateProps) {

    // If user has premium, show the feature
    if (userIsPremium) {
        return <>{children}</>;
    }

    // Otherwise, show premium upgrade prompt
    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="max-w-2xl mx-auto border-2 border-primary/20">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <Crown className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                        <Badge variant="secondary" className="mb-2 w-fit mx-auto">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium Feature
                        </Badge>
                        <CardTitle className="text-2xl">{featureName}</CardTitle>
                        <CardDescription className="text-base mt-2">
                            {featureDescription}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-muted/50 rounded-lg p-6">
                            <h3 className="font-semibold mb-4 text-center">Premium Benefits</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <span>Access to {featureName} and all premium features</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <span>Personalized health insights and recommendations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <span>Advanced tracking and analytics</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <span>Priority support from Dr. Sujal</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <span>Export and share your health data</span>
                                </li>
                            </ul>
                        </div>

                        <div className="text-center space-y-4">
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-3xl font-bold">₹499</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <Button size="lg" className="w-full">
                                <Crown className="h-4 w-4 mr-2" />
                                Upgrade to Premium
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                Cancel anytime. No hidden fees.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
