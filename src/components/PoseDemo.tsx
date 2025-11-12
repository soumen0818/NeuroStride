import { useEffect, useRef, useState } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { angleABC, avg } from "../lib/geometry";

interface PoseDemoProps {
    mode: "squat" | "walk";
}

export default function PoseDemo({ mode }: PoseDemoProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [status, setStatus] = useState("Initializing...");
    const [metrics, setMetrics] = useState<Record<string, any>>({});
    const [repCount, setRepCount] = useState(0);
    const [goodReps, setGoodReps] = useState(0);
    const [sessionStats, setSessionStats] = useState({ total: 0, good: 0, warnings: 0 });
    const [isTracking, setIsTracking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const detectorRef = useRef<posedetection.PoseDetector | null>(null);
    const rafRef = useRef<number>(0);
    const repStateRef = useRef<"up" | "down">("up");
    const lastKneeAngleRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isTrackingRef = useRef<boolean>(false);
    const isPausedRef = useRef<boolean>(false);

    // Smoothing buffer to reduce fluctuation
    const angleBufferRef = useRef<number[]>([]);
    const metricsBufferRef = useRef<any[]>([]);

    useEffect(() => {
        async function initializeTensorFlow() {
            try {
                setStatus("Initializing TensorFlow…");
                await tf.setBackend("webgl");
                await tf.ready();

                setStatus("Loading model…");
                const detector = await posedetection.createDetector(
                    posedetection.SupportedModels.MoveNet,
                    {
                        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                        enableSmoothing: true,
                    }
                );

                detectorRef.current = detector;
                setStatus("Ready - Click Start");
            } catch (e: any) {
                setStatus("Error: " + e.message);
            }
        }

        initializeTensorFlow();

        return () => {
            cancelAnimationFrame(rafRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
            detectorRef.current?.dispose();
        };
    }, []);

    // Smoothing function to reduce fluctuations
    const smoothAngle = (currentAngle: number | null): number | null => {
        if (currentAngle == null) return null;

        // Add to buffer
        angleBufferRef.current.push(currentAngle);

        // Keep only last 5 frames for smoothing
        if (angleBufferRef.current.length > 5) {
            angleBufferRef.current.shift();
        }

        // Return moving average
        const sum = angleBufferRef.current.reduce((a, b) => a + b, 0);
        return sum / angleBufferRef.current.length;
    };

    // Continuous loop - shows video and tracks when enabled
    const continuousLoop = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const detector = detectorRef.current;

        if (!video || !canvas || !ctx) {
            rafRef.current = requestAnimationFrame(continuousLoop);
            return;
        }

        // Always draw video feed
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        // Only do pose detection if tracking and not paused
        if (isTrackingRef.current && !isPausedRef.current && detector) {
            const poses = await detector.estimatePoses(video, {
                maxPoses: 1,
                flipHorizontal: true,
            });

            const pose = poses[0];

            if (pose) {
                const m = computeMetrics(pose, mode);

                // Apply smoothing to reduce fluctuations
                if (m.kneeAngleAvg != null) {
                    m.kneeAngleAvg = smoothAngle(m.kneeAngleAvg);
                }

                setMetrics(m);

                // Rep counting logic with more lenient thresholds
                if (mode === "squat" && m.kneeAngleAvg != null) {
                    const currentAngle = m.kneeAngleAvg;
                    const prevAngle = lastKneeAngleRef.current;

                    if (prevAngle != null) {
                        // Going down (angle decreasing) - detect downward movement
                        if (repStateRef.current === "up" && currentAngle < 105) {
                            repStateRef.current = "down";
                            console.log("🔽 Going DOWN - Angle:", currentAngle);
                        }
                        // Coming up (angle increasing) - detect upward movement and count rep
                        if (repStateRef.current === "down" && currentAngle > 130) {
                            repStateRef.current = "up";
                            console.log("🔼 Coming UP - Rep completed! Angle:", currentAngle);

                            // Use functional updates to avoid stale closure issues
                            setRepCount(prev => prev + 1);

                            // Check if it was a good rep - more lenient criteria
                            const wasGoodForm = !m.hasKneeValgus && (m.depthLabel === "Moderate" || m.depthLabel === "Deep");
                            console.log("✅ Good Form?", wasGoodForm, "- Depth:", m.depthLabel, "- Knee Valgus:", m.hasKneeValgus);

                            if (wasGoodForm) {
                                setGoodReps(prev => prev + 1);
                            }

                            setSessionStats(prev => ({
                                total: prev.total + 1,
                                good: wasGoodForm ? prev.good + 1 : prev.good,
                                warnings: m.hasKneeValgus ? prev.warnings + 1 : prev.warnings
                            }));
                        }
                    }

                    lastKneeAngleRef.current = currentAngle;
                }

                // Draw skeleton with color coding based on form
                drawSkeletonWithFeedback(ctx, pose, m);

                drawBadge(ctx, `Mode: ${mode}`, 16, 32);
                drawBadge(ctx, `Cue: ${m.cue ?? "-"}`, 16, 60);

                // Draw injury warnings
                if (m.hasKneeValgus) {
                    drawWarningBadge(ctx, "⚠️ KNEE VALGUS DETECTED - INJURY RISK!", canvas.width / 2 - 200, 40);
                }
            } else {
                drawBadge(ctx, "No person detected", 16, 32);
            }
        } else if (!isTrackingRef.current) {
            // Show "Click Start" message when not tracking
            ctx.font = "bold 28px sans-serif";
            ctx.fillStyle = "rgba(0,0,0,0.7)";
            const w = 520;
            const h = 70;
            ctx.fillRect(canvas.width / 2 - w / 2, canvas.height / 2 - h / 2, w, h);
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Click 'Start Tracking' to begin", canvas.width / 2, canvas.height / 2 + 10);
        }

        rafRef.current = requestAnimationFrame(continuousLoop);
    };

    useEffect(() => {
        setMetrics({});
        setRepCount(0);
        setGoodReps(0);
        setSessionStats({ total: 0, good: 0, warnings: 0 });
        repStateRef.current = "up";
        lastKneeAngleRef.current = null;
    }, [mode]);

    const handleStart = async () => {
        try {
            setStatus("Starting camera…");

            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: "user" },
                audio: false,
            });

            streamRef.current = stream;

            const video = videoRef.current!;
            video.srcObject = stream;
            await video.play();

            // Start tracking
            setIsTracking(true);
            setIsPaused(false);
            isTrackingRef.current = true;
            isPausedRef.current = false;
            setStatus("Running");

            // Start the continuous loop
            continuousLoop();
        } catch (e: any) {
            setStatus("Camera error: " + e.message);
        }
    };

    const handlePause = () => {
        setIsPaused(true);
        isPausedRef.current = true;
        setStatus("Paused");
    };

    const handleResume = () => {
        setIsPaused(false);
        isPausedRef.current = false;
        setStatus("Running");
    };

    const handleStop = () => {
        setIsTracking(false);
        setIsPaused(false);
        isTrackingRef.current = false;
        isPausedRef.current = false;

        // Stop the camera
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        // Clear video element
        const video = videoRef.current;
        if (video) {
            video.srcObject = null;
        }

        // Clear canvas
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        setStatus("Stopped");
    };

    const handleReset = () => {
        // Stop tracking
        setIsTracking(false);
        setIsPaused(false);
        isTrackingRef.current = false;
        isPausedRef.current = false;

        // Stop the camera
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        // Clear video element
        const video = videoRef.current;
        if (video) {
            video.srcObject = null;
        }

        // Clear canvas
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        // Clear all metrics and stats
        setMetrics({});
        setRepCount(0);
        setGoodReps(0);
        setSessionStats({ total: 0, good: 0, warnings: 0 });
        repStateRef.current = "up";
        lastKneeAngleRef.current = null;

        // Clear smoothing buffers
        angleBufferRef.current = [];
        metricsBufferRef.current = [];

        setStatus("Ready - Click Start");
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Video and Metrics Row */}
            <div className="flex gap-4">
                {/* Video Section */}
                <div className="relative bg-black rounded-2xl overflow-hidden flex-1">
                    {/* Status Badge */}
                    <div className="absolute left-6 top-6 z-10">
                        <span
                            className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-lg flex items-center gap-2 ${status === "Running"
                                ? "bg-gradient-to-r from-green-600 to-green-500 animate-pulse"
                                : status === "Paused"
                                    ? "bg-gradient-to-r from-yellow-600 to-yellow-500"
                                    : status === "Stopped"
                                        ? "bg-gradient-to-r from-red-600 to-red-500"
                                        : "bg-neutral-800 border border-neutral-700"
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${status === "Running" ? "bg-white animate-pulse" :
                                status === "Paused" ? "bg-white" :
                                    status === "Stopped" ? "bg-white" :
                                        "bg-neutral-500"
                                }`}></span>
                            {status}
                        </span>
                    </div>

                    <video ref={videoRef} className="hidden" playsInline muted />
                    <canvas
                        ref={canvasRef}
                        width={1280}
                        height={720}
                        className="w-full h-auto"
                    />
                </div>

                {/* Metrics Section - Side Panel */}
                <div className="w-[280px] space-y-3">
                    {/* Live Metrics Card */}
                    <div className="text-sm bg-neutral-900/90 backdrop-blur-xl px-5 py-4 rounded-2xl border border-neutral-700/50 shadow-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            <p className="font-bold text-base text-white">Live Metrics</p>
                        </div>

                        {mode === "squat" ? (
                            <>
                                <ul className="text-neutral-200 text-sm space-y-2.5">
                                    <li className="flex justify-between items-center">
                                        <span className="text-neutral-400">Knee Angle:</span>
                                        <span className="font-bold text-lg text-indigo-400">
                                            {metrics.kneeAngleAvg?.toFixed?.(0) ?? "-"}°
                                        </span>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <span className="text-neutral-400">Hip Angle:</span>
                                        <span className="font-bold text-lg text-purple-400">
                                            {metrics.hipAngleAvg?.toFixed?.(0) ?? "-"}°
                                        </span>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <span className="text-neutral-400">Depth:</span>
                                        <span className={`font-bold text-sm px-2 py-1 rounded ${metrics.depthLabel === "Deep" ? "bg-green-500/20 text-green-400" :
                                            metrics.depthLabel === "Moderate" ? "bg-yellow-500/20 text-yellow-400" :
                                                "bg-neutral-700 text-neutral-300"
                                            }`}>
                                            {metrics.depthLabel ?? "-"}
                                        </span>
                                    </li>
                                    <li className="pt-2 border-t border-neutral-700 flex justify-between items-center">
                                        <span className="text-neutral-400">Reps:</span>
                                        <span className="font-bold text-2xl text-indigo-400">{repCount}</span>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <span className="text-neutral-400">Good Form:</span>
                                        <span className="font-bold text-xl text-green-400">{goodReps}</span>
                                    </li>
                                </ul>
                            </>
                        ) : (
                            <ul className="text-neutral-200 text-sm space-y-2.5">
                                <li className="flex justify-between items-center">
                                    <span className="text-neutral-400">Step Width:</span>
                                    <span className="font-bold text-lg text-indigo-400">
                                        {metrics.stepWidth?.toFixed?.(1) ?? "-"}%
                                    </span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span className="text-neutral-400">Symmetry:</span>
                                    <span className="font-bold text-lg text-purple-400">
                                        {metrics.symmetry?.toFixed?.(0) ?? "-"}
                                    </span>
                                </li>
                                <li className="pt-2 border-t border-neutral-700 flex justify-between items-center">
                                    <span className="text-neutral-400">Steps:</span>
                                    <span className="font-bold text-2xl text-indigo-400">{repCount}</span>
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* Session Stats Card */}
                    <div className="text-sm bg-neutral-900/90 backdrop-blur-xl px-5 py-4 rounded-2xl border border-neutral-700/50 shadow-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="font-bold text-white">Session Stats</p>
                        </div>
                        <p className="text-xs text-neutral-400 mb-2">Cumulative summary</p>
                        <ul className="text-neutral-200 text-sm space-y-2">
                            <li className="flex justify-between items-center">
                                <span className="text-neutral-400">Total:</span>
                                <span className="font-semibold">{sessionStats.total}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-neutral-400">Good:</span>
                                <span className="font-semibold text-green-400">{sessionStats.good}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-neutral-400">Warnings:</span>
                                <span className="font-semibold text-red-400">{sessionStats.warnings}</span>
                            </li>
                            {sessionStats.total > 0 && (
                                <li className="pt-2 border-t border-neutral-700 flex justify-between items-center">
                                    <span className="text-neutral-400">Accuracy:</span>
                                    <span className={`font-bold text-lg ${((sessionStats.good / sessionStats.total) * 100) >= 80 ? "text-green-400" :
                                        ((sessionStats.good / sessionStats.total) * 100) >= 60 ? "text-yellow-400" :
                                            "text-red-400"
                                        }`}>
                                        {((sessionStats.good / sessionStats.total) * 100).toFixed(0)}%
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Control Buttons and Info - Bottom Row */}
            <div className="flex gap-4">
                {/* Control Buttons */}
                <div className="flex gap-2 flex-wrap items-center">
                    {!isTracking ? (
                        <button
                            onClick={handleStart}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg font-medium text-sm shadow-md flex items-center gap-1.5 transition-all"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Start Tracking
                        </button>
                    ) : isPaused ? (
                        <>
                            <button
                                onClick={handleResume}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg font-medium text-sm shadow-md flex items-center gap-1.5 transition-all"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Resume
                            </button>
                            <button
                                onClick={handleStop}
                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg font-medium text-sm shadow-md flex items-center gap-1.5 transition-all"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                </svg>
                                Stop
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handlePause}
                                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg font-medium text-sm shadow-md flex items-center gap-1.5 transition-all"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Pause
                            </button>
                            <button
                                onClick={handleStop}
                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg font-medium text-sm shadow-md flex items-center gap-1.5 transition-all"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                </svg>
                                Stop
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-lg font-medium text-sm shadow-md flex items-center gap-1.5 transition-all"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Reset
                    </button>
                </div>

                {/* Info Card */}
                <div className="flex-1 text-xs bg-indigo-500/10 backdrop-blur-xl px-4 py-3 rounded-2xl border border-indigo-500/30 shadow-xl">
                    <p className="font-semibold text-indigo-300 mb-2">💡 Understanding Metrics</p>
                    <div className="text-indigo-200/80 space-y-1">
                        <p><strong>Live Metrics:</strong> Updates in real-time (30x/sec) - Shows current body position</p>
                        <p><strong>Session Stats:</strong> Accumulates over entire workout - Shows performance summary</p>
                        <p><strong>Why fluctuate?</strong> Your body constantly micro-adjusts for balance - This is normal!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// === Drawing ===
function drawSkeletonWithFeedback(
    ctx: CanvasRenderingContext2D,
    pose: posedetection.Pose,
    metrics: Record<string, any>
) {
    const edges = [
        ["left_shoulder", "right_shoulder"],
        ["left_hip", "right_hip"],
        ["left_shoulder", "left_elbow"],
        ["left_elbow", "left_wrist"],
        ["right_shoulder", "right_elbow"],
        ["right_elbow", "right_wrist"],
        ["left_hip", "left_knee"],
        ["left_knee", "left_ankle"],
        ["right_hip", "right_knee"],
        ["right_knee", "right_ankle"],
    ];

    // Default color
    let strokeColor = "#22c55e"; // green
    let glowColor = "rgba(34, 197, 94, 0.5)";

    // Check form quality
    if (metrics.hasKneeValgus) {
        strokeColor = "#ef4444"; // red for injury risk
        glowColor = "rgba(239, 68, 68, 0.8)";
    } else if (metrics.depthLabel === "Shallow" || (metrics.symmetry != null && metrics.symmetry < 80)) {
        strokeColor = "#eab308"; // yellow for needs improvement
        glowColor = "rgba(234, 179, 8, 0.5)";
    }

    // Draw skeleton lines with glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 5;

    for (const [a, b] of edges) {
        const A = pose.keypoints.find((k) => k.name === a);
        const B = pose.keypoints.find((k) => k.name === b);
        if (!A || !B) continue;

        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
    }

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw joints as circles with better styling
    for (const kp of pose.keypoints) {
        if (kp.score && kp.score > 0.3) {
            // Outer glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = glowColor;

            // Joint circle
            ctx.fillStyle = strokeColor;
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI);
            ctx.fill();

            // Inner white dot
            ctx.shadowBlur = 0;
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // Highlight problem areas
    if (metrics.hasKneeValgus) {
        const leftKnee = pose.keypoints.find(k => k.name === "left_knee");
        const rightKnee = pose.keypoints.find(k => k.name === "right_knee");

        if (leftKnee) {
            drawWarningCircle(ctx, leftKnee.x, leftKnee.y);
        }
        if (rightKnee) {
            drawWarningCircle(ctx, rightKnee.x, rightKnee.y);
        }
    }
}

function drawWarningCircle(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Animated pulsing circles
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ef4444";

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, 2 * Math.PI);
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;
}

function drawBadge(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number
) {
    ctx.font = "bold 18px sans-serif";
    const m = ctx.measureText(text);
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(x - 10, y - 24, m.width + 20, 36);
    ctx.fillStyle = "white";
    ctx.fillText(text, x, y);
}

function drawWarningBadge(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number
) {
    ctx.font = "bold 20px sans-serif";
    const m = ctx.measureText(text);

    // Pulsing effect - create a glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(239, 68, 68, 1)";

    // Background
    ctx.fillStyle = "rgba(239, 68, 68, 0.95)";
    ctx.fillRect(x - 12, y - 28, m.width + 24, 44);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 12, y - 28, m.width + 24, 44);

    // Reset shadow
    ctx.shadowBlur = 0;

    // Text
    ctx.fillStyle = "white";
    ctx.fillText(text, x, y);
}

// === Metrics Logic ===
function computeMetrics(
    pose: posedetection.Pose,
    mode: "squat" | "walk"
): Record<string, any> {
    const kp = (name: string) => pose.keypoints.find((k) => k.name === name);

    const leftKnee = angleABC(kp("left_hip"), kp("left_knee"), kp("left_ankle"));
    const rightKnee = angleABC(kp("right_hip"), kp("right_knee"), kp("right_ankle"));
    const kneeAngleAvg = avg(leftKnee, rightKnee);

    const leftHip = angleABC(kp("left_shoulder"), kp("left_hip"), kp("left_knee"));
    const rightHip = angleABC(kp("right_shoulder"), kp("right_hip"), kp("right_knee"));
    const hipAngleAvg = avg(leftHip, rightHip);

    // Knee valgus detection (knee caving in)
    let hasKneeValgus = false;
    const leftHipKp = kp("left_hip");
    const leftKneeKp = kp("left_knee");
    const leftAnkleKp = kp("left_ankle");
    const rightHipKp = kp("right_hip");
    const rightKneeKp = kp("right_knee");
    const rightAnkleKp = kp("right_ankle");

    if (leftHipKp && leftKneeKp && leftAnkleKp && rightHipKp && rightKneeKp && rightAnkleKp) {
        // Check if knees are too close together relative to hips - LESS SENSITIVE
        const hipWidth = Math.abs(leftHipKp.x - rightHipKp.x);
        const kneeWidth = Math.abs(leftKneeKp.x - rightKneeKp.x);
        const ankleWidth = Math.abs(leftAnkleKp.x - rightAnkleKp.x);

        // Knee valgus: knees closer together than they should be - More lenient thresholds
        const kneeHipRatio = kneeWidth / hipWidth;
        if (kneeHipRatio < 0.5 || kneeWidth < ankleWidth * 0.65) {
            hasKneeValgus = true;
        }
    }

    let stepWidth = null;
    const la = kp("left_ankle");
    const ra = kp("right_ankle");

    if (la && ra) {
        const dx = Math.abs(la.x - ra.x);
        stepWidth = (dx / 1280) * 100;
    }

    let symmetry = null;
    if (leftKnee && rightKnee) {
        symmetry = Math.max(0, 100 - Math.abs(leftKnee - rightKnee));
    }

    const metrics: Record<string, any> = {
        kneeAngleAvg,
        hipAngleAvg,
        stepWidth,
        symmetry,
        hasKneeValgus,
    };

    // cues
    if (mode === "squat") {
        let cue = "Face camera";
        let depthLabel = "-";

        if (hasKneeValgus) {
            cue = "⚠️ Keep knees outward!";
        } else if (kneeAngleAvg != null) {
            // More lenient depth classification
            if (kneeAngleAvg > 140) cue = "Go deeper";
            else if (kneeAngleAvg < 60) cue = "Don't go too deep";
            else cue = "Great form! 💪";

            // More realistic depth thresholds - easier to get "Moderate"
            if (kneeAngleAvg < 80) depthLabel = "Deep";
            else if (kneeAngleAvg < 135) depthLabel = "Moderate";  // Wider range for moderate
            else depthLabel = "Shallow";
        }

        metrics.cue = cue;
        metrics.depthLabel = depthLabel;
    } else {
        let cue = "Walk naturally";

        if (hasKneeValgus) {
            cue = "⚠️ Improve knee alignment";
        } else if (stepWidth != null) {
            if (stepWidth < 4) cue = "Increase step width";
            else if (stepWidth > 20) cue = "Reduce step width";
            else cue = "Good step width";
        }

        if (symmetry != null && symmetry < 80 && !hasKneeValgus) {
            cue = "Improve step symmetry";
        }

        metrics.cue = cue;
    }

    return metrics;
}
