export type PomodoroPhase = "idle" | "working" | "break";

export interface PomodoroConfig {
  workMinutes: number;
  breakMinutes: number;
}

export interface PomodoroState {
  phase: PomodoroPhase;
  secondsRemaining: number;
  config: PomodoroConfig;
}

export type PomodoroAction =
  | { type: "START" }
  | { type: "TICK" }
  | { type: "RESET" }
  | { type: "UPDATE_CONFIG"; config: PomodoroConfig };

export function initialPomodoroState(config: PomodoroConfig): PomodoroState {
  return {
    phase: "idle",
    secondsRemaining: config.workMinutes * 60,
    config,
  };
}

/**
 * Pure reducer for the Pomodoro Timer state machine.
 *
 * States: idle → working → break → working → ...
 * TICK decrements secondsRemaining; when it hits 0, transitions to the next phase.
 * RESET always returns to idle with full work interval remaining.
 */
export function pomodoroReducer(
  state: PomodoroState,
  action: PomodoroAction
): PomodoroState {
  switch (action.type) {
    case "START": {
      if (state.phase !== "idle") return state;
      return { ...state, phase: "working" };
    }

    case "TICK": {
      if (state.phase === "idle") return state;

      const next = state.secondsRemaining - 1;

      if (next > 0) {
        return { ...state, secondsRemaining: next };
      }

      // Interval complete — transition phase
      if (state.phase === "working") {
        return {
          ...state,
          phase: "break",
          secondsRemaining: state.config.breakMinutes * 60,
        };
      }

      // break → working
      return {
        ...state,
        phase: "working",
        secondsRemaining: state.config.workMinutes * 60,
      };
    }

    case "RESET": {
      return initialPomodoroState(state.config);
    }

    case "UPDATE_CONFIG": {
      // Only update config; if idle, also reset the seconds to match new work duration
      if (state.phase === "idle") {
        return initialPomodoroState(action.config);
      }
      return { ...state, config: action.config };
    }
  }
}
