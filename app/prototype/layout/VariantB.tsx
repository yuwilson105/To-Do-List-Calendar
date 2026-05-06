"use client";
// PROTOTYPE — Variant B: Split View
// Task list left, calendar right. The PRD's agreed layout.

import { useState } from "react";
import { MOCK_TASKS, MOCK_EVENTS, NEXT_ACTION, STREAK, PROGRESS, type MockTask } from "./mock-data";

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-slate-300",
};

function TaskCard({ task, isNext }: { task: MockTask; isNext: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2.5 flex items-start gap-2.5 cursor-pointer transition-all ${
      isNext
        ? "border-violet-300 bg-violet-50 shadow-sm"
        : task.status === "complete"
        ? "border-slate-100 bg-white opacity-50"
        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
    }`}>
      <div className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 ${
        task.status === "complete" ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
      }`} />
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${task.status === "complete" ? "line-through text-slate-400" : "text-slate-800"}`}>
          {isNext && <span className="text-violet-600 mr-1">▶</span>}
          {task.title}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`} />
          <span className="text-xs text-slate-400">{task.estimatedDurationMinutes}m</span>
          {task.dueDate && (
            <span className="text-xs text-slate-400">
              Due {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
            </span>
          )}
          {task.tags.map(tag => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      {!task.scheduledStart && task.status === "incomplete" && (
        <button className="text-xs text-violet-500 hover:text-violet-700 flex-shrink-0 mt-0.5">
          Schedule
        </button>
      )}
    </div>
  );
}

// Minimal calendar — renders time slots 8am–6pm
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

function CalendarColumn() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div>
          <div className="font-semibold text-slate-800">Wednesday</div>
          <div className="text-sm text-slate-500">May 6, 2026</div>
        </div>
        <div className="flex gap-1">
          {["D", "W", "M"].map(v => (
            <button key={v} className={`px-2.5 py-1 text-xs rounded font-medium ${v === "D" ? "bg-violet-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto relative">
        {HOURS.map(hour => {
          const eventsAtHour = MOCK_EVENTS.filter(ev => new Date(ev.start).getHours() === hour);
          return (
            <div key={hour} className="flex border-b border-slate-100 min-h-[56px]">
              <div className="w-12 flex-shrink-0 text-right pr-2 pt-1 text-xs text-slate-400 font-mono">
                {hour % 12 || 12}{hour < 12 ? "a" : "p"}
              </div>
              <div className="flex-1 relative pl-2 py-1 flex flex-col gap-1">
                {eventsAtHour.map(ev => (
                  <div
                    key={ev.id}
                    className="rounded px-2 py-1 text-xs font-medium text-white truncate"
                    style={{ backgroundColor: ev.color }}
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VariantB() {
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-slate-200 flex-shrink-0">
        <span className="font-bold text-violet-700 text-sm tracking-tight">Kairos</span>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Add a task… (Enter)"
            className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>🔥 {STREAK}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(PROGRESS.completed / PROGRESS.total) * 100}%` }}
              />
            </div>
            <span className="text-xs">{PROGRESS.completed}/{PROGRESS.total}</span>
          </div>
        </div>
      </div>

      {/* Split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — task list */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Next Action Card */}
          <div className="px-3 pt-3 pb-2 border-b border-slate-100">
            <div className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-1.5">Next action</div>
            <div className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2.5 cursor-pointer hover:bg-violet-100 transition-colors">
              <div className="text-sm font-semibold text-violet-900">{NEXT_ACTION.title}</div>
              <div className="text-xs text-violet-600 mt-0.5">
                {NEXT_ACTION.estimatedDurationMinutes}m · Due today · Start focus →
              </div>
            </div>
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1.5">
            {MOCK_TASKS.map(task => (
              <TaskCard key={task.id} task={task} isNext={task.id === NEXT_ACTION.id} />
            ))}
          </div>
        </div>

        {/* Right — calendar */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col">
          <CalendarColumn />
        </div>
      </div>
    </div>
  );
}
