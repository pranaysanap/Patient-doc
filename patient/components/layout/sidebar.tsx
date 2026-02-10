"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
    Activity,
    Calendar,
    Heart,
    Home,
    MessageSquare,
    Settings,
    User,
    Wind,
    CloudSun,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
    const pathname = usePathname();
    const { user, isLoaded } = useUser();

    const navItems = [
        { icon: Home, label: "Overview", href: "/dashboard" },
        { icon: Calendar, label: "Doctor Appointments", href: "/doctor-appointments" },
        { icon: Heart, label: "Hospital Locator", href: "/hospital-locator" },
        { icon: User, label: "Patient Report Analysis", href: "/patient-report" },
        { icon: FileText, label: "Prescriptions", href: "/prescriptions" },
        { icon: Wind, label: "Health Hub", href: "/health-hub" },
        { icon: CloudSun, label: "Mental Wellness", href: "/mental-wellness" },
        { icon: Activity, label: "Fitness Tracker", href: "/fitness-tracker" },
        { icon: Heart, label: "Menstruation Tracker", href: "/menstruation-tracker" },
        { icon: Activity, label: "Learning Center", href: "/learning-center" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];

    return (
        <aside className="w-64 border-r border-border/50 hidden md:block relative z-10 shrink-0 h-screen sticky top-0 overflow-y-auto">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8 text-primary">
                    <Activity className="h-6 w-6" /> VaidyaSetu
                </Link>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                            >
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 mb-1 ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground"
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-6 mt-auto">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user?.imageUrl || "/placeholder-user.jpg"} />
                            <AvatarFallback>
                                {isLoaded && user
                                    ? user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || user.firstName?.[0]?.toUpperCase() || 'U'
                                    : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {isLoaded && user ? (user.fullName || user.firstName || 'User') : 'Loading...'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                Premium Plan
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </aside>
    );
}
