import type { EmbeddingPort, EmbeddingVector } from '@shoo/application';

/**
 * `@shoo/embedding` — embedding provider registry and vector descriptors.
 *
 * The concrete provider adapter is owned by the worker engineer. This package fixes the
 * parts that must not drift: how a model identity is described, and the rule that a model
 * or dimension change is a NEW vector row and a parallel index, never a mutation of
 * meaning in place (docs/36 "Migration and compatibility").
 */

export interface EmbeddingModelDescriptor {
  readonly model: string;
  readonly modelVersion: string;
  readonly dimension: number;
  /** Distance function the index is built with; must match the pgvector operator class. */
  readonly distance: 'cosine' | 'l2' | 'inner_product';
}

export type EmbeddingProviderName = 'none' | 'local' | 'remote';

export type EmbeddingProviderFactory = (options: {
  readonly model: string;
  readonly dimension: number;
  readonly apiKey?: string | undefined;
}) => EmbeddingPort;

/** Registry populated by app composition roots — the only provider construction site. */
export class EmbeddingRegistry {
  private readonly factories = new Map<EmbeddingProviderName, EmbeddingProviderFactory>();

  register(name: EmbeddingProviderName, factory: EmbeddingProviderFactory): void {
    this.factories.set(name, factory);
  }

  create(
    name: EmbeddingProviderName,
    options: {
      readonly model: string;
      readonly dimension: number;
      readonly apiKey?: string;
    },
  ): EmbeddingPort {
    const factory = this.factories.get(name);
    if (factory === undefined) {
      throw new Error(`no embedding provider registered under "${name}"`);
    }
    return factory(options);
  }
}

export function describeModel(port: EmbeddingPort): EmbeddingModelDescriptor {
  return {
    model: port.model,
    modelVersion: port.modelVersion,
    dimension: port.dimension,
    distance: 'cosine',
  };
}

/** True when two descriptors denote the same vector space. */
export function sameVectorSpace(a: EmbeddingModelDescriptor, b: EmbeddingModelDescriptor): boolean {
  return (
    a.model === b.model &&
    a.modelVersion === b.modelVersion &&
    a.dimension === b.dimension &&
    a.distance === b.distance
  );
}

/**
 * Guard for reindexing: a vector produced under a different model identity may never be
 * compared with the current index.
 */
export function assertComparable(
  vector: EmbeddingVector,
  descriptor: EmbeddingModelDescriptor,
): void {
  if (
    vector.model !== descriptor.model ||
    vector.modelVersion !== descriptor.modelVersion ||
    vector.dimension !== descriptor.dimension
  ) {
    throw new Error(
      'vector was produced by a different model identity; create a parallel index instead',
    );
  }
}
