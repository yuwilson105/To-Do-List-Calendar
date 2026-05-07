"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HabitModel, InMemoryHabitStore } from "@/lib/habit-model";
import { scoreTask } from "@/lib/next-action-scorer";
import { proposeCandidates } from "@/lib/ai-scheduler";
import { getDailyProgress } from "@/lib/daily-progress";
import type { Task, Priority, TimeBlockCandidate } from "@/lib/types";
import type { TimeBlock } from "@/lib/daily-progress";

// ---------------------------------------------------------------------------
// Static external calendar events (placeholder until Google Calendar sync)
// ---------------------------------------------------------------------------
const EXTERNAL_EVENTS = [
  { id: "e1", title: "Team standup", start: "09:30", end: "09:45", color: "#6366f1" },
  { id: "e4", title: "Lunch", start: "12:00", end: "13:00", color: "#6366f1" },
  { id: "e6", title: "1:1 with manager", start: "15:00", end: "15:30", color: "#6366f1" },
];

function todayAt(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PRIORITY_COLOR: Record<Priority, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-slate-500",
};
const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High",
  medium: "Med",
  low: "Low",
};

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-white text-xs font-medium ${PRIORITY_COLOR[priority]}`}>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

function fmt(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(date: Date) {
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Schedule Popover
// ---------------------------------------------------------------------------
function SchedulePopover({
  candidates,
  onApprove,
  onClose,
}: {
  candidates: TimeBlockCandidate[];
  onApprove: (candidate: TimeBlockCandidate) => void;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const candidate = candidates[idx] ?? null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!candidate) {
    return (
      <div className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs text-slate-400">
        No more suggestions — pick a time manually.
        <button onClick={onClose} className="ml-2 text-slate-500 hover:text-slate-300">✕</button>
      </div>
    );
  }

  return (
    <div className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 font-medium">Proposed time</span>
        <button onClick={onClose} className="text-slate-600 hover:text-slate-400">✕</button>
      </div>
      <div className="text-slate-200 font-medium mb-2">
        {fmtDate(candidate.start)} · {fmt(candidate.start)}–{fmt(candidate.end)}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(candidate)}
          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors"
        >
          Approve
        </button>
        <button
          onClick={() => setIdx(i => i + 1)}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
        >
          Try another
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Row
// ---------------------------------------------------------------------------
function TaskRow({
  task,
  isNext,
  timeBlock,
  scheduleCandidates,
  onComplete,
  onSchedule,
  onClosePopover,
  onApproveSchedule,
}: {
  task: Task;
  isNext: boolean;
  timeBlock: TimeBlock | undefined;
  scheduleCandidates: TimeBlockCandidate[] | null; // non-null = popover open for this task
  onComplete: (id: string) => void;
  onSchedule: (id: string) => void;
  onClosePopover: () => void;
  onApproveSchedule: (taskId: string, candidate: TimeBlockCandidate) => void;
}) {
  return (
    <div>
      <div
        className={`flex items-center gap-3 px-4 py-3 border-b border-slate-800 transition-colors
          ${isNext ? "bg-red-950/40 hover:bg-red-950/60" : "hover:bg-slate-800/50"}
          ${task.status === "complete" ? "opacity-40" : ""}`}
      >
        <button
          onClick={() => task.status === "incomplete" && onComplete(task.id)}
          className={`w-4 h-4 rounded border-2 flex-shrink-0 transition-colors ${
            task.status === "complete"
              ? "bg-emerald-500 border-emerald-500"
              : isNext
              ? "border-red-500 hover:bg-red-900"
              : "border-slate-600 hover:border-slate-400"
          }`}
          aria-label={task.status === "complete" ? "Completed" : "Mark complete"}
        />
        <span
          className={`flex-1 text-sm ${
            task.status === "complete"
              ? "line-through text-slate-500"
              : isNext
              ? "text-white font-medium"
              : "text-slate-300"
          }`}
        >
          {task.title}
        </span>
        <PriorityBadge priority={task.priority} />
        {timeBlock ? (
          <span className="text-xs text-slate-500 font-mono">{fmt(timeBlock.start)}</span>
        ) : task.status === "incomplete" ? (
          <button
            onClick={() => onSchedule(task.id)}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            + Schedule
          </button>
        ) : null}
      </div>
      {scheduleCandidates !== null && (
        <div className="px-4 pb-2">
          <SchedulePopover
            candidates={scheduleCandidates}
            onApprove={(c) => onApproveSchedule(task.id, c)}
            onClose={onClosePopover}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact Calendar
// ---------------------------------------------------------------------------
const CAL_HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am–7pm
const SLOT_HEIGHT = 44;

function Calendar({ timeBlocks }: { timeBlocks: TimeBlock[] }) {
  const [calView, setCalView] = useState<"D" | "W" | "M">("D");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dayName = now.toLocaleDateString([], { weekday: "long" });
  const dateLabel = now.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });

  const externalEvents = EXTERNAL_EVENTS.map(ev => ({
    ...ev,
    startDate: todayAt(ev.start),
    endDate: todayAt(ev.end),
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 flex-shrink-0">
        <div>
          <span className="font-semibold text-slate-200 text-sm">{dayName}</span>
          <span className="text-slate-500 text-sm ml-2">{dateLabel}</span>
        </div>
        <div className="flex gap-1">
          {(["D", "W", "M"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setCalView(v)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                calView === v ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="relative" style={{ height: CAL_HOURS.length * SLOT_HEIGHT }}>
          {/* Hour rows */}
          {CAL_HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute w-full flex border-b border-slate-800/60"
              style={{ top: (hour - 8) * SLOT_HEIGHT, height: SLOT_HEIGHT }}
            >
              <div className="w-12 flex-shrink-0 text-right pr-2 pt-1">
                <span className="text-xs text-slate-600 font-mono">
                  {hour % 12 || 12}{hour < 12 ? "a" : "p"}
                </span>
              </div>
              <div className="flex-1 border-l border-slate-800/60" />
            </div>
          ))}

          {/* Current time indicator */}
          {(() => {
            const h = now.getHours();
            const m = now.getMinutes();
            if (h < 8 || h >= 20) return null;
            const top = (h - 8) * SLOT_HEIGHT + (m / 60) * SLOT_HEIGHT;
            return (
              <div
                className="absolute left-0 right-0 flex items-center pointer-events-none z-20"
                style={{ top }}
              >
                <div className="w-12 flex-shrink-0 flex justify-end pr-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <div className="flex-1 h-px bg-red-500" />
              </div>
            );
          })()}

          {/* External events */}
          {externalEvents.map((ev) => {
            const sh = ev.startDate.getHours(), sm = ev.startDate.getMinutes();
            const eh = ev.endDate.getHours(), em = ev.endDate.getMinutes();
            const top = (sh - 8) * SLOT_HEIGHT + (sm / 60) * SLOT_HEIGHT;
            const height = Math.max(((eh * 60 + em - (sh * 60 + sm)) / 60) * SLOT_HEIGHT - 2, 18);
            return (
              <div
                key={ev.id}
                className="absolute left-14 right-2 rounded px-2 py-0.5 text-xs font-medium text-white overflow-hidden z-10"
                style={{ top, height, backgroundColor: "#1e1b4b", borderLeft: `3px solid ${ev.color}` }}
                title={ev.title}
              >
                <span className="truncate block">{ev.title}</span>
              </div>
            );
          })}

          {/* Task Time Blocks */}
          {timeBlocks.map((tb) => {
            const sh = tb.start.getHours(), sm = tb.start.getMinutes();
            const eh = tb.end.getHours(), em = tb.end.getMinutes();
            if (sh < 8 || sh >= 20) return null;
            const top = (sh - 8) * SLOT_HEIGHT + (sm / 60) * SLOT_HEIGHT;
            const height = Math.max(((eh * 60 + em - (sh * 60 + sm)) / 60) * SLOT_HEIGHT - 2, 18);
            return (
              <div
                key={tb.taskId}
                className="absolute left-14 right-2 rounded px-2 py-0.5 text-xs font-medium text-white overflow-hidden z-10"
                style={{ top, height, backgroundColor: "#7f1d1d", borderLeft: "3px solid #ef4444" }}
              >
                <span className="truncate block">Task block</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root App
// ---------------------------------------------------------------------------
export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [input, setInput] = useState("");
  const [openPopoverTaskId, setOpenPopoverTaskId] = useState<string | null>(null);
  const [popoverCandidates, setPopoverCandidates] = useState<TimeBlockCandidate[]>([]);
  const [now, setNow] = useState(new Date());

  const habitModelRef = useRef(new HabitModel(new InMemoryHabitStore()));

  // Refresh `now` every 5 minutes to recalculate Next Action scores
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 5 * 60_000);
    return () => clearInterval(id);
  }, []);

  // Next Action: highest-scoring incomplete task
  const nextAction = tasks
    .filter((t) => t.status === "incomplete")
    .map((t) => ({ task: t, score: scoreTask(t, habitModelRef.current, now) }))
    .sort((a, b) => b.score - a.score)[0]?.task ?? null;

  const progress = getDailyProgress(tasks, timeBlocks, now);

  // Quick-Add Bar
  const handleAddTask = useCallback(() => {
    const title = input.trim();
    if (!title) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      dueDate: null,
      priority: "medium",
      estimatedDurationMinutes: 30,
      tags: [],
      notes: "",
      status: "incomplete",
      createdAt: new Date(),
      completedAt: null,
    };
    setTasks((prev) => [...prev, task]);
    setInput("");
  }, [input]);

  // Task completion
  const handleComplete = useCallback((id: string) => {
    const completedAt = new Date();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const tb = timeBlocks.find((b) => b.taskId === id);
        habitModelRef.current.recordCompletion(id, completedAt, t.tags, tb?.start ?? null);
        return { ...t, status: "complete", completedAt };
      })
    );
    setOpenPopoverTaskId(null);
  }, [timeBlocks]);

  // Schedule proposal
  const handleSchedule = useCallback((taskId: string) => {
    if (openPopoverTaskId === taskId) {
      setOpenPopoverTaskId(null);
      return;
    }
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const occupied = [
      ...timeBlocks.map((tb) => ({ start: tb.start, end: tb.end })),
      ...EXTERNAL_EVENTS.map((ev) => ({ start: todayAt(ev.start), end: todayAt(ev.end) })),
    ];

    const candidates = proposeCandidates(task, occupied, habitModelRef.current, new Date());
    setPopoverCandidates(candidates);
    setOpenPopoverTaskId(taskId);
  }, [tasks, timeBlocks, openPopoverTaskId]);

  const handleApproveSchedule = useCallback((taskId: string, candidate: TimeBlockCandidate) => {
    setTimeBlocks((prev) => [...prev, { taskId, start: candidate.start, end: candidate.end }]);
    setOpenPopoverTaskId(null);
  }, []);

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-800 flex-shrink-0">
        <span className="font-bold tracking-widest text-slate-300 text-sm uppercase">Kairos</span>
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="Add a task… (Enter)"
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-500"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>🔥 4 day streak</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: progress.total > 0 ? `${(progress.completed / progress.total) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-xs">{progress.completed}/{progress.total}</span>
          </div>
        </div>
      </div>

      {/* Split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — task list */}
        <div className="w-72 flex-shrink-0 border-r border-slate-800 flex flex-col overflow-hidden">
          {/* Next Action Card */}
          <div className="px-3 pt-3 pb-2 border-b border-slate-800 flex-shrink-0">
            <div className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-2">
              ▶ Do this now
            </div>
            {nextAction ? (
              <div className="rounded-xl bg-gradient-to-br from-red-950 to-slate-900 border border-red-900/50 px-4 py-3">
                <div className="text-sm font-semibold text-white leading-snug">{nextAction.title}</div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                  {nextAction.dueDate && (
                    <>
                      <span>Due {nextAction.dueDate.toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{nextAction.estimatedDurationMinutes}m</span>
                  <span>·</span>
                  <PriorityBadge priority={nextAction.priority} />
                </div>
                <button className="mt-2.5 w-full py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors">
                  Start focus session →
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 px-4 py-3 text-sm text-slate-500">
                Nothing pending — you&apos;re all caught up.
              </div>
            )}
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-600 text-center">
                Add a task above to get started.
              </div>
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isNext={nextAction?.id === task.id}
                  timeBlock={timeBlocks.find((tb) => tb.taskId === task.id)}
                  scheduleCandidates={openPopoverTaskId === task.id ? popoverCandidates : null}
                  onComplete={handleComplete}
                  onSchedule={handleSchedule}
                  onClosePopover={() => setOpenPopoverTaskId(null)}
                  onApproveSchedule={handleApproveSchedule}
                />
              ))
            )}
          </div>
        </div>

        {/* Right — calendar */}
        <Calendar timeBlocks={timeBlocks} />
      </div>
    </div>
  );
}
