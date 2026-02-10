"use client";

import { useEffect, useState } from 'react';
import { Heart, Download, CheckCircle, AlertCircle, Activity, Zap, Brain, Waves } from 'lucide-react';
import './heart-monitor.css';

export default function HeartMonitor() {
  const [ecgPoints, setEcgPoints] = useState<number[]>([]);
  
  useEffect(() => {
    // Simulate ECG data with more dramatic peaks
    const generateEcgPoint = () => {
      const baseValue = 50;
      const peak = Math.random() > 0.9 ? 150 : baseValue;
      const valley = Math.random() > 0.95 ? 10 : baseValue;
      return Math.random() > 0.5 ? peak : valley;
    };

    const interval = setInterval(() => {
      setEcgPoints(prev => {
        const newPoints = [...prev, generateEcgPoint()];
        return newPoints.slice(-150); // Increased points for smoother animation
      });
    }, 50); // Faster updates for smoother animation

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="heart-monitor-container">
      <div className="cyber-grid" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="cyber-title">
          <Heart className="heart-icon w-12 h-12" />
          Heart Analysis
          <span className="text-base font-normal opacity-70">Real-time Monitoring</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="status-bar">
            <span className="status-dot" />
            Live Monitoring
          </div>
          <button className="cyber-button">
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </div>
      </div>

      {/* ECG Display */}
      <div className="ecg-container">
        <svg className="ecg-line" viewBox="0 0 1000 200" preserveAspectRatio="none">
          <path
            d={`M 0,100 ${ecgPoints.map((point, i) => 
              `L ${i * (1000 / 150)},${point}`).join(' ')}`}
          />
        </svg>
      </div>

      {/* Metrics */}
      <div className="metrics-container">
        <div className="metric-panel">
          <div className="metric-name">Heart Rate</div>
          <div className="metric-value">70.5<span className="metric-unit">BPM</span></div>
        </div>
        <div className="metric-panel">
          <div className="metric-name">AI Confidence</div>
          <div className="metric-value">98.7<span className="metric-unit">%</span></div>
        </div>
        <div className="metric-panel">
          <div className="metric-name">HRV Index</div>
          <div className="metric-value">44<span className="metric-unit">ms</span></div>
        </div>
      </div>

      {/* Findings */}
      <div className="findings-grid">
        <div className="finding-panel">
          <div className="finding-title">
            <Brain className="finding-icon w-6 h-6" />
            Primary Assessment
          </div>
          <div className="finding-text">
            Normal Sinus Rhythm detected with 92% confidence. All vital signs within optimal ranges.
          </div>
        </div>
        
        <div className="finding-panel">
          <div className="finding-title">
            <Waves className="finding-icon w-6 h-6" />
            Regular Rhythm
          </div>
          <div className="finding-text">
            Heart rhythm maintains consistent intervals between beats, indicating strong cardiac health.
          </div>
        </div>
        
        <div className="finding-panel">
          <div className="finding-title">
            <Zap className="finding-icon w-6 h-6" />
            Heart Rate Variability
          </div>
          <div className="finding-text">
            HRV patterns suggest optimal autonomic nervous system function and stress resilience.
          </div>
        </div>
        
        <div className="finding-panel">
          <div className="finding-title">
            <Activity className="finding-icon w-6 h-6" />
            Waveform Analysis
          </div>
          <div className="finding-text">
            QRS complex and T-wave morphology indicate normal ventricular depolarization and repolarization.
          </div>
        </div>
      </div>
    </div>
  );
} 