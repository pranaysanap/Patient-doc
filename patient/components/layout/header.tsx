"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Heart,
  Activity,
  BarChart2,
  BookOpen,
  Menu,
  X,
  Stethoscope,
  Brain,
  Calendar,
  Dumbbell,
  MessageSquare,
  Video,
  FileText,
  Youtube,
  Map,
  Droplet
} from "lucide-react";

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "Analysis", href: "/analysis", icon: BarChart2 },
  { name: "Symptom Checker", href: "/symptom-checker", icon: Stethoscope },
  { name: "VR Doctor", href: "/vr-doctor", icon: Video },
];

const menuNavItems: { name: string; href: string; icon: any }[] = [
  // Removed: All features now accessible via Dashboard sidebar
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">VaidyaSetu</span>
            </Link>
          </div>

          {/* Desktop Navigation - Only 3 Main Items */}
          <nav className="hidden md:flex items-center space-x-4">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 px-2 py-1 rounded-md",
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <ModeToggle />

            {/* Authentication Buttons */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="hidden md:flex">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9"
                  }
                }}
              />
            </SignedIn>

            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile and Additional Items Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border-t bg-background"
        >
          <div className="container mx-auto px-4 py-4">
            {/* Show main nav items on mobile */}
            <div className="md:hidden space-y-1 mb-4">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center py-2 px-3 text-base font-medium transition-colors hover:text-primary rounded-md",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Additional menu items for both mobile and desktop */}
            <div className="space-y-1">
              {menuNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center py-2 px-3 text-base font-medium transition-colors hover:text-primary rounded-md",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Button */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="w-full mt-4 md:hidden">Sign In</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </motion.div>
      )}
    </header>
  );
}