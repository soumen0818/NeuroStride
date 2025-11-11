import { useState } from "react";
import PoseDemo from "../src/components/PoseDemo";

export default function App() {
  const [mode, setMode] = useState<"squat" | "walk">("squat");

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-indigo-500" />
            <h1 className="text-xl font-semibold tracking-tight">NeuroStride</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("squat")}
              className={`px-3 py-1.5 rounded-xl text-sm border ${mode === "squat"
                  ? "bg-indigo-600 border-indigo-500"
                  : "border-neutral-700 hover:bg-neutral-900"
                }`}
            >
              Squat Form
            </button>

            <button
              onClick={() => setMode("walk")}
              className={`px-3 py-1.5 rounded-xl text-sm border ${mode === "walk"
                  ? "bg-indigo-600 border-indigo-500"
                  : "border-neutral-700 hover:bg-neutral-900"
                }`}
            >
              Walk (Gait)
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-[1fr,360px] gap-6">
        <section className="rounded-2xl border border-neutral-800 overflow-hidden">
          <PoseDemo mode={mode} />
        </section>

        <aside className="rounded-2xl border border-neutral-800 p-4">
          <h2 className="text-lg font-semibold mb-2">AI-Powered Features</h2>
          <ul className="text-sm text-neutral-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Real-time skeleton tracking</strong> - Live pose detection overlay</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Form quality analysis</strong> - Green = good, Yellow = improve, Red = injury risk</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Automatic rep counter</strong> - Tracks squats and steps</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Injury prevention alerts</strong> - Detects knee valgus (knee caving)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Session statistics</strong> - Accuracy tracking & performance metrics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Live coaching cues</strong> - Real-time feedback on form</span>
            </li>
          </ul>

          <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
            <p className="text-xs text-indigo-300">
              <strong>💡 Demo Tip:</strong> Try performing squats or walking to see the AI analyze your movement in real-time!
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
