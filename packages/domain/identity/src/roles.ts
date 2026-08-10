/**
 * MVP roles, actions and the authorization matrix (docs/33 "Permission model").
 *
 * Authorization is application policy expressed as domain rules: transport contracts can
 * never authorize an action (docs/64 "Contract workflow"). RLS is defence in depth behind
 * this, not a replacement for it (docs/33 "Balanced PostgreSQL isolation").
 */

export const ROLES = [
  'project_owner',
  'developer',
  'device_adapter',
  'background_worker',
  'support_operator',
] as const;
export type Role = (typeof ROLES)[number];

export const ACTIONS = [
  // project lifecycle
  'project.link',
  'project.read',
  'project.delete',
  'project.export',
  'project.manage_policy',
  'project.manage_memwal_identity',
  // devices
  'device.register',
  'device.revoke',
  // capture and continuity
  'evidence.ingest',
  'work_unit.read',
  'work_unit.create',
  'work_unit.transition',
  'session.start',
  'session.checkpoint',
  'session.complete',
  // memory authority
  'memory.read',
  'memory.propose',
  'memory.correct',
  'memory.accept',
  'memory.mark_canonical',
  'memory.supersede',
  'conflict.resolve',
  // intelligence
  'context.build',
  'ask.query',
  // platform / operations
  'operation.read',
  'operation.cancel',
  'metadata.diagnose',
] as const;
export type Action = (typeof ACTIONS)[number];

const DEVELOPER_ACTIONS: readonly Action[] = [
  'project.read',
  'evidence.ingest',
  'work_unit.read',
  'work_unit.create',
  'work_unit.transition',
  'session.start',
  'session.checkpoint',
  'session.complete',
  'memory.read',
  'memory.propose',
  'memory.correct',
  'memory.accept',
  'memory.supersede',
  'context.build',
  'ask.query',
  'operation.read',
  'operation.cancel',
];

/**
 * Device adapters ingest and read within their grants. They hold no membership, policy or
 * canonical authority (docs/33).
 */
const DEVICE_ADAPTER_ACTIONS: readonly Action[] = [
  'project.read',
  'evidence.ingest',
  'work_unit.read',
  'session.start',
  'session.checkpoint',
  'session.complete',
  'memory.read',
  'memory.propose',
  'context.build',
  'ask.query',
  'operation.read',
];

/** Background workers process one authorized tenant job. No interactive access. */
const BACKGROUND_WORKER_ACTIONS: readonly Action[] = [
  'project.read',
  'work_unit.read',
  'memory.read',
  'memory.propose',
  'context.build',
  'operation.read',
];

/** Support operators see safe operational metadata only, with audited elevation. */
const SUPPORT_OPERATOR_ACTIONS: readonly Action[] = ['metadata.diagnose', 'operation.read'];

const PROJECT_OWNER_ACTIONS: readonly Action[] = [
  ...DEVELOPER_ACTIONS,
  'project.link',
  'project.delete',
  'project.export',
  'project.manage_policy',
  'project.manage_memwal_identity',
  'device.register',
  'device.revoke',
  'memory.mark_canonical',
  'conflict.resolve',
];

export const ROLE_ACTIONS: Readonly<Record<Role, ReadonlySet<Action>>> = Object.freeze({
  project_owner: new Set(PROJECT_OWNER_ACTIONS),
  developer: new Set(DEVELOPER_ACTIONS),
  device_adapter: new Set(DEVICE_ADAPTER_ACTIONS),
  background_worker: new Set(BACKGROUND_WORKER_ACTIONS),
  support_operator: new Set(SUPPORT_OPERATOR_ACTIONS),
});

/**
 * Actions requiring recent reauthentication or wallet confirmation
 * (docs/33 "Step-up actions").
 */
export const STEP_UP_ACTIONS: ReadonlySet<Action> = new Set<Action>([
  'device.register',
  'device.revoke',
  'project.manage_memwal_identity',
  'project.manage_policy',
  'project.export',
  'project.delete',
  'memory.mark_canonical',
]);

/** Actions whose commit requires a preview token bound to actor, version and action. */
export const PREVIEW_TOKEN_ACTIONS: ReadonlySet<Action> = new Set<Action>([
  'memory.mark_canonical',
  'memory.supersede',
  'memory.correct',
  'conflict.resolve',
  'project.manage_policy',
  'project.export',
  'project.delete',
]);

export function roleAllows(role: Role, action: Action): boolean {
  return ROLE_ACTIONS[role].has(action);
}

export function requiresStepUp(action: Action): boolean {
  return STEP_UP_ACTIONS.has(action);
}

export function requiresPreviewToken(action: Action): boolean {
  return PREVIEW_TOKEN_ACTIONS.has(action);
}

/** Ordering used to compare two roles when checking "a grant may not exceed its issuer". */
const ROLE_RANK: Readonly<Record<Role, number>> = Object.freeze({
  support_operator: 0,
  background_worker: 1,
  device_adapter: 2,
  developer: 3,
  project_owner: 4,
});

export function roleRank(role: Role): number {
  return ROLE_RANK[role];
}
