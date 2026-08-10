import { fail, ok, type Result } from '@shoo/domain-shared';
import { type Action, requiresPreviewToken, requiresStepUp, roleAllows } from './roles.js';
import type { AuthorizationContext } from './subject.js';
import { type VisibilityScope, withinVisibilityCeiling } from './visibility.js';

/**
 * The single authorization decision function (docs/33 "Authorization decision inputs").
 *
 * Inputs evaluated here: subject, membership role, action, target visibility, subject
 * revocation, step-up and preview token. Record authority state and expected aggregate
 * version are enforced by the owning aggregate, because only it knows them.
 *
 * The function fails closed: an unknown or inactive subject is denied.
 */

export interface AuthorizationRequest {
  readonly context: AuthorizationContext;
  readonly action: Action;
  /** Visibility of the resource being read or the visibility being requested on write. */
  readonly targetVisibility?: VisibilityScope;
}

export type AuthorizationDenialReason =
  | 'subject_revoked'
  | 'role_not_permitted'
  | 'visibility_ceiling_exceeded'
  | 'step_up_required'
  | 'preview_token_required';

export interface AuthorizationDecision {
  readonly allowed: boolean;
  readonly reason: AuthorizationDenialReason | null;
}

export function authorize(request: AuthorizationRequest): Result<AuthorizationDecision> {
  const { context, action, targetVisibility } = request;

  if (!context.subjectActive) {
    return fail('POLICY_DENIED', 'subject grant is revoked or expired', {
      reason: 'subject_revoked',
    });
  }

  if (!roleAllows(context.role, action)) {
    return fail('POLICY_DENIED', 'role does not permit this action', {
      reason: 'role_not_permitted',
      role: context.role,
      action,
    });
  }

  if (
    targetVisibility !== undefined &&
    !withinVisibilityCeiling(targetVisibility, context.visibilityCeiling)
  ) {
    return fail('SCOPE_VIOLATION', 'requested visibility exceeds the caller ceiling', {
      reason: 'visibility_ceiling_exceeded',
      requested: targetVisibility,
      ceiling: context.visibilityCeiling,
    });
  }

  if (requiresStepUp(action) && !context.stepUpVerified) {
    return fail('AUTHORITY_REQUIRED', 'action requires recent step-up confirmation', {
      reason: 'step_up_required',
      action,
    });
  }

  if (requiresPreviewToken(action) && !context.previewTokenPresent) {
    return fail('AUTHORITY_REQUIRED', 'action requires an approved impact preview token', {
      reason: 'preview_token_required',
      action,
    });
  }

  return ok({ allowed: true, reason: null });
}

/**
 * Convenience guard for command handlers: returns the value when authorized so a use case
 * can chain without unwrapping twice.
 */
export function authorizeThen<T>(request: AuthorizationRequest, value: T): Result<T> {
  const decision = authorize(request);
  if (!decision.ok) return decision;
  return ok(value);
}
