import { type Result, fail, ok } from './result.js';

/**
 * A declarative state machine.
 *
 * Every lifecycle in the Shoo domain (work unit, session, memory authority, durable
 * operation, outbox job) is expressed as an explicit transition table so the legal moves
 * are data that tests and documentation can read, not control flow buried in methods.
 */
export type TransitionTable<S extends string> = Readonly<Record<S, readonly S[]>>;

export interface StateMachine<S extends string> {
  readonly states: readonly S[];
  readonly initial: S;
  readonly terminal: ReadonlySet<S>;
  can(from: S, to: S): boolean;
  transition(from: S, to: S): Result<S>;
  isTerminal(state: S): boolean;
}

export function stateMachine<S extends string>(options: {
  readonly name: string;
  readonly initial: S;
  readonly transitions: TransitionTable<S>;
  readonly terminal: readonly S[];
}): StateMachine<S> {
  const states = Object.keys(options.transitions) as S[];
  const terminal = new Set<S>(options.terminal);

  return {
    states,
    initial: options.initial,
    terminal,
    can(from, to) {
      return (options.transitions[from] ?? []).includes(to);
    },
    isTerminal(state) {
      return terminal.has(state);
    },
    transition(from, to) {
      if (terminal.has(from)) {
        return fail('ALREADY_TERMINAL', `${options.name} is already in terminal state ${from}`, {
          from,
          to,
        });
      }
      if (!(options.transitions[from] ?? []).includes(to)) {
        return fail('ILLEGAL_TRANSITION', `${options.name} cannot move from ${from} to ${to}`, {
          from,
          to,
        });
      }
      return ok(to);
    },
  };
}
