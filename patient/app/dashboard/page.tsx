"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Calendar, Heart, Home, MessageSquare, Settings, User, Wind, CloudSun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dynamic from "next/dynamic";

const HeartRateChart = dynamic(() => import("@/components/dashboard/heart-rate-chart"), { ssr: false });
import { doctorConfig } from "@/lib/doctor-config";
import { Sidebar } from "@/components/layout/sidebar";
import * as patientApi from "@/lib/api";

const defaultHeartData = [
  { time: "10:00", bpm: 72 },
  { time: "10:05", bpm: 75 },
  { time: "10:10", bpm: 78 },
  { time: "10:15", bpm: 74 },
  { time: "10:20", bpm: 71 },
  { time: "10:25", bpm: 73 },
  { time: "10:30", bpm: 76 },
];

export default function Dashboard() {
  const [heartData, setHeartData] = useState(defaultHeartData);
  const [vitals, setVitals] = useState({
    heartRate: { value: "72 BPM", sub: "+2% from yesterday" },
    bloodOxygen: { value: "98%", sub: "Stable" },
    sleepScore: { value: "85/100", sub: "Good Quality" },
    stressLevel: { value: "Low", sub: "Relaxed State" },
  });
  const [upcomingApts, setUpcomingApts] = useState<any[]>([
    { name: doctorConfig.name, type: "General Consultation", date: "Tomorrow, 10:00 AM" },
    { name: doctorConfig.name, type: "Follow-up", date: "Jan 24, 2:30 PM" }
  ]);

  // Fetch real vitals from backend
  useEffect(() => {
    const loadHealthData = async () => {
      try {
        const metricsResp = await patientApi.fetchMyHealthMetrics();
        if (metricsResp.success && metricsResp.data) {
          const d = metricsResp.data;
          if (d.vitals) {
            setVitals({
              heartRate: {
                value: `${d.vitals.heartRate?.current || 72} BPM`,
                sub: d.vitals.heartRate?.max ? `Max: ${d.vitals.heartRate.max} BPM` : '+2% from yesterday',
              },
              bloodOxygen: {
                value: `${d.vitals.bloodOxygen?.current || 98}%`,
                sub: d.vitals.bloodOxygen?.min ? `Min: ${d.vitals.bloodOxygen.min}%` : 'Stable',
              },
              sleepScore: {
                value: `${d.vitals.sleepScore || 85}/100`,
                sub: (d.vitals.sleepScore || 85) >= 80 ? 'Good Quality' : 'Needs Improvement',
              },
              stressLevel: {
                value: d.vitals.stressLevel || 'Low',
                sub: d.vitals.stressLevel === 'high' ? 'Take a break' : 'Relaxed State',
              },
            });
            // Populate heart rate chart from readings if available
            if (d.vitals.heartRate?.readings?.length) {
              setHeartData(d.vitals.heartRate.readings.map((r: any) => ({
                time: r.time,
                bpm: r.bpm,
              })));
            }
          }
        }
      } catch (err) {
        // Keep default values if backend is unavailable
        console.log('Using default vitals (backend unavailable)');
      }
    };

    const loadAppointments = async () => {
      try {
        const aptResp = await patientApi.fetchMyAppointments();
        if (aptResp.success && aptResp.data?.length > 0) {
          const upcoming = aptResp.data
            .filter((a: any) => ['pending', 'confirmed'].includes(a.status))
            .slice(0, 2)
            .map((a: any) => ({
              name: doctorConfig.name,
              type: a.purpose || 'Consultation',
              date: new Date(a.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            }));
          if (upcoming.length > 0) {
            setUpcomingApts(upcoming);
          }
        }
      } catch (err) {
        console.log('Using default appointments (backend unavailable)');
      }
    };

    loadHealthData();
    loadAppointments();
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, here's your daily health summary.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full border border-orange-500/20">
              <span className="animate-pulse">🔥</span>
              <span className="text-sm font-bold">12 Day Streak</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/30 px-4 py-2 rounded-full border border-border/50">
              <CloudSun className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">24°C, Sunny</span>
            </div>
            <Button>New Check-up</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Heart Rate", value: vitals.heartRate.value, icon: Heart, color: "text-red-500", sub: vitals.heartRate.sub },
            { label: "Blood Oxygen", value: vitals.bloodOxygen.value, icon: Wind, color: "text-blue-500", sub: vitals.bloodOxygen.sub },
            { label: "Sleep Score", value: vitals.sleepScore.value, icon: CloudSun, color: "text-purple-500", sub: vitals.sleepScore.sub },
            { label: "Stress Level", value: vitals.stressLevel.value, icon: Activity, color: "text-green-500", sub: vitals.stressLevel.sub },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-secondary ${stat.color} bg-opacity-10`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <span className="text-xs font-medium bg-green-500/10 text-green-500 px-2 py-1 rounded-full">Normal</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts & AI Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Real-time Heart Rate</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={heartData}>
                    <defs>
                      <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    />
                    <Area type="monotone" dataKey="bpm" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorBpm)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Card */}
          <div className="lg:col-span-1">
            <Card className="h-full bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  AI Health Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <strong className="text-foreground">Analysis:</strong> Your heart rate variability indicates good recovery status. Lung sounds from your last scan were clear.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex gap-2 items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Maintain hydration level (2L/day)
                    </li>
                    <li className="flex gap-2 items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Schedule follow-up cardio scan
                    </li>
                  </ul>
                </div>

                <Button className="w-full mt-4">Generate Full Report</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Appointments Row */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingApts.map((apt, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:bg-secondary/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{apt.name}</p>
                    <p className="text-sm text-muted-foreground">{apt.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{apt.date}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">Reschedule</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}