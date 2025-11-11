import { useState } from "react";
import PoseDemo from "../src/components/PoseDemo";

export default function App() {
  const [mode, setMode] = useState<"squat" | "walk">("squat");

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <header className="border-b border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">NeuroStride</h1>
              <p className="text-xs text-neutral-400">AI-Powered Movement Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode("squat")}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${mode === "squat"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105"
                : "border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600"
                }`}
            >
              🏋️ Squat Form
            </button>

            <button
              onClick={() => setMode("walk")}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${mode === "walk"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105"
                : "border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600"
                }`}
            >
              🚶 Walk (Gait)
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 grid lg:grid-cols-[1fr,380px] gap-8">
        <section className="rounded-2xl border border-neutral-800/50 overflow-hidden bg-neutral-900/30 backdrop-blur shadow-2xl">
          <PoseDemo mode={mode} />
        </section>

        <aside className="space-y-6">
          {/* Features Card */}
          <div className="rounded-2xl border border-neutral-800/50 bg-neutral-900/30 backdrop-blur p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold">AI-Powered Features</h2>
            </div>

            <ul className="text-sm text-neutral-300 space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-0.5 text-lg">✓</span>
                <span><strong className="text-white">Real-time skeleton tracking</strong><br />
                  <span className="text-xs text-neutral-400">Live pose detection overlay</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-0.5 text-lg">✓</span>
                <span><strong className="text-white">Form quality analysis</strong><br />
                  <span className="text-xs text-neutral-400">Color-coded feedback system</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-0.5 text-lg">✓</span>
                <span><strong className="text-white">Auto rep counter</strong><br />
                  <span className="text-xs text-neutral-400">Tracks squats and steps</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-0.5 text-lg">⚠</span>
                <span><strong className="text-white">Injury prevention</strong><br />
                  <span className="text-xs text-neutral-400">Detects knee valgus in real-time</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 mt-0.5 text-lg">📊</span>
                <span><strong className="text-white">Session statistics</strong><br />
                  <span className="text-xs text-neutral-400">Accuracy & performance tracking</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400 mt-0.5 text-lg">💬</span>
                <span><strong className="text-white">Live coaching cues</strong><br />
                  <span className="text-xs text-neutral-400">Real-time feedback on form</span></span>
              </li>
            </ul>
          </div>

          {/* Legend Card */}
          <div className="rounded-2xl border border-neutral-800/50 bg-neutral-900/30 backdrop-blur p-6 shadow-xl">
            <h3 className="text-sm font-bold mb-3 text-neutral-200">Visual Feedback Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-neutral-300">Green = Excellent Form</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-neutral-300">Yellow = Needs Improvement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-neutral-300">Red = Injury Risk Detected</span>
              </div>
            </div>
          </div>

          {/* Demo Tip */}
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-5 shadow-xl">
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="text-sm font-semibold text-indigo-300 mb-1">Demo Tip</p>
                <p className="text-xs text-indigo-200/80">
                  Position yourself 5-6 feet from the camera. Try squats or walk in place to see real-time AI analysis!
                </p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
