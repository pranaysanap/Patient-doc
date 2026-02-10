"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function AIProcessingVisualizer() {
  const [activeNode, setActiveNode] = useState(0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode(prev => (prev + 1) % 5);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 0;
        }
        return prev + 1;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [activeNode]);
  
  const nodes = [
    { id: 0, label: "Sound Input", description: "Processing raw audio data" },
    { id: 1, label: "Feature Extraction", description: "Identifying key acoustic patterns" },
    { id: 2, label: "Neural Network", description: "Analyzing with trained AI model" },
    { id: 3, label: "Pattern Matching", description: "Comparing with known conditions" },
    { id: 4, label: "Diagnostic Output", description: "Generating results and confidence scores" },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Processing Pipeline</CardTitle>
        <CardDescription>
          Watch how our AI analyzes your health sounds in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="relative">
            {/* Connection lines */}
            <div className="absolute top-6 left-0 w-full h-0.5 bg-muted" />
            
            {/* Nodes */}
            <div className="relative flex justify-between">
              {nodes.map((node, index) => (
                <div key={node.id} className="flex flex-col items-center">
                  <motion.div
                    className={`h-12 w-12 rounded-full flex items-center justify-center z-10 ${
                      activeNode === index 
                        ? "bg-primary text-primary-foreground" 
                        : activeNode > index 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                    }`}
                    animate={{
                      scale: activeNode === index ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: activeNode === index ? Infinity : 0,
                      repeatType: "reverse",
                    }}
                  >
                    {index + 1}
                  </motion.div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${
                      activeNode === index ? "text-primary" : "text-foreground"
                    }`}>
                      {node.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[120px]">
                      {node.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Current process */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {nodes[activeNode].label}
              </span>
              <span className="text-muted-foreground">
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Neural network visualization */}
          {activeNode === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-32 bg-muted/50 rounded-lg p-4 flex items-center justify-center"
            >
              <div className="relative w-full h-full">
                {/* Input layer */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={`input-${i}`}
                      className="h-4 w-4 rounded-full bg-primary"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
                
                {/* Hidden layer 1 */}
                <div className="absolute left-1/4 top-0 bottom-0 flex flex-col justify-around">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                      key={`hidden1-${i}`}
                      className="h-3 w-3 rounded-full bg-chart-2"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
                
                {/* Hidden layer 2 */}
                <div className="absolute left-2/4 top-0 bottom-0 flex flex-col justify-around">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <motion.div
                      key={`hidden2-${i}`}
                      className="h-2 w-2 rounded-full bg-chart-3"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
                
                {/* Hidden layer 3 */}
                <div className="absolute left-3/4 top-0 bottom-0 flex flex-col justify-around">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={`hidden3-${i}`}
                      className="h-3 w-3 rounded-full bg-chart-4"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
                
                {/* Output layer */}
                <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={`output-${i}`}
                      className="h-4 w-4 rounded-full bg-chart-5"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}