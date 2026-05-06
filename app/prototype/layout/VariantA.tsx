"use client";
// PROTOTYPE — Variant A: Command Centre
// Minimal, focus-first. Next Action dominates. Calendar is secondary/hidden.

import { useState } from "react";
import { MOCK_TASKS, MOCK_EVENTS, NEXT_ACTION, STREAK, PROGRESS, type MockTask } from "./mock-data";

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-slate-400",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Med",
  low: "Low",
};

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-white text-xs font-medium ${PRIORITY_COLOR[priority]}`}>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

function TaskRow({ task }: { task: MockTask }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${task.status === "complete" ? "opacity-40" : ""}`}>
      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 ${task.status === "complete" ? "bg-emerald-500 border-emerald-500" : "border-slate-500"}`} />
      <span className={`flex-1 text-sm ${task.status === "complete" ? "line-through text-slate-500" : "text-slate-100"}`}>
        {task.title}
      </span>
      <PriorityBadge priority={task.priority} />
      {task.scheduledStart && (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(task.scheduledStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}

export function VariantA() {
  const [showCalendar, setShowCalendar] = useState(false);
  const incomplete = MOCK_TASKS.filter(t => t.status === "incomplete");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800">
        <span className="font-bold tracking-widest text-slate-300 text-sm uppercase">Kairos</span>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>🔥 {STREAK} day streak</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(PROGRESS.completed / PROGRESS.total) * 100}%` }}
              />
            </div>
            <span>{PROGRESS.completed}/{PROGRESS.total}</span>
          </div>
        </div>
      </div>

      {/* Quick-add bar */}
      <div className="px-6 py-3 border-b border-slate-800">
        <input
          type="text"
          placeholder="Add a task… (press Enter)"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
        />
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-6 gap-6">
        {/* Next Action Card — dominates */}
        <div className="rounded-xl bg-gradient-to-br from-red-950 to-slate-900 border border-red-900/50 p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2">▶ Do this now</div>
          <div className="text-xl font-semibold text-white mb-1">{NEXT_ACTION.title}</div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>Due today</span>
            <span>·</span>
            <span>{NEXT_ACTION.estimatedDurationMinutes} min</span>
            <span>·</span>
            <PriorityBadge priority={NEXT_ACTION.priority} />
          </div>
          <button className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors">
            Start focus session →
          </button>
        </div>

        {/* Task list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Tasks</span>
            <button
              onClick={() => setShowCalendar(v => !v)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showCalendar ? "Hide calendar" : "Show calendar"}
            </button>
          </div>
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            {incomplete.map(task => <TaskRow key={task.id} task={task} />)}
          </div>
        </div>

        {/* Calendar — collapsed by default */}
        {showCalendar && (
          <div className="rounded-xl border border-slate-800 p-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Today — May 6</div>
            <div className="space-y-1">
              {MOCK_EVENTS.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500 font-mono w-10 text-right text-xs">
                    {new Date(ev.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <div
                    className="w-1 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ev.color }}
                  />
                  <span className={ev.isTask ? "text-slate-200" : "text-slate-400"}>{ev.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
