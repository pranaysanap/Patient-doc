"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertCircle, 
  ArrowRight, 
  Brain, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Settings as Lungs, 
  Pill, 
  Stethoscope,
  Activity,
  Droplet,
  Dumbbell, 
  HeartPulse,
  Info,
  Eye,
  EarIcon as Ear,
  Microscope,
  LucideStethoscope,
  Thermometer,
  Bone,
  BookOpen,
  Clock,
  Calendar,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  ActivitySquare,
  ClipboardList,
  ShieldCheck
} from "lucide-react";
import { useDrEcho } from "@/components/ai-assistant/dr-echo-context";
import { toast } from "sonner";
import { getAIAssistant } from "@/lib/ai-assistant";

// Add this type definition at the top of the file, after the imports
type BodyPartId = 'head' | 'eyes' | 'ears' | 'nose' | 'mouth' | 'neck' | 'chest' | 'shoulders' | 'abdomen' | 'digestive' | 'respiratory' | 'upper_back' | 'lower_back' | 'arms' | 'elbows' | 'wrists' | 'hips' | 'legs' | 'knees' | 'ankles' | 'skin' | 'joints' | 'urinary' | 'general';

export default function SymptomCheckerPage() {
  const { openAssistant, sendMessage } = useDrEcho();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPartId | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomDuration, setSymptomDuration] = useState<string | null>(null);
  const [symptomSeverity, setSymptomSeverity] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [showResults, setShowResults] = useState(false);
  
  const bodyParts = [
    // Head & Face Area
    { id: "head", name: "Head & Face", icon: Brain, color: "bg-blue-500 dark:bg-blue-600", gradient: "from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600" },
    { id: "eyes", name: "Eyes", icon: Eye, color: "bg-blue-500 dark:bg-blue-600", gradient: "from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600" },
    { id: "ears", name: "Ears", icon: Ear, color: "bg-blue-500 dark:bg-blue-600", gradient: "from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600" },
    { id: "nose", name: "Nose & Sinuses", icon: Droplet, color: "bg-blue-500 dark:bg-blue-600", gradient: "from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600" },
    { id: "mouth", name: "Mouth & Throat", icon: BookOpen, color: "bg-blue-500 dark:bg-blue-600", gradient: "from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600" },
    
    // Neck & Upper Body
    { id: "neck", name: "Neck", icon: Activity, color: "bg-teal-500 dark:bg-teal-600", gradient: "from-teal-400 to-emerald-500 dark:from-teal-500 dark:to-emerald-600" },
    { id: "chest", name: "Chest & Heart", icon: Heart, color: "bg-red-500 dark:bg-red-600", gradient: "from-red-400 to-rose-500 dark:from-red-500 dark:to-rose-600" },
    { id: "shoulders", name: "Shoulders", icon: Dumbbell, color: "bg-teal-500 dark:bg-teal-600", gradient: "from-teal-400 to-emerald-500 dark:from-teal-500 dark:to-emerald-600" },

    // Abdomen & Digestive
    { id: "abdomen", name: "Abdomen", icon: Stethoscope, color: "bg-amber-500 dark:bg-amber-600", gradient: "from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600" },
    { id: "digestive", name: "Digestive System", icon: Microscope, color: "bg-amber-500 dark:bg-amber-600", gradient: "from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600" },
    
    // Respiratory
    { id: "respiratory", name: "Respiratory", icon: Lungs, color: "bg-cyan-500 dark:bg-cyan-600", gradient: "from-cyan-400 to-sky-500 dark:from-cyan-500 dark:to-sky-600" },
    
    // Back Area
    { id: "upper_back", name: "Upper Back", icon: Bone, color: "bg-teal-500 dark:bg-teal-600", gradient: "from-teal-400 to-emerald-500 dark:from-teal-500 dark:to-emerald-600" },
    { id: "lower_back", name: "Lower Back", icon: Activity, color: "bg-teal-500 dark:bg-teal-600", gradient: "from-teal-400 to-emerald-500 dark:from-teal-500 dark:to-emerald-600" },
    
    // Upper Limbs
    { id: "arms", name: "Arms", icon: Dumbbell, color: "bg-green-500 dark:bg-green-600", gradient: "from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600" },
    { id: "elbows", name: "Elbows", icon: Activity, color: "bg-green-500 dark:bg-green-600", gradient: "from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600" },
    { id: "wrists", name: "Wrists & Hands", icon: Droplet, color: "bg-green-500 dark:bg-green-600", gradient: "from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600" },
    
    // Lower Limbs
    { id: "hips", name: "Hips & Pelvis", icon: Bone, color: "bg-green-500 dark:bg-green-600", gradient: "from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600" },
    { id: "legs", name: "Legs", icon: Activity, color: "bg-green-500 dark:bg-green-600", gradient: "from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600" },
    { id: "knees", name: "Knees", icon: Stethoscope, color: "bg-green-500 dark:bg-green-600", gradient: "from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600" },
    { id: "ankles", name: "Ankles & Feet", icon: Thermometer, color: "bg-green-500 dark:bg-green-600", gradient: "from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600" },
    
    // Other Systems
    { id: "skin", name: "Skin & Hair", icon: Droplet, color: "bg-rose-500 dark:bg-rose-600", gradient: "from-rose-400 to-pink-500 dark:from-rose-500 dark:to-pink-600" },
    { id: "joints", name: "Joints & Muscles", icon: Activity, color: "bg-orange-500 dark:bg-orange-600", gradient: "from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600" },
    { id: "urinary", name: "Urinary & Reproductive", icon: HeartPulse, color: "bg-indigo-500 dark:bg-indigo-600", gradient: "from-indigo-400 to-violet-500 dark:from-indigo-500 dark:to-violet-600" },
    { id: "general", name: "General", icon: Pill, color: "bg-purple-500 dark:bg-purple-600", gradient: "from-purple-400 to-violet-500 dark:from-purple-500 dark:to-violet-600" },
  ];
  
  const symptomsByBodyPart: Record<BodyPartId, string[]> = {
    head: ["Headache", "Migraine", "Dizziness", "Confusion", "Memory problems"],
    eyes: ["Blurred vision", "Eye pain", "Red eyes", "Dry eyes", "Vision changes", "Light sensitivity"],
    ears: ["Ear pain", "Hearing loss", "Ringing in ears", "Ear discharge", "Vertigo"],
    nose: ["Nasal congestion", "Runny nose", "Loss of smell", "Nosebleeds", "Sinus pressure"],
    mouth: ["Sore throat", "Difficulty swallowing", "Mouth ulcers", "Bad breath", "Dry mouth", "Taste changes"],
    
    neck: ["Neck pain", "Stiff neck", "Neck swelling", "Limited neck mobility", "Neck muscle spasms"],
    chest: ["Chest pain", "Shortness of breath", "Heart palpitations", "Chest tightness", "Irregular heartbeat"],
    shoulders: ["Shoulder pain", "Limited shoulder mobility", "Shoulder stiffness", "Joint pain", "Muscle weakness"],
    
    abdomen: ["Abdominal pain", "Bloating", "Nausea", "Vomiting", "Loss of appetite"],
    digestive: ["Diarrhea", "Constipation", "Acid reflux", "Indigestion", "Stomach cramps", "Changes in bowel habits"],
    respiratory: ["Cough", "Wheezing", "Difficulty breathing", "Rapid breathing", "Chest congestion"],
    
    upper_back: ["Upper back pain", "Muscle tension", "Stiffness", "Burning sensation", "Radiating pain"],
    lower_back: ["Lower back pain", "Sciatica", "Muscle spasms", "Limited mobility", "Chronic pain"],
    
    arms: ["Arm pain", "Muscle weakness", "Numbness", "Tingling", "Limited mobility"],
    elbows: ["Elbow pain", "Tennis elbow", "Limited range of motion", "Joint stiffness", "Swelling"],
    wrists: ["Wrist pain", "Carpal tunnel", "Joint stiffness", "Weakness", "Limited mobility"],
    
    hips: ["Hip pain", "Limited mobility", "Joint stiffness", "Difficulty walking", "Groin pain"],
    legs: ["Leg pain", "Muscle cramps", "Weakness", "Swelling", "Numbness"],
    knees: ["Knee pain", "Swelling", "Stiffness", "Limited mobility", "Joint instability"],
    ankles: ["Ankle pain", "Swelling", "Instability", "Limited mobility", "Stiffness"],
    
    skin: ["Rash", "Itching", "Dry skin", "Skin changes", "Excessive sweating"],
    joints: ["Joint pain", "Stiffness", "Swelling", "Limited mobility", "Inflammation"],
    urinary: ["Frequent urination", "Painful urination", "Blood in urine", "Urgency", "Incontinence"],
    general: ["Fever", "Fatigue", "Weight changes", "Night sweats", "General weakness"],
  } as const;
  
  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setProgress((currentStep + 1) * 20);
    } else {
      setShowResults(true);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setProgress(currentStep * 20 - 20);
    }
  };
  
  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };
  
  const handleConsultAI = async () => {
    if (!selectedBodyPart || selectedSymptoms.length === 0) {
      toast.error("Please select a body part and at least one symptom");
      return;
    }

    // Format symptoms for AI consultation
    const symptomSummary = `
Body Part: ${selectedBodyPart}
Symptoms: ${selectedSymptoms.join(", ")}
Duration: ${symptomDuration}
Severity: ${symptomSeverity}
Additional Info: ${additionalInfo || "None provided"}
    `.trim();

    try {
      const drEcho = useDrEcho();
      
      // Check if we're in offline mode
      const aiAssistant = getAIAssistant();
      const status = aiAssistant.getStatus();
      
      if (status.fallbackMode || !status.initialized) {
        toast.error("AI consultation is currently unavailable. Please try again later or contact support.");
        
        // Show a helpful message in the chat
        drEcho.sendMessage(`I'm currently experiencing technical difficulties and can only provide general guidance. For your symptoms (${selectedSymptoms.join(", ")}), I recommend:

1. Rest and monitor your symptoms
2. Stay hydrated and maintain good nutrition
3. Consider over-the-counter medications appropriate for your symptoms
4. If symptoms persist or worsen, please consult a healthcare provider
5. For fever, monitor your temperature and take fever reducers if needed

Please note: This is general advice only. For specific medical concerns, always consult with a qualified healthcare professional.`);
        
        return;
      }

      // If online, proceed with AI consultation
      await drEcho.sendMessage(symptomSummary);
      
      // Clear the form after successful consultation
      setSelectedBodyPart(null);
      setSelectedSymptoms([]);
      setSymptomDuration(null);
      setSymptomSeverity(null);
      setAdditionalInfo("");
      
      // Close the symptom checker
      setCurrentStep(1);
      
    } catch (error) {
      console.error("Error during AI consultation:", error);
      toast.error("An error occurred during the consultation. Please try again.");
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Where are you experiencing symptoms?</h2>
            <p className="text-muted-foreground">Select the primary area of your body where you're experiencing symptoms.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {bodyParts.map((part) => (
                <motion.div
                  key={part.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all overflow-hidden border-0 shadow-md ${
                      selectedBodyPart === part.id 
                        ? 'ring-1 ring-primary/30 shadow-lg backdrop-blur-sm' 
                        : 'hover:shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-900/80'
                    }`}
                    onClick={() => setSelectedBodyPart(part.id as BodyPartId)}
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${part.gradient}`}></div>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${
                        selectedBodyPart === part.id ? part.gradient : 'from-primary/20 to-primary/10'
                      } flex items-center justify-center transition-colors duration-300 backdrop-blur-sm`}>
                        <part.icon className={`h-5 w-5 ${selectedBodyPart === part.id ? 'text-white' : 'text-primary/70'}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{part.name}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              What symptoms are you experiencing?
            </h2>
            <p className="text-muted-foreground">
              Select all symptoms that apply to your {selectedBodyPart ? bodyParts.find(bp => bp.id === selectedBodyPart)?.name.toLowerCase() : ''} area.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedBodyPart && symptomsByBodyPart[selectedBodyPart].map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                const bodyPart = bodyParts.find(bp => bp.id === selectedBodyPart);
                const gradientClass = bodyPart?.gradient || '';
                
                return (
                  <motion.div
                    key={symptom}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? `border-0 bg-gradient-to-r ${gradientClass} shadow-md backdrop-blur-sm` 
                          : 'border border-input/30 hover:bg-white/30 dark:hover:bg-slate-800/30 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm'
                      }`}
                      onClick={() => handleSymptomToggle(symptom)}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        isSelected 
                          ? 'bg-white/20 backdrop-blur-sm' 
                          : `bg-gradient-to-br ${gradientClass} bg-opacity-10`
                      }`}>
                        <Checkbox 
                          id={symptom}
                          checked={isSelected}
                          onCheckedChange={() => handleSymptomToggle(symptom)}
                          className={`${isSelected ? 'border-white' : ''} h-5 w-5`}
                        />
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor={symptom}
                          className={`text-sm font-medium leading-none cursor-pointer ${isSelected ? 'text-white' : ''}`}
                        >
                          {symptom}
                        </label>
                        <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                          Common symptom for {bodyPart?.name}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              className="flex items-center p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 backdrop-blur-sm rounded-lg mt-6 border border-blue-200/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 backdrop-blur-sm">
                <Info className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Selected Symptoms: {selectedSymptoms.length}</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Choose all symptoms you're experiencing for a more accurate assessment
                </p>
              </div>
            </motion.div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              How long have you been experiencing these symptoms?
            </h2>
            <p className="text-muted-foreground">Select the duration that best matches your symptoms.</p>
            
            <RadioGroup value={symptomDuration || ""} onValueChange={setSymptomDuration} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: "Less than a day", icon: <Clock className="h-5 w-5" />, description: "Symptoms started recently" },
                { value: "1-3 days", icon: <Calendar className="h-5 w-5" />, description: "Short-term symptoms" },
                { value: "4-7 days", icon: <CalendarDays className="h-5 w-5" />, description: "Ongoing for about a week" },
                { value: "1-2 weeks", icon: <CalendarRange className="h-5 w-5" />, description: "Persistent symptoms" },
                { value: "More than 2 weeks", icon: <CalendarClock className="h-5 w-5" />, description: "Long-term symptoms" }
              ].map((duration) => {
                const isSelected = symptomDuration === duration.value;
                const bodyPart = bodyParts.find(bp => bp.id === selectedBodyPart);
                const gradientClass = bodyPart?.gradient || 'from-primary/40 to-primary/20';
                
                return (
                  <motion.div
                    key={duration.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div 
                      className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? `border-0 bg-gradient-to-r ${gradientClass} shadow-md backdrop-blur-sm` 
                          : 'border border-input/30 hover:bg-white/30 dark:hover:bg-slate-800/30 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm'
                      }`}
                      onClick={() => setSymptomDuration(duration.value)}
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        isSelected 
                          ? 'bg-white/20 backdrop-blur-sm' 
                          : `bg-gradient-to-br ${gradientClass} bg-opacity-10`
                      }`}>
                        {duration.icon}
                      </div>
                      <div className="flex-1">
                        <RadioGroupItem 
                          value={duration.value} 
                          id={duration.value} 
                          className="sr-only"
                        />
                        <Label 
                          htmlFor={duration.value} 
                          className={`block cursor-pointer ${isSelected ? 'text-white' : ''}`}
                        >
                          <span className="font-medium">{duration.value}</span>
                          <p className={`text-sm mt-1 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {duration.description}
                          </p>
                        </Label>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </RadioGroup>

            <motion.div
              className="flex items-center p-4 bg-gradient-to-r from-amber-500/10 to-orange-600/10 backdrop-blur-sm rounded-lg mt-6 border border-amber-200/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 backdrop-blur-sm">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">Symptom Timeline</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  The duration of your symptoms helps determine the urgency of care needed
                </p>
              </div>
            </motion.div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              How severe are your symptoms?
            </h2>
            <p className="text-muted-foreground">Rate the intensity and impact of your symptoms on daily life.</p>
            
            <RadioGroup value={symptomSeverity || ""} onValueChange={setSymptomSeverity} className="space-y-4">
              {[
                { 
                  value: "Mild",
                  icon: <Smile className="h-6 w-6" />,
                  description: "Noticeable but not interfering with daily activities",
                  subtext: "You can carry on with normal activities",
                  gradient: "from-green-400 to-emerald-500"
                },
                { 
                  value: "Moderate",
                  icon: <Meh className="h-6 w-6" />,
                  description: "Causing some discomfort and affecting some activities",
                  subtext: "Some activities are becoming difficult",
                  gradient: "from-yellow-400 to-amber-500"
                },
                { 
                  value: "Severe",
                  icon: <Frown className="h-6 w-6" />,
                  description: "Causing significant discomfort and limiting normal activities",
                  subtext: "Most activities are affected",
                  gradient: "from-orange-400 to-red-500"
                },
                { 
                  value: "Very Severe",
                  icon: <AlertTriangle className="h-6 w-6" />,
                  description: "Debilitating and preventing normal activities",
                  subtext: "Unable to perform daily tasks",
                  gradient: "from-red-500 to-rose-600"
                }
              ].map((severity) => {
                const isSelected = symptomSeverity === severity.value;
                
                return (
                  <motion.div
                    key={severity.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div 
                      className={`relative overflow-hidden rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? `border-0 bg-gradient-to-r ${severity.gradient} shadow-lg` 
                          : 'border border-input/30 hover:bg-white/30 dark:hover:bg-slate-800/30 bg-white/20 dark:bg-slate-900/20'
                      }`}
                      onClick={() => setSymptomSeverity(severity.value)}
                    >
                      <div className="absolute inset-0 backdrop-blur-sm"></div>
                      <div className="relative p-4 flex items-start space-x-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          isSelected 
                            ? 'bg-white/20' 
                            : `bg-gradient-to-br ${severity.gradient} bg-opacity-10`
                        }`}>
                          {severity.icon}
                        </div>
                        <div className="flex-1 space-y-2">
                          <RadioGroupItem 
                            value={severity.value} 
                            id={severity.value} 
                            className="sr-only"
                          />
                          <div>
                            <Label 
                              htmlFor={severity.value} 
                              className={`text-lg font-medium cursor-pointer ${isSelected ? 'text-white' : ''}`}
                            >
                              {severity.value}
                            </Label>
                            <p className={`text-sm mt-1 ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                              {severity.description}
                            </p>
                          </div>
                          <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {severity.subtext}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </RadioGroup>

            <motion.div
              className="flex items-center p-4 bg-gradient-to-r from-purple-500/10 to-violet-600/10 backdrop-blur-sm rounded-lg mt-6 border border-purple-200/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-violet-600 backdrop-blur-sm">
                <ActivitySquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200">Impact Assessment</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Understanding severity helps prioritize your care needs
                </p>
              </div>
            </motion.div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              Additional Information
            </h2>
            <p className="text-muted-foreground">Help us understand your symptoms better by providing more context.</p>
            
            <div className="space-y-6">
              <motion.div
                className="rounded-lg overflow-hidden border-0 shadow-lg bg-gradient-to-r from-white/40 to-purple-50/40 dark:from-slate-900/40 dark:to-purple-900/40 backdrop-blur-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-4 border-b border-purple-100/20 dark:border-purple-900/20">
                  <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Detailed Description</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                    Include any relevant details about your symptoms and health history
                  </p>
                </div>
                <div className="p-4">
                  <Textarea 
                    placeholder="Describe your symptoms in detail, including:
• When and how they started
• Any triggers or patterns you've noticed
• Related medical conditions
• Current medications
• Recent lifestyle changes
• Previous similar experiences"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="min-h-[200px] border-2 border-purple-100/30 dark:border-purple-900/30 focus-visible:ring-purple-400/30 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm resize-none"
                  />
                </div>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-200/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Helpful Tips</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <li>• Be specific about your symptoms</li>
                    <li>• Include timing and frequency</li>
                    <li>• Mention any recent changes</li>
                    <li>• List current medications</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-sm border border-emerald-200/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-medium text-emerald-800 dark:text-emerald-200">Privacy Note</h4>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Your information is kept private and secure. Share openly to receive the most accurate assessment.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  const renderResults = () => {
    // Get the body part color for consistent styling
    const bodyPart = bodyParts.find(bp => bp.id === selectedBodyPart);
    const gradientClass = bodyPart?.gradient || "from-primary/40 to-primary/20";
    const bgGradientClass = `from-${gradientClass.split('-')[1]}-50/10 to-${gradientClass.split('-')[3]}-50/5`;
    const IconComponent = bodyPart?.icon || Stethoscope;
    
    return (
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400/80 to-emerald-500/80 text-white mb-4 backdrop-blur-sm">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Symptom Assessment Complete</h2>
            <p className="text-muted-foreground">
              Based on the information you've provided, here's a summary of your symptoms.
            </p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className={`overflow-hidden border-0 bg-gradient-to-br ${bgGradientClass} backdrop-blur-sm shadow-lg`}>
            <div className={`h-1.5 bg-gradient-to-r ${gradientClass}`}></div>
            <CardHeader>
              <CardTitle>Symptom Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <div className="flex items-center mt-1">
                  <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${gradientClass} mr-2 flex items-center justify-center`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <p className="font-medium">
                    {selectedBodyPart ? bodyParts.find(bp => bp.id === selectedBodyPart)?.name : 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Symptoms</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedSymptoms.map(symptom => (
                    <span
                      key={symptom}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gradient-to-r ${gradientClass} text-white`}
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                <p>{symptomDuration || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Severity</h3>
                <p>{symptomSeverity || 'Not specified'}</p>
              </div>
              
              {additionalInfo && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Additional Information</h3>
                  <p className="text-sm text-muted-foreground mt-1">{additionalInfo}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-100/20 to-amber-200/20 dark:from-yellow-900/20 dark:to-amber-800/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                Important Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400/80 to-amber-500/80 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Medical Disclaimer</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This symptom checker is for informational purposes only and is not a qualified medical opinion. 
                    Always consult with a healthcare professional for proper diagnosis and treatment.
                  </p>
                  <p className="text-sm font-medium text-red-500 mt-2">
                    If you're experiencing severe symptoms or a medical emergency, please call emergency services immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          className="flex justify-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button
            variant="outline"
            className="gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-900/70 border-slate-200/50 dark:border-slate-800/50"
            onClick={() => {
              setShowResults(false);
              setCurrentStep(1);
              setProgress(20);
              setSelectedBodyPart(null);
              setSelectedSymptoms([]);
              setSymptomDuration(null);
              setSymptomSeverity(null);
              setAdditionalInfo("");
            }}
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Start New Assessment
          </Button>
          
          <Button 
            className="gap-2 bg-gradient-to-r from-violet-500/90 to-purple-500/90 hover:from-violet-600/90 hover:to-purple-600/90 border-0 shadow-md hover:shadow-lg transition-all backdrop-blur-sm"
            onClick={handleConsultAI}
          >
            Consult Dr. Echo AI
            <Stethoscope className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    );
  };
  
  return (
    <div className="container mx-auto py-12 px-4 relative bg-gradient-to-b from-white/20 to-purple-50/20 dark:from-slate-950/20 dark:to-purple-950/20 min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-64 -top-64 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-cyan-300/10 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -right-64 -bottom-64 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-pink-300/10 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 top-1/4 w-64 h-64 bg-gradient-to-br from-amber-300/10 to-yellow-300/10 dark:from-amber-900/10 dark:to-yellow-900/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pink-300/20 dark:text-pink-700/20 pointer-events-none"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Heart className="w-80 h-80" />
      </motion.div>
      
      <motion.div
        className="text-center mb-10 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">AI Symptom Checker</h1>
        <p className="text-muted-foreground mb-8">
          Answer a few questions about your symptoms for personalized health insights
        </p>
      </motion.div>
      
      <Card className="max-w-4xl mx-auto relative z-10 border-0 shadow-xl bg-white/70 dark:bg-slate-950/70 backdrop-blur-md">
        <CardContent className="p-6">
          {!showResults ? (
            <>
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span>Step {currentStep} of 5</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-gradient-to-r from-slate-200/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50"
                  style={{
                    background: "linear-gradient(to right, rgba(var(--primary), 0.1), rgba(var(--primary), 0.05))"
                  }}
                />
              </div>
              
              {renderStepContent()}
              
              <div className="flex justify-between mt-8">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 1}
                    className="gap-2 shadow-sm hover:shadow transition-all bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-slate-900/70 border-slate-200/50 dark:border-slate-800/50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleNextStep}
                    disabled={
                      (currentStep === 1 && !selectedBodyPart) ||
                      (currentStep === 2 && selectedSymptoms.length === 0) ||
                      (currentStep === 3 && !symptomDuration) ||
                      (currentStep === 4 && !symptomSeverity)
                    }
                    className={`gap-2 ${
                      currentStep === 5 
                        ? 'bg-gradient-to-r from-green-500/90 to-emerald-500/90 hover:from-green-600/90 hover:to-emerald-600/90' 
                        : 'bg-gradient-to-r from-violet-500/90 to-purple-500/90 hover:from-violet-600/90 hover:to-purple-600/90'
                    } border-0 shadow-md hover:shadow-lg transition-all backdrop-blur-sm`}
                  >
                    {currentStep === 5 ? (
                      <>
                        Complete
                        <CheckCircle className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </>
          ) : (
            renderResults()
          )}
        </CardContent>
      </Card>
    </div>
  );
}