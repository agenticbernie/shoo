/**
 * `@shoo/domain-intelligence` — Intelligence bounded context (docs/29, docs/30).
 *
 * Owns query intent, the retrieval read model and ranking manifest, the immutable context
 * pack and grounded, cited output. It never treats model fluency as fact.
 */
export * from './context-pack.js';
export * from './retrieval.js';
export * from './answer.js';
