"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HeartPulse, Stethoscope, Smartphone, Brain, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, filter: "blur(10px)" },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden py-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-background mix-blend-overlay opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-secondary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[120px] opacity-20 animate-pulse-glow" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-block">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary ring-1 ring-inset ring-primary/20 backdrop-blur-sm">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Next-Gen AI Healthcare
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
            >
              Medical Grade <br />
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Intelligence
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed"
            >
              Transform your device into a diagnostic powerhouse.
              EchoMed uses advanced acoustic AI to analyze heart and lung sounds with
              <span className="text-foreground font-medium"> 99.2% clinical accuracy</span>.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-2"
            >
              <Button size="lg" className="rounded-full h-12 px-8 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow" asChild>
                <Link href="/dashboard">
                  Start Analysis <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-lg border-primary/20 hover:bg-primary/5" asChild>
                <Link href="/learning-center">
                  View Research
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50"
            >
              <div>
                <div className="flex items-center text-primary mb-1">
                  <HeartPulse className="mr-2 h-5 w-5" />
                  <span className="font-bold text-2xl">99.2%</span>
                </div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div>
                <div className="flex items-center text-primary mb-1">
                  <Smartphone className="mr-2 h-5 w-5" />
                  <span className="font-bold text-2xl">All</span>
                </div>
                <p className="text-sm text-muted-foreground">Devices</p>
              </div>
              <div>
                <div className="flex items-center text-primary mb-1">
                  <Brain className="mr-2 h-5 w-5" />
                  <span className="font-bold text-2xl">100k+</span>
                </div>
                <p className="text-sm text-muted-foreground">Scans</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative will-change-transform"
          >
            <div className="relative mx-auto w-full max-w-md animate-float-1">
              {/* Glass Card */}
              <div className="relative rounded-3xl border border-white/20 bg-white/10 dark:bg-black/40 backdrop-blur-xl p-6 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl">
                      <Stethoscope className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Live Monitor</h3>
                      <p className="text-xs text-muted-foreground">Real-time Analysis</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-red-500">LIVE</span>
                  </div>
                </div>

                {/* ECG Visualization */}
                <div className="h-32 w-full rounded-xl bg-black/50 relative overflow-hidden mb-6 border border-white/5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(transparent 95%, rgba(0,255,150,0.1) 95%), linear-gradient(90deg, transparent 95%, rgba(0,255,150,0.1) 95%)',
                    backgroundSize: '20px 20px'
                  }} />
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <path
                      d="M0,50 L20,50 L30,20 L40,80 L50,50 L100,50 L120,50 L130,20 L140,80 L150,50 L200,50 L220,50 L230,20 L240,80 L250,50 L300,50 L320,50 L330,20 L340,80 L350,50 L400,50"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      className="drop-shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-ecg-draw"
                      style={{
                        strokeDasharray: '400',
                        animation: 'ecg-draw 2s linear infinite'
                      }}
                    />
                  </svg>
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-black" />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <p className="text-xs text-muted-foreground mb-1">Heart Rate</p>
                    <p className="text-2xl font-bold text-foreground">72 <span className="text-sm font-normal text-muted-foreground">BPM</span></p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-2xl font-bold text-primary">Normal</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse delay-700" />
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ecg-draw {
          0% { stroke-dashoffset: 400; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </section>
  );
}