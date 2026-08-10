import type { Result } from '@shoo/domain-shared';
import type { RequestContext } from './ports/adapters.js';

/**
 * Use-case shape.
 *
 * Apps implement use cases and compose them; this package owns only the contract between
 * a use case, its request context and its ports (docs/63 "`application` owns use cases and
 * ports"). Dependencies are injected explicitly through factories — there is no service
 * locator anywhere in Shoo (docs/64).
 */
export interface UseCase<TInput, TOutput> {
  readonly name: string;
  execute(context: RequestContext, input: TInput): Promise<Result<TOutput>>;
}

/** A use case that returns an operation handle instead of a synchronous result. */
export interface AsyncUseCase<TInput> {
  readonly name: string;
  execute(
    context: RequestContext,
    input: TInput,
  ): Promise<Result<{ readonly operationId: string; readonly pollAfterMillis: number }>>;
}

/** Factory signature used by app composition roots. */
export type UseCaseFactory<TDeps, TInput, TOutput> = (deps: TDeps) => UseCase<TInput, TOutput>;
