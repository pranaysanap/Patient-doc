"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Activity, TrendingUp, CheckCircle } from "lucide-react";

const heartData = [
  { name: "Jan", EchoMed: 97.2, Traditional: 92.1 },
  { name: "Feb", EchoMed: 97.5, Traditional: 92.3 },
  { name: "Mar", EchoMed: 97.8, Traditional: 92.4 },
  { name: "Apr", EchoMed: 98.1, Traditional: 92.5 },
  { name: "May", EchoMed: 98.4, Traditional: 92.7 },
  { name: "Jun", EchoMed: 98.7, Traditional: 92.8 },
  { name: "Jul", EchoMed: 99.0, Traditional: 93.0 },
  { name: "Aug", EchoMed: 99.2, Traditional: 93.1 },
];

const lungData = [
  { name: "Jan", EchoMed: 96.5, Traditional: 91.2 },
  { name: "Feb", EchoMed: 96.8, Traditional: 91.4 },
  { name: "Mar", EchoMed: 97.1, Traditional: 91.5 },
  { name: "Apr", EchoMed: 97.4, Traditional: 91.7 },
  { name: "May", EchoMed: 97.7, Traditional: 91.8 },
  { name: "Jun", EchoMed: 98.0, Traditional: 92.0 },
  { name: "Jul", EchoMed: 98.3, Traditional: 92.1 },
  { name: "Aug", EchoMed: 98.5, Traditional: 92.3 },
];

export function AccuracyGraph() {
  const [activeTab, setActiveTab] = useState("heart");

  return (
    <section className="py-24 bg-secondary/5 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Unmatched Precision</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Validated against clinical gold standards, EchoMed delivers hospital-grade accuracy from the comfort of your home.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden ring-1 ring-border/50">
            <CardContent className="p-6 md:p-10">
              <Tabs defaultValue="heart" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Activity className="h-6 w-6 text-primary" />
                      Diagnostic Performance
                    </CardTitle>
                    <CardDescription>
                      Comparative study: EchoMed AI vs. Standard Mobile Tools (2025)
                    </CardDescription>
                  </div>
                  <TabsList className="grid w-full md:w-auto grid-cols-2 bg-muted/50 p-1">
                    <TabsTrigger value="heart" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Heart Analysis</TabsTrigger>
                    <TabsTrigger value="lung" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Lung Analysis</TabsTrigger>
                  </TabsList>
                </div>

                {["heart", "lung"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-0 space-y-8">
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={tab === "heart" ? heartData : lungData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorEcho" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorTrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            domain={[90, 100]}
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickFormatter={(value) => `${value}%`}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "var(--radius)",
                              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            }}
                            itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                            formatter={(value) => [`${value}%`, ""]}
                          />
                          <Legend iconType="circle" />
                          <Area
                            type="monotone"
                            dataKey="EchoMed"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorEcho)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="Traditional"
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={2}
                            fill="url(#colorTrad)"
                            strokeDasharray="5 5"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center transform transition-all hover:scale-105">
                        <div className="mx-auto w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Current Accuracy</p>
                        <p className="text-4xl font-bold text-primary tracking-tight">
                          {tab === "heart" ? "99.2%" : "98.5%"}
                        </p>
                      </div>
                      <div className="bg-secondary/50 border border-border/50 rounded-2xl p-6 text-center transform transition-all hover:scale-105">
                        <div className="mx-auto w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Improvement</p>
                        <p className="text-4xl font-bold text-foreground">+6.1%</p>
                      </div>
                      <div className="bg-secondary/50 border border-border/50 rounded-2xl p-6 text-center transform transition-all hover:scale-105">
                        <div className="mx-auto w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                          <Activity className="h-5 w-5 text-blue-500" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Clinical Studies</p>
                        <p className="text-4xl font-bold text-foreground">12+</p>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}