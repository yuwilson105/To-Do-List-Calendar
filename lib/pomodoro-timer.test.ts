import { describe, it, expect } from "vitest";
import { pomodoroReducer, initialPomodoroState, type PomodoroAction } from "./pomodoro-timer";

describe("pomodoroReducer", () => {
  it("starting from idle transitions to working", () => {
    const state = initialPomodoroState({ workMinutes: 25, breakMinutes: 5 });
    const next = pomodoroReducer(state, { type: "START" });
    expect(next.phase).toBe("working");
    expect(next.secondsRemaining).toBe(25 * 60);
  });

  it("completing a work interval transitions to break with correct seconds", () => {
    let state = initialPomodoroState({ workMinutes: 25, breakMinutes: 5 });
    state = pomodoroReducer(state, { type: "START" });
    // Tick down to 1 second remaining
    state = { ...state, secondsRemaining: 1 };
    // Final tick — should transition to break
    state = pomodoroReducer(state, { type: "TICK" });
    expect(state.phase).toBe("break");
    expect(state.secondsRemaining).toBe(5 * 60);
  });

  it("completing a break interval transitions back to working", () => {
    let state = initialPomodoroState({ workMinutes: 25, breakMinutes: 5 });
    state = pomodoroReducer(state, { type: "START" });
    state = { ...state, phase: "break", secondsRemaining: 1 };
    state = pomodoroReducer(state, { type: "TICK" });
    expect(state.phase).toBe("working");
    expect(state.secondsRemaining).toBe(25 * 60);
  });

  it("resetting from any state returns to idle with full work interval", () => {
    let state = initialPomodoroState({ workMinutes: 25, breakMinutes: 5 });
    state = pomodoroReducer(state, { type: "START" });
    state = { ...state, secondsRemaining: 300 }; // mid-session
    state = pomodoroReducer(state, { type: "RESET" });
    expect(state.phase).toBe("idle");
    expect(state.secondsRemaining).toBe(25 * 60);
  });

  it("TICK decrements secondsRemaining by 1 each call", () => {
    let state = initialPomodoroState({ workMinutes: 25, breakMinutes: 5 });
    state = pomodoroReducer(state, { type: "START" });
    const before = state.secondsRemaining;
    state = pomodoroReducer(state, { type: "TICK" });
    expect(state.secondsRemaining).toBe(before - 1);
    expect(state.phase).toBe("working"); // no phase change yet
  });

  it("initial state is idle", () => {
    const state = initialPomodoroState({ workMinutes: 25, breakMinutes: 5 });
    expect(state.phase).toBe("idle");
    expect(state.secondsRemaining).toBe(25 * 60);
  });
});
