/**
 * Typed domain results.
 *
 * Domain operations never throw for expected outcomes: a rejected transition is a value,
 * not an exception (docs/64 "Errors are typed by stable class/code"). Only genuine
 * programming errors use `invariant`.
 */

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = DomainError> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value;
  throw new DomainInvariantError(
    `unwrap() called on an error result: ${JSON.stringify(result.error)}`,
  );
}

/**
 * Stable domain error codes. These are the domain's own vocabulary; adapters translate
 * them into HTTP/MCP transport codes.
 */
export type DomainErrorCode =
  | 'INVALID_ARGUMENT'
  | 'INVARIANT_VIOLATION'
  | 'ILLEGAL_TRANSITION'
  | 'VERSION_CONFLICT'
  | 'AUTHORITY_REQUIRED'
  | 'SCOPE_VIOLATION'
  | 'EVIDENCE_REQUIRED'
  | 'LINEAGE_VIOLATION'
  | 'CONFLICT_ACTIVE'
  | 'POLICY_DENIED'
  | 'ALREADY_TERMINAL'
  | 'NOT_ELIGIBLE';

export interface DomainError {
  readonly code: DomainErrorCode;
  /** Operator-facing, content-safe. Never contains project content or secrets. */
  readonly message: string;
  /** Content-safe structured detail: ids, versions, state names. */
  readonly detail?: Readonly<Record<string, string | number | boolean | null>>;
}

export function domainError(
  code: DomainErrorCode,
  message: string,
  detail?: DomainError['detail'],
): DomainError {
  return detail === undefined ? { code, message } : { code, message, detail };
}

export function fail<T = never>(
  code: DomainErrorCode,
  message: string,
  detail?: DomainError['detail'],
): Result<T> {
  return err(domainError(code, message, detail));
}

/** Thrown only when calling code broke a precondition it was required to guarantee. */
export class DomainInvariantError extends Error {
  override readonly name = 'DomainInvariantError';
}

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new DomainInvariantError(message);
  }
}
