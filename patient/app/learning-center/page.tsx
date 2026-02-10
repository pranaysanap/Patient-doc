import { LearningCenterHeader } from '@/components/learning-center/learning-center-header';
import { AIExplanationSection } from '@/components/learning-center/ai-explanation-section';
import { InteractiveTutorials } from '@/components/learning-center/interactive-tutorials';
import { TransparencySection } from '@/components/learning-center/transparency-section';
import { FAQSection } from '@/components/learning-center/faq-section';
import { Sidebar } from "@/components/layout/sidebar";

export default function LearningCenterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <LearningCenterHeader />
          <div className="mt-8 space-y-16">
            <AIExplanationSection />
            <InteractiveTutorials />
            <TransparencySection />
            <FAQSection />
          </div>
        </div>
      </div>
    </div>
  );
}