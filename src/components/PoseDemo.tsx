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

    const detectorRef = useRef<posedetection.PoseDetector | null>(null);
    const rafRef = useRef<number>(0);
    const repStateRef = useRef<"up" | "down">("up");
    const lastKneeAngleRef = useRef<number | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;

        async function setup() {
            setStatus("Requesting camera…");
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: "user" },
                audio: false,
            });

            const video = videoRef.current!;
            video.srcObject = stream;
            await video.play();

            setStatus("Initializing TensorFlow…");
            // Initialize TensorFlow backend before creating detector
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
            setStatus("Running");
            loop();
        }

        setup().catch((e) => setStatus("Error: " + e.message));

        return () => {
            cancelAnimationFrame(rafRef.current);
            stream?.getTracks().forEach((t) => t.stop());
            detectorRef.current?.dispose();
        };
    }, []);

    useEffect(() => {
        setMetrics({});
        setRepCount(0);
        setGoodReps(0);
        setSessionStats({ total: 0, good: 0, warnings: 0 });
        repStateRef.current = "up";
        lastKneeAngleRef.current = null;
    }, [mode]);

    const loop = async () => {
        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        const detector = detectorRef.current;
        if (!detector) return;

        const poses = await detector.estimatePoses(video, {
            maxPoses: 1,
            flipHorizontal: true,
        });

        const pose = poses[0];

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (pose) {
            const m = computeMetrics(pose, mode);
            setMetrics(m);

            // Rep counting logic
            if (mode === "squat" && m.kneeAngleAvg != null) {
                const currentAngle = m.kneeAngleAvg;
                const prevAngle = lastKneeAngleRef.current;

                if (prevAngle != null) {
                    // Going down (angle decreasing)
                    if (repStateRef.current === "up" && currentAngle < 100 && prevAngle > currentAngle) {
                        repStateRef.current = "down";
                    }
                    // Coming up (angle increasing)
                    if (repStateRef.current === "down" && currentAngle > 120 && currentAngle > prevAngle) {
                        repStateRef.current = "up";
                        const newCount = repCount + 1;
                        setRepCount(newCount);

                        // Check if it was a good rep
                        const wasGoodForm = !m.hasKneeValgus && m.depthLabel !== "Shallow";
                        if (wasGoodForm) {
                            setGoodReps(goodReps + 1);
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
                drawWarningBadge(ctx, "⚠️ Knee Valgus Detected", canvas.width / 2 - 100, 32);
            }
        } else {
            drawBadge(ctx, "No person detected", 16, 32);
        }

        rafRef.current = requestAnimationFrame(loop);
    };

    return (
        <div className="relative">
            <div className="absolute left-4 top-4 z-10">
                <span
                    className={`px-2 py-1 text-xs rounded-lg ${status === "Running" ? "bg-green-600" : "bg-neutral-700"
                        }`}
                >
                    {status}
                </span>
            </div>

            <video ref={videoRef} className="hidden" playsInline muted />
            <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-auto rounded-lg"
            />

            <div className="absolute right-4 top-4 z-10">
                <div className="text-sm bg-neutral-900/70 backdrop-blur px-4 py-3 rounded-xl border border-neutral-800">
                    <p className="font-semibold">Live Metrics</p>

                    {mode === "squat" ? (
                        <>
                            <ul className="text-neutral-300 text-sm mt-2 space-y-1">
                                <li>Knee Angle: {metrics.kneeAngleAvg?.toFixed?.(0) ?? "-"}°</li>
                                <li>Hip Angle: {metrics.hipAngleAvg?.toFixed?.(0) ?? "-"}°</li>
                                <li>Depth: {metrics.depthLabel ?? "-"}</li>
                                <li className="pt-2 border-t border-neutral-700">
                                    Reps: <span className="font-bold text-indigo-400">{repCount}</span>
                                </li>
                                <li>
                                    Good Form: <span className="font-bold text-green-400">{goodReps}</span>
                                </li>
                            </ul>
                        </>
                    ) : (
                        <ul className="text-neutral-300 text-sm mt-2 space-y-1">
                            <li>Step Width: {metrics.stepWidth?.toFixed?.(1) ?? "-"}%</li>
                            <li>Symmetry: {metrics.symmetry?.toFixed?.(0) ?? "-"}</li>
                            <li>Steps: <span className="font-bold text-indigo-400">{repCount}</span></li>
                        </ul>
                    )}
                </div>

                {/* Session Stats */}
                <div className="text-sm bg-neutral-900/70 backdrop-blur px-4 py-3 rounded-xl border border-neutral-800 mt-2">
                    <p className="font-semibold">Session Stats</p>
                    <ul className="text-neutral-300 text-sm mt-2 space-y-1">
                        <li>Total: {sessionStats.total}</li>
                        <li>Good: <span className="text-green-400">{sessionStats.good}</span></li>
                        <li>Warnings: <span className="text-red-400">{sessionStats.warnings}</span></li>
                        {sessionStats.total > 0 && (
                            <li className="pt-1 border-t border-neutral-700">
                                Accuracy: <span className="font-bold">{((sessionStats.good / sessionStats.total) * 100).toFixed(0)}%</span>
                            </li>
                        )}
                    </ul>
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

    // Check form quality
    if (metrics.hasKneeValgus) {
        strokeColor = "#ef4444"; // red for injury risk
    } else if (metrics.depthLabel === "Shallow" || (metrics.symmetry != null && metrics.symmetry < 80)) {
        strokeColor = "#eab308"; // yellow for needs improvement
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;

    // Draw skeleton lines
    for (const [a, b] of edges) {
        const A = pose.keypoints.find((k) => k.name === a);
        const B = pose.keypoints.find((k) => k.name === b);
        if (!A || !B) continue;

        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
    }

    // Draw joints as circles
    ctx.fillStyle = strokeColor;
    for (const kp of pose.keypoints) {
        if (kp.score && kp.score > 0.3) {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
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
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawBadge(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number
) {
    ctx.font = "16px sans-serif";
    const m = ctx.measureText(text);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x - 8, y - 20, m.width + 16, 28);
    ctx.fillStyle = "white";
    ctx.fillText(text, x, y);
}

function drawWarningBadge(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number
) {
    ctx.font = "bold 16px sans-serif";
    const m = ctx.measureText(text);
    ctx.fillStyle = "rgba(239, 68, 68, 0.9)"; // red background
    ctx.fillRect(x - 8, y - 20, m.width + 16, 28);
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
        // Check if knees are too close together relative to hips
        const hipWidth = Math.abs(leftHipKp.x - rightHipKp.x);
        const kneeWidth = Math.abs(leftKneeKp.x - rightKneeKp.x);
        const ankleWidth = Math.abs(leftAnkleKp.x - rightAnkleKp.x);

        // Knee valgus: knees closer together than they should be
        const kneeHipRatio = kneeWidth / hipWidth;
        if (kneeHipRatio < 0.7 || kneeWidth < ankleWidth * 0.8) {
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
            if (kneeAngleAvg > 130) cue = "Go deeper";
            else if (kneeAngleAvg < 70) cue = "Maintain neutral spine";
            else cue = "Great form! 💪";

            if (kneeAngleAvg < 80) depthLabel = "Deep";
            else if (kneeAngleAvg < 120) depthLabel = "Moderate";
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
