"use client";

import { useReducer, useEffect, useCallback } from "react";
import {
  pomodoroReducer,
  initialPomodoroState,
  type PomodoroConfig,
} from "@/lib/pomodoro-timer";
import type { Task } from "@/lib/types";

const DEFAULT_CONFIG: PomodoroConfig = { workMinutes: 25, breakMinutes: 5 };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(seconds: number) {
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

interface FocusModeProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onExit: () => void;
}

export function FocusMode({ task, onComplete, onExit }: FocusModeProps) {
  const [timer, dispatch] = useReducer(
    pomodoroReducer,
    DEFAULT_CONFIG,
    initialPomodoroState
  );

  // Tick every second when working or on break
  useEffect(() => {
    if (timer.phase === "idle") return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [timer.phase]);

  const handleComplete = useCallback(() => {
    dispatch({ type: "RESET" });
    onComplete(task.id);
  }, [task.id, onComplete]);

  const handleExit = useCallback(() => {
    dispatch({ type: "RESET" });
    onExit();
  }, [onExit]);

  const isRunning = timer.phase !== "idle";
  const isBreak = timer.phase === "break";

  // Circumference for the SVG progress ring
  const RADIUS = 80;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const totalSeconds =
    timer.phase === "break"
      ? timer.config.breakMinutes * 60
      : timer.config.workMinutes * 60;
  const progress = isRunning ? timer.secondsRemaining / totalSeconds : 1;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center gap-8 px-6">
      {/* Phase label */}
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        {isBreak ? "☕ Break" : timer.phase === "idle" ? "Ready" : "▶ Focus"}
      </div>

      {/* Task title */}
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-white leading-snug">{task.title}</h1>
        {task.notes && (
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">{task.notes}</p>
        )}
      </div>

      {/* Timer ring */}
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" className="-rotate-90">
          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={isBreak ? "#10b981" : "#ef4444"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
          />
        </svg>
        {/* Time display */}
        <div className="absolute text-center">
          <div className="text-4xl font-mono font-bold text-white tabular-nums">
            {formatTime(timer.secondsRemaining)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {isBreak ? `${timer.config.breakMinutes}m break` : `${timer.config.workMinutes}m work`}
          </div>
        </div>
      </div>

      {/* Phase transition prompt */}
      {isBreak && (
        <div className="rounded-xl bg-emerald-950/50 border border-emerald-900/50 px-5 py-3 text-sm text-emerald-300 text-center max-w-xs">
          Work interval complete — take a break.
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        {!isRunning ? (
          <button
            onClick={() => dispatch({ type: "START" })}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
          >
            Start timer
          </button>
        ) : (
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl transition-colors"
          >
            Reset timer
          </button>
        )}

        <button
          onClick={handleComplete}
          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
        >
          ✓ Mark complete
        </button>

        <button
          onClick={handleExit}
          className="text-sm text-slate-600 hover:text-slate-400 transition-colors"
        >
          Exit focus mode
        </button>
      </div>

      {/* Config — work/break interval adjustment */}
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <span>Work:</span>
        {[15, 25, 50].map((m) => (
          <button
            key={m}
            onClick={() =>
              dispatch({
                type: "UPDATE_CONFIG",
                config: { ...timer.config, workMinutes: m },
              })
            }
            className={`px-2 py-0.5 rounded transition-colors ${
              timer.config.workMinutes === m
                ? "bg-slate-700 text-slate-200"
                : "hover:text-slate-400"
            }`}
          >
            {m}m
          </button>
        ))}
        <span className="ml-2">Break:</span>
        {[5, 10].map((m) => (
          <button
            key={m}
            onClick={() =>
              dispatch({
                type: "UPDATE_CONFIG",
                config: { ...timer.config, breakMinutes: m },
              })
            }
            className={`px-2 py-0.5 rounded transition-colors ${
              timer.config.breakMinutes === m
                ? "bg-slate-700 text-slate-200"
                : "hover:text-slate-400"
            }`}
          >
            {m}m
          </button>
        ))}
      </div>
    </div>
  );
}
