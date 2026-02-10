"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Droplet, 
  Activity, 
  Heart, 
  Smile, 
  Plus, 
  ChevronRight, 
  LineChart,
  Bell,
  CalendarDays,
  Sparkles,
  Brain,
  Moon,
  Sun,
  Droplets,
  Thermometer,
  Pill,
  Apple,
  Waves,
  Zap,
  HeartPulse,
  ListIcon,
  BarChart,
  History
} from "lucide-react";
import SymptomsTracker from "./components/SymptomsTracker";
import CycleVisualizer from "./components/CycleVisualizer";
import ClinicLocator from "./components/ClinicLocator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CycleDay {
  date: Date;
  flow: "light" | "medium" | "heavy";
  symptoms: string[];
  painLevel: number;
  mood: string;
}

interface CycleHistory {
  startDate: Date;
  endDate: Date;
  length: number;
  symptoms: string[];
  averagePainLevel: number;
  dominantMood: string;
  notes?: string;
}

export default function MenstruationTracker() {
  const [notification, setNotification] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);
  const [painLevel, setPainLevel] = useState<number>(0);
  const [flow, setFlow] = useState<"light" | "medium" | "heavy">("medium");
  const [mood, setMood] = useState<string>("normal");
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [lastPeriodStart, setLastPeriodStart] = useState<Date | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [currentCycleDay, setCurrentCycleDay] = useState<number>(1);
  const [cycleHistory, setCycleHistory] = useState<CycleHistory[]>([]);
  const [historyView, setHistoryView] = useState<"list" | "calendar" | "stats">("list");

  useEffect(() => {
    if (lastPeriodStart) {
      const today = new Date();
      const daysSinceStart = Math.floor(
        (today.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const currentDay = (daysSinceStart % cycleLength) + 1;
      setCurrentCycleDay(currentDay);
    }
  }, [lastPeriodStart, cycleLength]);

  useEffect(() => {
    if (cycleDays.length > 0) {
      const cycles: CycleHistory[] = [];
      let currentCycle: CycleDay[] = [];
      
      cycleDays.forEach((day, index) => {
        if (index > 0 && day.flow === "medium" && cycleDays[index - 1].flow !== "medium") {
          // Process previous cycle
          if (currentCycle.length > 0) {
            const cycleStart = currentCycle[0].date;
            const cycleEnd = currentCycle[currentCycle.length - 1].date;
            const length = Math.ceil((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
            
            // Collect all symptoms and make them unique
            const allSymptoms = currentCycle.reduce((acc: string[], day) => {
              day.symptoms.forEach(symptom => {
                if (!acc.includes(symptom)) {
                  acc.push(symptom);
                }
              });
              return acc;
            }, []);
            
            const avgPain = currentCycle.reduce((sum, d) => sum + d.painLevel, 0) / currentCycle.length;
            
            // Calculate dominant mood
            const moodCount: Record<string, number> = {};
            currentCycle.forEach(d => {
              moodCount[d.mood] = (moodCount[d.mood] || 0) + 1;
            });
            const dominantMood = Object.entries(moodCount)
              .sort(([,a], [,b]) => b - a)[0][0];

            cycles.push({
              startDate: cycleStart,
              endDate: cycleEnd,
              length,
              symptoms: allSymptoms,
              averagePainLevel: Math.round(avgPain * 10) / 10,
              dominantMood,
            });
          }
          currentCycle = [day];
        } else {
          currentCycle.push(day);
        }
      });
      
      // Process the last cycle
      if (currentCycle.length > 0) {
        const cycleStart = currentCycle[0].date;
        const cycleEnd = currentCycle[currentCycle.length - 1].date;
        const length = Math.ceil((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
        
        const allSymptoms = currentCycle.reduce((acc: string[], day) => {
          day.symptoms.forEach(symptom => {
            if (!acc.includes(symptom)) {
              acc.push(symptom);
            }
          });
          return acc;
        }, []);
        
        const avgPain = currentCycle.reduce((sum, d) => sum + d.painLevel, 0) / currentCycle.length;
        
        const moodCount: Record<string, number> = {};
        currentCycle.forEach(d => {
          moodCount[d.mood] = (moodCount[d.mood] || 0) + 1;
        });
        const dominantMood = Object.entries(moodCount)
          .sort(([,a], [,b]) => b - a)[0][0];

        cycles.push({
          startDate: cycleStart,
          endDate: cycleEnd,
          length,
          symptoms: allSymptoms,
          averagePainLevel: Math.round(avgPain * 10) / 10,
          dominantMood,
        });
      }
      
      setCycleHistory(cycles);
    }
  }, [cycleDays]);

  const calculateFertilityWindow = () => {
    if (!lastPeriodStart) return null;
    
    const ovulationDay = new Date(lastPeriodStart);
    ovulationDay.setDate(lastPeriodStart.getDate() + Math.floor(cycleLength / 2) - 14);
    
    const fertilityStart = new Date(ovulationDay);
    fertilityStart.setDate(ovulationDay.getDate() - 5);
    
    const fertilityEnd = new Date(ovulationDay);
    fertilityEnd.setDate(ovulationDay.getDate() + 1);
    
    return {
      ovulationDay,
      fertilityStart,
      fertilityEnd,
    };
  };

  const showNotification = (message: string) => {
    setNotification({ message, visible: true });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 3000);
  };

  const addCycleDay = () => {
    // Check if we already have an entry for this date
    const existingDayIndex = cycleDays.findIndex(
      (day) => day.date.toDateString() === selectedDate.toDateString()
    );

    const newDay: CycleDay = {
      date: selectedDate,
      flow,
      symptoms: selectedSymptoms,
      painLevel,
      mood,
    };

    let updatedDays: CycleDay[];
    if (existingDayIndex !== -1) {
      // Update existing entry
      updatedDays = cycleDays.map((day, index) => 
        index === existingDayIndex ? newDay : day
      );
      showNotification(`Updated log for ${format(selectedDate, 'MMMM d, yyyy')}`);
    } else {
      // Add new entry
      updatedDays = [...cycleDays, newDay];
      showNotification(`Added new log for ${format(selectedDate, 'MMMM d, yyyy')}`);
    }

    // Sort days by date
    updatedDays.sort((a, b) => a.date.getTime() - b.date.getTime());
    setCycleDays(updatedDays);

    // Update last period start if this is a new period
    if (flow === "medium" && (!lastPeriodStart || selectedDate > lastPeriodStart)) {
      setLastPeriodStart(selectedDate);
    }

    // Reset form
    setPainLevel(0);
    setFlow("medium");
    setMood("normal");
    setSelectedSymptoms([]);
  };

  const formatDate = (date: Date) => {
    return format(date, "MMMM d, yyyy");
  };

  const hasLogForDate = (date: Date) => {
    return cycleDays.some(day => day.date.toDateString() === date.toDateString());
  };

  const getDateHighlight = (date: Date) => {
    const cycleDay = cycleDays.find(
      (day) => day.date.toDateString() === date.toDateString()
    );
    
    if (cycleDay) {
      return {
        flow: cycleDay.flow,
        painLevel: cycleDay.painLevel,
        mood: cycleDay.mood,
        hasLog: true,
      };
    }
    
    const fertility = calculateFertilityWindow();
    if (fertility) {
      const dateStr = date.toDateString();
      if (dateStr === fertility.ovulationDay.toDateString()) {
        return { type: "ovulation" };
      }
      if (
        date >= fertility.fertilityStart &&
        date <= fertility.fertilityEnd
      ) {
        return { type: "fertile" };
      }
    }
    
    return null;
  };

  const renderHistoryContent = () => {
    switch (historyView) {
      case "list":
        return (
          <ScrollArea className="h-[500px] w-full">
            <Table className="cycle-history-table">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
                  <TableHead className="font-semibold text-pink-700 dark:text-pink-300">Start Date</TableHead>
                  <TableHead className="font-semibold text-purple-700 dark:text-purple-300">End Date</TableHead>
                  <TableHead className="font-semibold text-blue-700 dark:text-blue-300">Length</TableHead>
                  <TableHead className="font-semibold text-orange-700 dark:text-orange-300">Avg Pain</TableHead>
                  <TableHead className="font-semibold text-green-700 dark:text-green-300">Mood</TableHead>
                  <TableHead className="font-semibold text-indigo-700 dark:text-indigo-300">Symptoms</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycleHistory.map((cycle, index) => (
                  <TableRow key={cycle.startDate.toISOString()} 
                    className="analysis-card hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-purple-50/50 
                    dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 transition-colors">
                    <TableCell className="font-medium text-pink-600 dark:text-pink-300">{formatDate(cycle.startDate)}</TableCell>
                    <TableCell className="font-medium text-purple-600 dark:text-purple-300">{formatDate(cycle.endDate)}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {cycle.length} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-red-500"
                            style={{ width: `${cycle.averagePainLevel * 10}%` }}
                          />
                        </div>
                        <span className="font-medium text-orange-600 dark:text-orange-300">
                          {cycle.averagePainLevel}/10
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`capitalize ${
                          cycle.dominantMood === 'happy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200' :
                          cycle.dominantMood === 'sad' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200' :
                          cycle.dominantMood === 'irritated' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200' :
                          cycle.dominantMood === 'anxious' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200'
                        }`}
                      >
                        {cycle.dominantMood}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {cycle.symptoms.slice(0, 3).map((symptom) => (
                          <Badge 
                            key={symptom} 
                            className={`text-xs ${
                              symptom.toLowerCase().includes('pain') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                              symptom.toLowerCase().includes('mood') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                              symptom.toLowerCase().includes('energy') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              symptom.toLowerCase().includes('sleep') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}
                          >
                            {symptom}
                          </Badge>
                        ))}
                        {cycle.symptoms.length > 3 && (
                          <Badge className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            +{cycle.symptoms.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        );
      
      case "stats":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="stats-card bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Average Cycle Length
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="stats-value text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {cycleHistory.length > 0
                    ? Math.round(
                        cycleHistory.reduce((sum, cycle) => sum + cycle.length, 0) /
                          cycleHistory.length
                      )
                    : 0}{" "}
                  <span className="text-lg text-gray-500">days</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Based on {cycleHistory.length} recorded cycles
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Most Common Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cycleHistory
                    .flatMap((cycle) => cycle.symptoms)
                    .reduce((unique: string[], symptom) => 
                      unique.includes(symptom) ? unique : [...unique, symptom], 
                      []
                    )
                    .slice(0, 5)
                    .map((symptom, index) => (
                      <div
                        key={symptom}
                        className={`flex items-center justify-between p-2 rounded-lg 
                        ${index % 2 === 0 ? 'bg-blue-50/50 dark:bg-blue-900/30' : 'bg-cyan-50/50 dark:bg-cyan-900/30'}`}
                      >
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{symptom}</span>
                        <Badge 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        >
                          {cycleHistory.filter((cycle) =>
                            cycle.symptoms.includes(symptom)
                          ).length}{" "}
                          cycles
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pain Level Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cycleHistory.slice(-5).map((cycle, index) => (
                    <div
                      key={cycle.startDate.toISOString()}
                      className={`p-3 rounded-lg ${
                        index % 2 === 0 ? 'bg-purple-50/50 dark:bg-purple-900/30' : 'bg-pink-50/50 dark:bg-pink-900/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                          {formatDate(cycle.startDate)}
                        </span>
                        <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {cycle.averagePainLevel}/10
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ 
                            width: `${cycle.averagePainLevel * 10}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {notification.visible && (
        <div className="fixed top-4 right-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">
          {notification.message}
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-200/30 to-purple-200/20 dark:from-pink-900/20 dark:to-purple-900/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200/30 to-purple-200/20 dark:from-blue-900/20 dark:to-purple-900/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Menstruation Cycle Tracker
            </h1>
            <p className="text-muted-foreground mt-2">Track, understand, and nurture your menstrual health</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4 text-pink-500" />
            Set Reminders
          </Button>
        </div>
      </motion.div>

      <Tabs defaultValue="daily-log" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-900/20 p-1 rounded-lg">
          <TabsTrigger value="daily-log" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-pink-600">
            <CalendarDays className="h-4 w-4" />
            Daily Log
          </TabsTrigger>
          <TabsTrigger value="cycle-view" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-600">
            <LineChart className="h-4 w-4" />
            Cycle View
          </TabsTrigger>
          <TabsTrigger value="find-care" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-600">
            <Heart className="h-4 w-4" />
            Find Care
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-log" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-pink-50/50 dark:from-slate-950 dark:to-pink-900/10">
                <CardHeader className="border-b border-pink-100 dark:border-pink-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-pink-500" />
                    Calendar
                  </CardTitle>
                  <CardDescription>Track your cycle and symptoms</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        const existingLog = cycleDays.find(
                          day => day.date.toDateString() === date.toDateString()
                        );
                        if (existingLog) {
                          setFlow(existingLog.flow);
                          setPainLevel(existingLog.painLevel);
                          setMood(existingLog.mood);
                          setSelectedSymptoms(existingLog.symptoms);
                        } else {
                          // Reset form for new entry
                          setPainLevel(0);
                          setFlow("medium");
                          setMood("normal");
                          setSelectedSymptoms([]);
                        }
                      }
                    }}
                    modifiers={{
                      highlighted: (date) => getDateHighlight(date) !== null,
                      hasLog: (date) => hasLogForDate(date),
                    }}
                    modifiersClassNames={{
                      highlighted: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 font-medium",
                    }}
                    className="rounded-md border border-pink-100 dark:border-pink-900/20 p-3"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-950 dark:to-purple-900/10">
                <CardHeader className="border-b border-purple-100 dark:border-purple-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Daily Log
                  </CardTitle>
                  <CardDescription>Record your daily symptoms and mood</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-red-500" />
                        Flow Intensity
                      </label>
                      <Select value={flow} onValueChange={(value: any) => setFlow(value)}>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-purple-100 dark:border-purple-900/20">
                          <SelectValue placeholder="Select flow intensity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-pink-300" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-pink-500" />
                              Medium
                            </div>
                          </SelectItem>
                          <SelectItem value="heavy">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-pink-700" />
                              Heavy
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-500" />
                        Pain Level
                      </label>
                      <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-lg border border-purple-100 dark:border-purple-900/20">
                        <Slider
                          value={[painLevel]}
                          onValueChange={(value) => setPainLevel(value[0])}
                          max={10}
                          step={1}
                          className="pain-level-slider"
                        />
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>No Pain</span>
                          <span className="font-medium text-orange-500">{painLevel}/10</span>
                          <span>Severe</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Smile className="h-4 w-4 text-yellow-500" />
                        Mood
                      </label>
                      <Select value={mood} onValueChange={(value) => setMood(value)}>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-purple-100 dark:border-purple-900/20">
                          <SelectValue placeholder="How are you feeling?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="happy">
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-500">😊</span>
                              Happy
                            </div>
                          </SelectItem>
                          <SelectItem value="normal">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-500">😐</span>
                              Normal
                            </div>
                          </SelectItem>
                          <SelectItem value="sad">
                            <div className="flex items-center gap-2">
                              <span className="text-purple-500">😢</span>
                              Sad
                            </div>
                          </SelectItem>
                          <SelectItem value="irritated">
                            <div className="flex items-center gap-2">
                              <span className="text-red-500">😠</span>
                              Irritated
                            </div>
                          </SelectItem>
                          <SelectItem value="anxious">
                            <div className="flex items-center gap-2">
                              <span className="text-orange-500">😰</span>
                              Anxious
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={addCycleDay} 
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md group"
                  >
                    <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                    Log Today
                  </Button>
                </CardContent>
              </Card>

              <SymptomsTracker
                selectedSymptoms={selectedSymptoms}
                onSymptomsChange={setSelectedSymptoms}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="md:col-span-2"
            >
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-950 dark:to-blue-900/10">
                <CardHeader className="border-b border-blue-100 dark:border-blue-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Cycle Insights
                  </CardTitle>
                  <CardDescription>Track your cycle patterns and predictions</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-white/50 dark:bg-slate-900/50 border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                            <CalendarDays className="h-5 w-5 text-pink-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Cycle Length</p>
                            <h3 className="text-2xl font-bold text-pink-600">{cycleLength} days</h3>
                          </div>
                        </div>
                        <Progress value={(cycleLength / 35) * 100} className="mt-3 bg-pink-100 dark:bg-pink-900/30" />
                      </CardContent>
                    </Card>

                    <Card className="bg-white/50 dark:bg-slate-900/50 border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Brain className="h-5 w-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Current Phase</p>
                            <h3 className="text-2xl font-bold text-purple-600">Day {currentCycleDay}</h3>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                            {currentCycleDay <= 5 ? "Menstrual" :
                             currentCycleDay <= 14 ? "Follicular" :
                             currentCycleDay <= 21 ? "Ovulation" : "Luteal"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/50 dark:bg-slate-900/50 border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Droplets className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Fertility Window</p>
                            {calculateFertilityWindow() ? (
                              <h3 className="text-lg font-bold text-blue-600">
                                {calculateFertilityWindow()?.fertilityStart.toLocaleDateString()} -{" "}
                                {calculateFertilityWindow()?.fertilityEnd.toLocaleDateString()}
                              </h3>
                            ) : (
                              <Badge variant="outline">Log period to see predictions</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/50 dark:bg-slate-900/50 border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <HeartPulse className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Next Period</p>
                            {lastPeriodStart ? (
                              <h3 className="text-lg font-bold text-red-600">
                                {new Date(
                                  lastPeriodStart.getTime() + cycleLength * 24 * 60 * 60 * 1000
                                ).toLocaleDateString()}
                              </h3>
                            ) : (
                              <Badge variant="outline">Log period to see predictions</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-900/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Moon className="h-4 w-4 text-purple-500" />
                        <h3 className="font-medium">Sleep Quality</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Good</span>
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30">7.5 hrs avg</Badge>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-900/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="h-4 w-4 text-blue-500" />
                        <h3 className="font-medium">Temperature</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Normal</span>
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30">98.6°F</Badge>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Apple className="h-4 w-4 text-green-500" />
                        <h3 className="font-medium">Nutrition</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Iron Intake</span>
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30">18mg/day</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="cycle-view">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full">
              <CycleVisualizer
                cycleLength={cycleLength}
                currentDay={currentCycleDay}
                lastPeriodStart={lastPeriodStart}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-950 dark:to-purple-900/10">
                <CardHeader className="border-b border-purple-100 dark:border-purple-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-purple-500" />
                    Cycle Information
                  </CardTitle>
                  <CardDescription>Customize and track your cycle details</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <CalendarDays className="h-4 w-4 text-purple-500" />
                      Cycle Length (days)
                    </label>
                    <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-lg border border-purple-100 dark:border-purple-900/20">
                      <div className="flex items-center space-x-4">
                        <Slider
                          value={[cycleLength]}
                          onValueChange={(value) => setCycleLength(value[0])}
                          min={21}
                          max={35}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-lg font-bold text-purple-600">{cycleLength}</span>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>Short</span>
                        <span>Average</span>
                        <span>Long</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-white/50 dark:bg-slate-900/50 border border-purple-100 dark:border-purple-900/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-purple-500" />
                          <h3 className="font-medium">Current Phase</h3>
                        </div>
                        <Badge variant="secondary" className="text-lg bg-purple-100 dark:bg-purple-900/30">
                          Day {currentCycleDay}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/50 dark:bg-slate-900/50 border border-purple-100 dark:border-purple-900/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplet className="h-4 w-4 text-red-500" />
                          <h3 className="font-medium">Last Period</h3>
                        </div>
                        {lastPeriodStart ? (
                          <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-600">
                            {lastPeriodStart.toLocaleDateString()}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not set</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-white/50 dark:bg-slate-900/50 border border-purple-100 dark:border-purple-900/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="h-4 w-4 text-blue-500" />
                        <h3 className="font-medium">Cycle Phase Tips</h3>
                      </div>
                      <div className="space-y-3 text-sm">
                        {currentCycleDay <= 5 ? (
                          <>
                            <p className="text-muted-foreground">During menstruation:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Get plenty of rest</li>
                              <li>Stay hydrated</li>
                              <li>Consider iron-rich foods</li>
                              <li>Light exercise can help with cramps</li>
                            </ul>
                          </>
                        ) : currentCycleDay <= 14 ? (
                          <>
                            <p className="text-muted-foreground">During the follicular phase:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Energy levels are rising</li>
                              <li>Good time for new projects</li>
                              <li>Focus on strength training</li>
                              <li>Socialize and network</li>
                            </ul>
                          </>
                        ) : currentCycleDay <= 21 ? (
                          <>
                            <p className="text-muted-foreground">During ovulation:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Peak energy levels</li>
                              <li>Good time for important decisions</li>
                              <li>High fertility window</li>
                              <li>Maintain active lifestyle</li>
                            </ul>
                          </>
                        ) : (
                          <>
                            <p className="text-muted-foreground">During the luteal phase:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Practice self-care</li>
                              <li>Monitor mood changes</li>
                              <li>Focus on relaxation</li>
                              <li>Prepare for next cycle</li>
                            </ul>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="find-care">
          <ClinicLocator />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-pink-50/30 dark:from-slate-950 dark:to-pink-900/10 border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Cycle History</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={historyView === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHistoryView("list")}
                    className={historyView === "list" ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" : ""}
                  >
                    <ListIcon className="h-4 w-4 mr-1" />
                    List View
                  </Button>
                  <Button
                    variant={historyView === "stats" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHistoryView("stats")}
                    className={historyView === "stats" ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" : ""}
                  >
                    <BarChart className="h-4 w-4 mr-1" />
                    Statistics
                  </Button>
                </div>
              </div>
              <CardDescription>
                Track your cycle patterns and identify trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderHistoryContent()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}