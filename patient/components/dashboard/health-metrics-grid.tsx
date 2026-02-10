"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Wind, 
  Activity, 
  Thermometer, 
  BarChart2, 
  TrendingUp, 
  TrendingDown,
  MoreHorizontal,
  Maximize2,
  X
} from "lucide-react";

// Import recharts components individually to avoid any naming conflicts
import { ResponsiveContainer } from "recharts";
import { LineChart } from "recharts";
import { Line } from "recharts";
import { AreaChart } from "recharts";
import { Area } from "recharts";
import { BarChart } from "recharts";
import { Bar } from "recharts";
import { XAxis } from "recharts";
import { YAxis } from "recharts";
import { CartesianGrid } from "recharts";
import { Tooltip } from "recharts";

// Sample data for charts
const heartRateData = [
  { time: "12 AM", value: 62 },
  { time: "3 AM", value: 58 },
  { time: "6 AM", value: 65 },
  { time: "9 AM", value: 78 },
  { time: "12 PM", value: 82 },
  { time: "3 PM", value: 76 },
  { time: "6 PM", value: 74 },
  { time: "9 PM", value: 68 },
  { time: "Now", value: 64 },
];

const bloodPressureData = [
  { time: "12 AM", systolic: 118, diastolic: 76 },
  { time: "3 AM", systolic: 115, diastolic: 74 },
  { time: "6 AM", systolic: 120, diastolic: 78 },
  { time: "9 AM", systolic: 125, diastolic: 82 },
  { time: "12 PM", systolic: 128, diastolic: 84 },
  { time: "3 PM", systolic: 126, diastolic: 82 },
  { time: "6 PM", systolic: 124, diastolic: 80 },
  { time: "9 PM", systolic: 120, diastolic: 78 },
  { time: "Now", systolic: 118, diastolic: 76 },
];

const oxygenData = [
  { time: "12 AM", value: 97 },
  { time: "3 AM", value: 96 },
  { time: "6 AM", value: 97 },
  { time: "9 AM", value: 98 },
  { time: "12 PM", value: 98 },
  { time: "3 PM", value: 97 },
  { time: "6 PM", value: 97 },
  { time: "9 PM", value: 96 },
  { time: "Now", value: 97 },
];

const respiratoryRateData = [
  { time: "12 AM", value: 14 },
  { time: "3 AM", value: 13 },
  { time: "6 AM", value: 14 },
  { time: "9 AM", value: 16 },
  { time: "12 PM", value: 17 },
  { time: "3 PM", value: 16 },
  { time: "6 PM", value: 15 },
  { time: "9 PM", value: 14 },
  { time: "Now", value: 14 },
];

const temperatureData = [
  { time: "12 AM", value: 98.2 },
  { time: "3 AM", value: 98.0 },
  { time: "6 AM", value: 97.8 },
  { time: "9 AM", value: 98.4 },
  { time: "12 PM", value: 98.6 },
  { time: "3 PM", value: 98.8 },
  { time: "6 PM", value: 98.6 },
  { time: "9 PM", value: 98.4 },
  { time: "Now", value: 98.2 },
];

const activityData = [
  { day: "Mon", steps: 8245 },
  { day: "Tue", steps: 7890 },
  { day: "Wed", steps: 9120 },
  { day: "Thu", steps: 8670 },
  { day: "Fri", steps: 7650 },
  { day: "Sat", steps: 10240 },
  { day: "Sun", steps: 6780 },
];

