'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Flower2, Sun, Moon } from "lucide-react";
import { useState } from "react";

interface Phase {
  name: string;
  icon: JSX.Element;
  color: string;
  startDay: number;
  endDay: number;
  description: string;
}

interface CycleVisualizerProps {
  cycleLength: number;
  currentDay: number;
  lastPeriodStart: Date | null;
}

const phases: Phase[] = [
  {
    name: "Menstrual",
    icon: <Droplet className="h-4 w-4" />,
    color: "text-red-500",
    startDay: 1,
    endDay: 5,
    description: "Menstruation phase - Your period begins"
  },
  {
    name: "Follicular",
    icon: <Flower2 className="h-4 w-4" />,
    color: "text-pink-500",
    startDay: 6,
    endDay: 14,
    description: "Follicular phase - Preparing for ovulation"
  },
  {
    name: "Ovulatory",
    icon: <Sun className="h-4 w-4" />,
    color: "text-yellow-500",
    startDay: 15,
    endDay: 17,
    description: "Ovulation phase - Release of egg"
  },
  {
    name: "Luteal",
    icon: <Moon className="h-4 w-4" />,
    color: "text-purple-500",
    startDay: 18,
    endDay: 28,
    description: "Luteal phase - Post-ovulation period"
  }
];

function PhaseCard({ 
  phase, 
  isSelected, 
  onClick 
}: { 
  phase: Phase; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
        isSelected
          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 transform -translate-y-1"
          : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <span className={phase.color}>{phase.icon}</span>
        <span className={`font-medium ${phase.color}`}>
          {phase.name}
        </span>
      </div>
      <div className="text-sm text-gray-500 mt-1">
        Days {phase.startDay}-{phase.endDay}
      </div>
      {isSelected && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {phase.description}
        </div>
      )}
    </div>
  );
}

export default function CycleVisualizer({
  cycleLength,
  currentDay,
  lastPeriodStart,
}: CycleVisualizerProps) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  const getCurrentPhase = () => {
    return phases.find(phase => currentDay >= phase.startDay && currentDay <= phase.endDay) || phases[0];
  };

  const currentPhase = getCurrentPhase();

  const handlePhaseClick = (phaseName: string) => {
    setSelectedPhase(phaseName === selectedPhase ? null : phaseName);
  };

  if (!cycleLength || !currentDay) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cycle Day {currentDay}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 mt-6">
            {phases.map((phase) => (
              <PhaseCard
                key={phase.name}
                phase={phase}
                isSelected={phase.name === selectedPhase}
                onClick={() => handlePhaseClick(phase.name)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 