"use client";
// PROTOTYPE — Variant C: Timeline
// No traditional task list. Everything lives on a horizontal day timeline.
// Tasks are chips placed on time slots. Unscheduled tasks sit in a tray below.

import { useState } from "react";
import { MOCK_TASKS, MOCK_EVENTS, NEXT_ACTION, STREAK, PROGRESS, type MockTask, type MockCalendarEvent } from "./mock-data";

const HOUR_WIDTH = 96; // px per hour
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am–7pm

function minutesFromMidnight(isoString: string): number {
  const d = new Date(isoString);
  return d.getHours() * 60 + d.getMinutes();
}

function EventChip({ event, style }: { event: MockCalendarEvent; style: React.CSSProperties }) {
  return (
    <div
      className="absolute top-1 rounded-md px-2 py-1 text-xs font-medium text-white overflow-hidden whitespace-nowrap cursor-pointer hover:brightness-110 transition-all shadow-sm"
      style={{ ...style, backgroundColor: event.color }}
      title={event.title}
    >
      {event.title}
    </div>
  );
}

function UnscheduledChip({ task }: { task: MockTask }) {
  const PRIORITY_BG: Record<string, string> = {
    high: "bg-red-100 border-red-300 text-red-800",
    medium: "bg-amber-100 border-amber-300 text-amber-800",
    low: "bg-slate-100 border-slate-300 text-slate-700",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-grab active:cursor-grabbing ${PRIORITY_BG[task.priority]}`}>
      <span>{task.title}</span>
      <span className="opacity-60">· {task.estimatedDurationMinutes}m</span>
    </div>
  );
}

export function VariantC() {
  const [focusHour, setFocusHour] = useState<number | null>(null);
  const unscheduled = MOCK_TASKS.filter(t => !t.scheduledStart && t.status === "incomplete");
  const timelineStart = 7 * 60; // 7am in minutes

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-200 flex-shrink-0">
        <span className="font-bold text-slate-800 tracking-tight">Kairos</span>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Add a task…"
            className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Wed, May 6</span>
          <span>🔥 {STREAK} days</span>
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(PROGRESS.completed / PROGRESS.total) * 100}%` }} />
            </div>
            <span className="text-xs">{PROGRESS.completed}/{PROGRESS.total} done</span>
          </div>
        </div>
      </div>

      {/* Next action banner */}
      <div className="flex items-center gap-3 px-6 py-2.5 bg-violet-50 border-b border-violet-100 flex-shrink-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">Now</span>
        <span className="text-sm font-semibold text-violet-900">{NEXT_ACTION.title}</span>
        <span className="text-xs text-violet-500">{NEXT_ACTION.estimatedDurationMinutes}m · 9:00–10:30</span>
        <button className="ml-auto text-xs bg-violet-600 text-white px-3 py-1 rounded-full hover:bg-violet-700 transition-colors">
          Focus →
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative">
        <div
          className="relative h-full"
          style={{ width: HOURS.length * HOUR_WIDTH + 48 }}
        >
          {/* Hour labels + grid lines */}
          <div className="flex h-8 border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="w-12 flex-shrink-0" />
            {HOURS.map(h => (
              <div
                key={h}
                className="flex-shrink-0 border-l border-slate-100 flex items-center pl-2"
                style={{ width: HOUR_WIDTH }}
              >
                <span className="text-xs text-slate-400 font-mono">
                  {h % 12 || 12}{h < 12 ? "am" : "pm"}
                </span>
              </div>
            ))}
          </div>

          {/* Event rows */}
          <div className="relative" style={{ height: "calc(100% - 2rem)" }}>
            {/* Grid lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              <div className="w-12 flex-shrink-0" />
              {HOURS.map(h => (
                <div
                  key={h}
                  className="flex-shrink-0 border-l border-slate-100 h-full"
                  style={{ width: HOUR_WIDTH }}
                />
              ))}
            </div>

            {/* Current time indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-20 pointer-events-none"
              style={{ left: 48 + ((10 * 60 - timelineStart) / 60) * HOUR_WIDTH }}
            >
              <div className="w-2 h-2 rounded-full bg-red-400 -ml-0.75 -mt-1" />
            </div>

            {/* Events */}
            {MOCK_EVENTS.map(ev => {
              const startMin = minutesFromMidnight(ev.start);
              const endMin = minutesFromMidnight(ev.end);
              const left = 48 + ((startMin - timelineStart) / 60) * HOUR_WIDTH;
              const width = Math.max(((endMin - startMin) / 60) * HOUR_WIDTH - 4, 40);
              return (
                <EventChip
                  key={ev.id}
                  event={ev}
                  style={{ left, width, top: 8 }}
                />
              );
            })}

            {/* Hover highlight */}
            {focusHour !== null && (
              <div
                className="absolute top-0 bottom-0 bg-violet-50 pointer-events-none z-0"
                style={{ left: 48 + (focusHour - HOURS[0]) * HOUR_WIDTH, width: HOUR_WIDTH }}
              />
            )}

            {/* Invisible hover zones */}
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute top-0 bottom-0 cursor-pointer"
                style={{ left: 48 + (h - HOURS[0]) * HOUR_WIDTH, width: HOUR_WIDTH }}
                onMouseEnter={() => setFocusHour(h)}
                onMouseLeave={() => setFocusHour(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Unscheduled task tray */}
      {unscheduled.length > 0 && (
        <div className="border-t border-slate-200 px-6 py-3 flex-shrink-0 bg-slate-50">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Unscheduled — drag onto timeline
          </div>
          <div className="flex flex-wrap gap-2">
            {unscheduled.map(task => (
              <UnscheduledChip key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
