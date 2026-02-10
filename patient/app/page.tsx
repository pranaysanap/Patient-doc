"use client";

import { motion } from "framer-motion";
import { HeroSection } from '@/components/home/hero-section';
import { FeaturesSection } from '@/components/home/features-section';
import { AccuracyGraph } from '@/components/home/accuracy-graph';
import { AIAssistantDemo } from '@/components/home/ai-assistant-demo';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { GlobalImpactMap } from '@/components/home/global-impact-map';
import { CTASection } from '@/components/home/cta-section';
import { AnimatedHeart } from '@/components/ui/animated-heart';

function HeartShowcase() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm -z-10" />
      <div className="container mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-500 to-red-600 bg-clip-text text-transparent">
              Healthcare with Heart
            </span>
          </h2>

          <p className="max-w-2xl mx-auto text-muted-foreground mb-16 text-lg">
            At EchoMed, we blend advanced technology with human compassion.
            Experience care that understands you.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-12 items-center">
          {[
            { label: "Patient Care", color: "#ff3366", size: 80 },
            { label: "Compassionate AI", color: "#ff5e94", size: 100, pulse: "#ff97ba" },
            { label: "Trusted Partner", color: "#ff0044", size: 120, pulse: "#ff667a" },
            { label: "Community", color: "#ff8866", size: 80 }
          ].map((heart, idx) => (
            <motion.div
              key={idx}
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
                <AnimatedHeart size={heart.size} color={heart.color} pulseColor={heart.pulse} />
              </div>
              <span className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">{heart.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const SectionReveal = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    viewport={{ once: true, margin: "-100px" }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection />

      <SectionReveal>
        <FeaturesSection />
      </SectionReveal>

      <SectionReveal>
        <div className="py-12 bg-secondary/5">
          <AIAssistantDemo />
        </div>
      </SectionReveal>

      <SectionReveal>
        <AccuracyGraph />
      </SectionReveal>

      <HeartShowcase />

      <SectionReveal>
        <GlobalImpactMap />
      </SectionReveal>

      <SectionReveal>
        <TestimonialsSection />
      </SectionReveal>

      <SectionReveal>
        <CTASection />
      </SectionReveal>
    </div>
  );
}