// Premium Feature Configuration
// Defines which features require premium subscription

export type FeatureTier = 'free' | 'premium';

export interface PremiumFeature {
    id: string;
    name: string;
    description: string;
    tier: FeatureTier;
    icon?: string;
    route: string;
}

// Premium Feature List
export const PREMIUM_FEATURES: PremiumFeature[] = [
    {
        id: 'menstruation-tracker',
        name: 'Menstruation Tracker',
        description: 'Track your menstrual cycle, symptoms, and get personalized insights',
        tier: 'premium',
        route: '/menstruation-tracker'
    },
    {
        id: 'mental-wellness',
        name: 'Mental Wellness',
        description: 'Access mental health resources, mood tracking, and wellness exercises',
        tier: 'premium',
        route: '/mental-wellness'
    },
    {
        id: 'fitness-tracker',
        name: 'Fitness Tracker',
        description: 'Comprehensive fitness tracking with personalized workout plans',
        tier: 'premium',
        route: '/fitness-tracker'
    }
];

// Free Features
export const FREE_FEATURES: PremiumFeature[] = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        description: 'Your health overview and quick actions',
        tier: 'free',
        route: '/dashboard'
    },
    {
        id: 'symptom-checker',
        name: 'Symptom Checker',
        description: 'AI-powered symptom analysis',
        tier: 'free',
        route: '/symptom-checker'
    },
    {
        id: 'doctor-appointments',
        name: 'Doctor Appointments',
        description: 'Schedule and manage appointments with Dr. Sujal',
        tier: 'free',
        route: '/doctor-appointments'
    },
    {
        id: 'hospital-locator',
        name: 'Hospital Locator',
        description: 'Find nearby hospitals and healthcare facilities',
        tier: 'free',
        route: '/hospital-locator'
    },
    {
        id: 'health-hub',
        name: 'Health Hub',
        description: 'Educational health resources and videos',
        tier: 'free',
        route: '/health-hub'
    },
    {
        id: 'patient-report',
        name: 'Patient Report',
        description: 'View and download your health reports',
        tier: 'free',
        route: '/patient-report'
    },
    {
        id: 'heart-monitor',
        name: 'Heart Monitor',
        description: 'Track your heart rate and cardiovascular health',
        tier: 'free',
        route: '/heart-monitor'
    },
    {
        id: 'analysis',
        name: 'Health Analysis',
        description: 'Comprehensive health analysis and insights',
        tier: 'free',
        route: '/analysis'
    },
    {
        id: 'vision',
        name: 'Vision Analysis',
        description: 'AI-powered medical image analysis',
        tier: 'free',
        route: '/vision'
    },
    {
        id: 'vr-doctor',
        name: 'VR Doctor',
        description: 'Virtual reality doctor consultation',
        tier: 'free',
        route: '/vr-doctor'
    },
    {
        id: 'maps',
        name: 'Health Maps',
        description: 'Interactive health data visualization',
        tier: 'free',
        route: '/maps'
    },
    {
        id: 'learning-center',
        name: 'Learning Center',
        description: 'Learn about health topics and AI transparency',
        tier: 'free',
        route: '/learning-center'
    }
];

// Helper function to check if a feature is premium
export const isPremiumFeature = (featureId: string): boolean => {
    return PREMIUM_FEATURES.some(feature => feature.id === featureId);
};

// Helper function to get feature by route
export const getFeatureByRoute = (route: string): PremiumFeature | undefined => {
    const allFeatures = [...PREMIUM_FEATURES, ...FREE_FEATURES];
    return allFeatures.find(feature => feature.route === route);
};

// Helper function to check if user has access to a feature
// This will be expanded when you implement actual user subscription logic
export const hasFeatureAccess = (featureId: string, userIsPremium: boolean): boolean => {
    const feature = PREMIUM_FEATURES.find(f => f.id === featureId);

    if (!feature) {
        // If not in premium list, it's a free feature
        return true;
    }

    // Premium feature requires premium subscription
    return userIsPremium;
};
