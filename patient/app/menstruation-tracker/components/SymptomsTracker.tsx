import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity,
  Frown,
  Thermometer,
  Droplet,
  Utensils,
  Brain,
  HeartPulse,
  Pill,
  Zap,
  Coffee,
  Plus,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Symptom {
  name: string;
  icon: JSX.Element;
  category: Category;
}

interface SymptomsTrackerProps {
  onSymptomsChange: (symptoms: string[]) => void;
  selectedSymptoms: string[];
}

type Category = "Pain" | "Physical" | "Energy" | "Emotional" | "Sleep" | "Treatment";

const categoryColors: Record<Category, string> = {
  Pain: "text-red-500 dark:text-red-400",
  Physical: "text-blue-500 dark:text-blue-400",
  Energy: "text-yellow-500 dark:text-yellow-400",
  Emotional: "text-purple-500 dark:text-purple-400",
  Sleep: "text-indigo-500 dark:text-indigo-400",
  Treatment: "text-green-500 dark:text-green-400",
};

const categoryGradients: Record<Category, string> = {
  Pain: "from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-900/20",
  Physical: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-900/20",
  Energy: "from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-900/20",
  Emotional: "from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-900/20",
  Sleep: "from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-900/20",
  Treatment: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/20",
};

const commonSymptoms: Symptom[] = [
  { name: "Cramps", icon: <Activity className="h-4 w-4" />, category: "Pain" },
  { name: "Headache", icon: <Brain className="h-4 w-4" />, category: "Pain" },
  { name: "Back Pain", icon: <HeartPulse className="h-4 w-4" />, category: "Pain" },
  { name: "Bloating", icon: <Frown className="h-4 w-4" />, category: "Physical" },
  { name: "Breast Tenderness", icon: <Thermometer className="h-4 w-4" />, category: "Physical" },
  { name: "Nausea", icon: <Frown className="h-4 w-4" />, category: "Physical" },
  { name: "Fatigue", icon: <Coffee className="h-4 w-4" />, category: "Energy" },
  { name: "Mood Swings", icon: <Brain className="h-4 w-4" />, category: "Emotional" },
  { name: "Food Cravings", icon: <Utensils className="h-4 w-4" />, category: "Physical" },
  { name: "Acne", icon: <Droplet className="h-4 w-4" />, category: "Physical" },
  { name: "Insomnia", icon: <Zap className="h-4 w-4" />, category: "Sleep" },
  { name: "Medication", icon: <Pill className="h-4 w-4" />, category: "Treatment" },
];

const FloatingHeart = () => {
  return (
    <motion.div
      className="absolute right-10 top-20 text-pink-200/20 dark:text-pink-900/20 pointer-events-none"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Heart className="w-32 h-32" />
    </motion.div>
  );
};

export default function SymptomsTracker({
  onSymptomsChange,
  selectedSymptoms,
}: SymptomsTrackerProps) {
  const [customSymptom, setCustomSymptom] = useState("");

  const handleSymptomToggle = (symptom: string) => {
    const updatedSymptoms = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter((s) => s !== symptom)
      : [...selectedSymptoms, symptom];
    onSymptomsChange(updatedSymptoms);
  };

  const addCustomSymptom = () => {
    if (customSymptom && !selectedSymptoms.includes(customSymptom)) {
      onSymptomsChange([...selectedSymptoms, customSymptom]);
      setCustomSymptom("");
    }
  };

  const categories = Array.from(new Set(commonSymptoms.map((s: Symptom) => s.category)));

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-950 dark:to-purple-900/10 relative">
      <FloatingHeart />
      <CardHeader className="border-b border-purple-100 dark:border-purple-900/20">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-500" />
          Symptoms Tracker
        </CardTitle>
        <CardDescription>Track your symptoms and their intensity</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
            >
              <div className={`p-4 rounded-lg bg-gradient-to-r ${categoryGradients[category]}`}>
                <h3 className={`text-sm font-medium mb-3 ${categoryColors[category]}`}>
                  {category}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {commonSymptoms
                    .filter(s => s.category === category)
                    .map((symptom, index) => (
                      <motion.div
                        key={symptom.name}
                        className="symptom-item"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
                          <div className="symptom-checkbox">
                            <Checkbox
                              id={symptom.name}
                              checked={selectedSymptoms.includes(symptom.name)}
                              onCheckedChange={() => handleSymptomToggle(symptom.name)}
                              className={`border-2 ${categoryColors[category]} data-[state=checked]:bg-current data-[state=checked]:text-white`}
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`${categoryColors[category]}`}>
                              {symptom.icon}
                            </div>
                            <span className="text-sm font-medium">{symptom.name}</span>
                          </div>
                        </label>
                      </motion.div>
                    ))}
                </div>
              </div>
            </motion.div>
          ))}

          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Add custom symptom..."
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-purple-100 dark:border-purple-900/20 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 dark:focus:ring-purple-500/50"
            />
            <Button
              onClick={addCustomSymptom}
              disabled={!customSymptom}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {selectedSymptoms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20"
            >
              <p className="text-sm text-purple-600 dark:text-purple-300">
                Selected Symptoms: {selectedSymptoms.length}
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 