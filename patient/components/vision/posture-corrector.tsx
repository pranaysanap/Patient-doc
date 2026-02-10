"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Pose, Results, POSE_LANDMARKS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export function PostureCorrector() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzerActive, setIsAnalyzerActive] = useState(false);
  const [postureStatus, setPostureStatus] = useState<"Good" | "Bad" | "Detecting">("Detecting");
  const [neckAngle, setNeckAngle] = useState(0);

  // Calculate angle between three points (A, B, C)
  const calculateAngle = (a: any, b: any, c: any) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  const onResults = (results: Results) => {
    if (!results.poseLandmarks || !canvasRef.current || !webcamRef.current?.video) return;

    const canvasCtx = canvasRef.current.getContext("2d");
    if (!canvasCtx) return;

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);

    // Draw Connectors and Landmarks (Custom sci-fi style)
    const landmarks = results.poseLandmarks;
    
    // Draw Skeleton Lines
    canvasCtx.lineWidth = 4;
    canvasCtx.strokeStyle = "#00f2ea"; // Cyan/Teal
    
    const drawLine = (start: number, end: number) => {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      canvasCtx.beginPath();
      canvasCtx.moveTo(p1.x * videoWidth, p1.y * videoHeight);
      canvasCtx.lineTo(p2.x * videoWidth, p2.y * videoHeight);
      canvasCtx.stroke();
    };

    // Shoulders
    drawLine(POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER);
    // Torso
    drawLine(POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP);
    drawLine(POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP);
    drawLine(POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP);
    
    // Draw Points
    canvasCtx.fillStyle = "#ff0055"; // Pink/Coral
    for (const landmark of landmarks) {
      canvasCtx.beginPath();
      canvasCtx.arc(landmark.x * videoWidth, landmark.y * videoHeight, 6, 0, 2 * Math.PI);
      canvasCtx.fill();
    }

    // --- Posture Logic ---
    // Using Left Side (Shoulder, Ear, Hip) as proxy for "straightness"
    // Ideally, Ear, Shoulder, Hip should be roughly vertical aligned in side view
    // Or check shoulder alignment for slouching in front view
    
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const leftEar = landmarks[POSE_LANDMARKS.LEFT_EAR];
    
    // Simple heuristic: Relative Y position of ear vs shoulder
    // In a slouch, head goes forward/down
    
    // Calculate neck inclination
    // Angle between Vertical line and Ear-Shoulder line
    const angle = Math.atan2(leftShoulder.y - leftEar.y, leftShoulder.x - leftEar.x) * 180 / Math.PI;
    // Normalize logic requires calibration, but we'll use a simple threshold for demo
    
    setNeckAngle(Math.round(angle));

    // Thresholds (approximate for demo purposes)
    if (angle < 70 || angle > 110) {
        setPostureStatus("Bad");
    } else {
        setPostureStatus("Good");
    }

    canvasCtx.restore();
  };

  useEffect(() => {
    let pose: Pose | null = null;
    let camera: Camera | null = null;

    if (isAnalyzerActive && webcamRef.current?.video) {
      pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);

      camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current?.video && pose) {
            await pose.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });

      camera.start();
    }

    return () => {
        if(pose) pose.close();
        if(camera) camera.stop();
    }
  }, [isAnalyzerActive]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/20">
        {!isAnalyzerActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-center p-6">
                <AlertCircle className="h-16 w-16 text-primary mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold mb-2">AI Vision Inactive</h3>
                <p className="text-muted-foreground mb-6">Enable camera to start real-time skeletal tracking and posture analysis.</p>
                <Button onClick={() => setIsAnalyzerActive(true)} size="lg" className="rounded-full">
                    Start AI Analysis
                </Button>
            </div>
        )}
        
        {isAnalyzerActive && (
            <>
                <Webcam
                    ref={webcamRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    mirrored
                />
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover z-10"
                />
            </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
         <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-6 flex flex-col items-center text-center">
                <span className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Status</span>
                {postureStatus === "Good" ? (
                    <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle className="h-8 w-8" />
                        <span className="text-2xl font-bold">Good Posture</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-red-500">
                        <AlertCircle className="h-8 w-8" />
                         <span className="text-2xl font-bold">Slouching</span>
                    </div>
                )}
            </CardContent>
         </Card>
         
         <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-6 flex flex-col items-center text-center">
                <span className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Neck Angle</span>
                <span className="text-4xl font-mono font-bold text-primary">{neckAngle}°</span>
            </CardContent>
         </Card>

         <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardContent className="p-6 flex flex-col items-center text-center">
                <span className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Corrective Action</span>
                <p className="font-medium">
                    {postureStatus === "Good" ? "Maintain current position." : "Sit up straight and align shoulders."}
                </p>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
