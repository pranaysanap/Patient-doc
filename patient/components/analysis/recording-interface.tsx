"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Heart, Activity, TrendingUp, TrendingDown, Brain, AlertCircle } from "lucide-react";

export function RecordingInterface() {
  const [heartRate, setHeartRate] = useState(72);
  const [confidence, setConfidence] = useState(98.7);
  const [variability, setVariability] = useState(45);
  const [trend, setTrend] = useState<"up" | "down" | null>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const variation = Math.random() * 2 - 1;
        const newRate = Number((prev + variation).toFixed(1));
        setTrend(newRate > prev ? "up" : "down");
        return newRate;
      });
      
      setVariability(prev => {
        const change = Math.random() * 2 - 1;
        return Number((prev + change).toFixed(1));
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="heart-monitor">
      <div className="monitor-header">
        <div className="monitor-title">
          <div className="monitor-icon">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl text-primary">Heart Analysis</h1>
            <p className="text-sm text-primary/60">Real-time Monitoring</p>
          </div>
        </div>
        <div className="live-badge">
          <div className="status-dot" />
          <span className="text-sm text-primary">Live</span>
        </div>
      </div>

      <div className="ecg-display">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          className="animate-ecg"
        >
          <path
            className="ecg-line"
            d="M0,50 
              L100,50 L120,50 L130,20 L140,80 L150,50 
              L300,50 L320,50 L330,20 L340,80 L350,50 
              L500,50 L520,50 L530,20 L540,80 L550,50 
              L700,50 L720,50 L730,20 L740,80 L750,50 
              L900,50 L920,50 L930,20 L940,80 L950,50 
              L1000,50"
          />
        </svg>
      </div>

      <div className="metrics-container">
        <div className="metric-group">
          <div className="metric-label">
            <Heart className="h-4 w-4" />
            Heart Rate
          </div>
          <div className="metric-value">
            {heartRate}
            <span className="metric-unit">BPM</span>
            {trend && (
              <span className={`stat-trend ${trend === "up" ? "trend-up" : "trend-down"}`}>
                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {(trend === "up" ? "+" : "-")}0.1
              </span>
            )}
          </div>
        </div>

        <div className="metric-group">
          <div className="metric-label">
            <Brain className="h-4 w-4" />
            AI Confidence
          </div>
          <div className="metric-value">
            {confidence}
            <span className="metric-unit">%</span>
          </div>
        </div>

        <div className="metric-group">
          <div className="metric-label">
            <Activity className="h-4 w-4" />
            HRV Index
          </div>
          <div className="metric-value">
            {variability}
            <span className="metric-unit">ms</span>
          </div>
        </div>
      </div>

      <div className="assessment">
        <h2 className="assessment-label">
          <AlertCircle className="h-4 w-4" />
          AI Assessment
        </h2>
        <div className="assessment-value">
          <div className="status-dot" />
          Normal sinus rhythm detected
        </div>
      </div>
    </div>
  );
}