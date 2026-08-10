import type { AgentId, DeviceId, OrganizationId, ProjectId, UserId } from '@shoo/domain-shared';
import type { Role } from './roles.js';

/**
 * The four identities Shoo must never collapse (docs/33 "Identity layers"):
 * Shoo user, developer device, agent/session and MemWal owner/delegate.
 *
 * A `Subject` is whoever a request acts as. MemWal ownership is deliberately absent from
 * this union: proving control of a wallet does not grant access to a Shoo project.
 */

export type SubjectKind = 'user' | 'device' | 'agent' | 'worker' | 'support';

export interface UserSubject {
  readonly kind: 'user';
  readonly userId: UserId;
}

export interface DeviceSubject {
  readonly kind: 'device';
  readonly deviceId: DeviceId;
  /** The Shoo user that authorized this device. Device authority is derived, never innate. */
  readonly ownerUserId: UserId;
}

export interface AgentSubject {
  readonly kind: 'agent';
  readonly agentId: AgentId;
  readonly deviceId: DeviceId;
  readonly ownerUserId: UserId;
}

export interface WorkerSubject {
  readonly kind: 'worker';
  /** A worker subject is bound to exactly one tenant job scope. */
  readonly jobScope: string;
}

export interface SupportSubject {
  readonly kind: 'support';
  readonly userId: UserId;
  /** Support access always requires explicit, audited elevation. */
  readonly elevationTicket: string;
}

export type Subject =
  | UserSubject
  | DeviceSubject
  | AgentSubject
  | WorkerSubject
  | SupportSubject;

export function subjectUserId(subject: Subject): UserId | null {
  switch (subject.kind) {
    case 'user':
    case 'support':
      return subject.userId;
    case 'device':
    case 'agent':
      return subject.ownerUserId;
    case 'worker':
      return null;
  }
}

/** The role a subject kind may act as, before project grants narrow it further. */
export function defaultRoleForSubject(subject: Subject): Role {
  switch (subject.kind) {
    case 'user':
      return 'developer';
    case 'device':
    case 'agent':
      return 'device_adapter';
    case 'worker':
      return 'background_worker';
    case 'support':
      return 'support_operator';
  }
}

/** Everything an authorization decision needs about the caller (docs/33). */
export interface AuthorizationContext {
  readonly subject: Subject;
  readonly organizationId: OrganizationId;
  readonly projectId: ProjectId;
  /** Effective role after membership and project grants are combined. */
  readonly role: Role;
  readonly visibilityCeiling: import('./visibility.js').VisibilityScope;
  /** False when the device/agent grant is revoked or expired. */
  readonly subjectActive: boolean;
  /** Whether a recent step-up confirmation is attached to this request. */
  readonly stepUpVerified: boolean;
  /** Whether a valid preview token bound to actor/version/action is attached. */
  readonly previewTokenPresent: boolean;
}