export function HealthMetricsGrid() {
  const [timeRange, setTimeRange] = useState("day");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  const handleExpandCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <motion.h2 
          className="text-xl font-semibold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Health Metrics
        </motion.h2>
        <Tabs defaultValue="day" value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Heart Rate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            ...(expandedCard === "heart-rate" ? {
              position: "fixed",
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              width: "80vw",
              height: "80vh",
              zIndex: 50,
            } : {})
          }}
          transition={{ duration: 0.3 }}
          whileHover={{ y: expandedCard ? 0 : -5 }}
          onHoverStart={() => setHoveredCard("heart-rate")}
          onHoverEnd={() => setHoveredCard(null)}
          className={`${expandedCard === "heart-rate" ? "fixed inset-0 z-50 m-auto w-4/5 h-4/5 overflow-auto" : ""}`}
        >
          <Card className={`overflow-hidden h-full ${expandedCard === "heart-rate" ? "shadow-2xl" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <CardTitle>Heart Rate</CardTitle>
                    <CardDescription>Beats per minute</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {expandedCard === "heart-rate" ? (
                    <Button variant="ghost" size="icon" onClick={() => setExpandedCard(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => handleExpandCard("heart-rate")}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold">64 BPM</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingDown className="mr-1 h-4 w-4 text-rose-500" />
                    <span>4 BPM lower than yesterday</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Range</div>
                  <div className="text-sm text-muted-foreground">58-82 BPM</div>
                </div>
              </div>
              
              <div className={`${expandedCard === "heart-rate" ? "h-[calc(100%-120px)]" : "h-48"}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={heartRateData}>
                    <defs>
                      <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(244, 63, 94)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="rgb(244, 63, 94)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="rgba(0, 0, 0, 0.5)"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="rgba(0, 0, 0, 0.5)"
                      tick={{ fontSize: 12 }}
                      domain={[50, 90]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "white",
                        borderColor: "rgba(0, 0, 0, 0.1)",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value) => [`${value} BPM`, "Heart Rate"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="rgb(244, 63, 94)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "rgb(244, 63, 94)" }}
                      activeDot={{ r: 6, fill: "rgb(244, 63, 94)" }}
                      animationDuration={1000}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="none" 
                      fillOpacity={1} 
                      fill="url(#heartRateGradient)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {expandedCard === "heart-rate" && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Average</div>
                    <div className="text-xl font-bold">72 BPM</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Min</div>
                    <div className="text-xl font-bold">58 BPM</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Max</div>
                    <div className="text-xl font-bold">82 BPM</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Blood Pressure Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            ...(expandedCard === "blood-pressure" ? {
              position: "fixed",
              top: "50%",
              left: "50%",
              x: "-50%",
              y: "-50%",
              width: "80vw",
              height: "80vh",
              zIndex: 50,
            } : {})
          }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ y: expandedCard ? 0 : -5 }}
          onHoverStart={() => setHoveredCard("blood-pressure")}
          onHoverEnd={() => setHoveredCard(null)}
          className={`${expandedCard === "blood-pressure" ? "fixed inset-0 z-50 m-auto w-4/5 h-4/5 overflow-auto" : ""}`}
        >
          <Card className={`overflow-hidden h-full ${expandedCard === "blood-pressure" ? "shadow-2xl" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>Blood Pressure</CardTitle>
                    <CardDescription>Systolic/Diastolic</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {expandedCard === "blood-pressure" ? (
                    <Button variant="ghost" size="icon" onClick={() => setExpandedCard(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => handleExpandCard("blood-pressure")}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold">118/76 mmHg</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
                    <span>Normal range</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-sm text-green-500">Healthy</div>
                </div>
              </div>
              
              <div className={`${expandedCard === "blood-pressure" ? "h-[calc(100%-120px)]" : "h-48"}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bloodPressureData}>
                    <defs>
                      <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="diastolicGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(99, 102, 241)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="rgb(99, 102, 241)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="rgba(0, 0, 0, 0.5)"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="rgba(0, 0, 0, 0.5)"
                      tick={{ fontSize: 12 }}
                      domain={[70, 140]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "white",
                        borderColor: "rgba(0, 0, 0, 0.1)",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value, name) => {
                        return [
                          `${value} mmHg`, 
                          name === "systolic" ? "Systolic" : "Diastolic"
                        ];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "rgb(59, 130, 246)" }}
                      activeDot={{ r: 6, fill: "rgb(59, 130, 246)" }}
                      animationDuration={1000}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="rgb(99, 102, 241)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "rgb(99, 102, 241)" }}
                      activeDot={{ r: 6, fill: "rgb(99, 102, 241)" }}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {expandedCard === "blood-pressure" && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Average Systolic</div>
                    <div className="text-xl font-bold">122 mmHg</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Average Diastolic</div>
                    <div className="text-xl font-bold">79 mmHg</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Classification</div>
                    <div className="text-xl font-bold text-green-500">Normal</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}