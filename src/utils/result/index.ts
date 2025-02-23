import type { Records } from "@techmely/types"
import type { IResult } from "./types"

/**
 * Creates an immutable Result object with the given parameters
 */
function createResult<Value = void, E = string | Error, Metadata = Records>(
  isSuccess: boolean,
  data?: Value,
  error?: E,
  metadata: Metadata = {} as Metadata,
): IResult<Value, E, Metadata> {
  const result: IResult<Value, E, Metadata> = {
    isOk: () => isSuccess,
    isFail: () => !isSuccess,
    value: () => data as Value,
    error: () => error as E,
    metadata: () => Object.freeze({ ...metadata }),
    toObject: () =>
      Object.freeze({
        isOk: isSuccess,
        isFail: !isSuccess,
        error,
        data,
        metadata,
      }),
  }

  return Object.freeze(result)
}

/**
 * Creates a success Result with optional data and metadata
 */
export function ok(): IResult<void>
export function ok<V, M = Records, Er = string | Error>(data: V, metadata?: M): IResult<V, Er, M>
export function ok<V = void, M = Records, Er = string | Error>(
  data?: V,
  metadata?: M,
): IResult<V, Er, M> {
  // @ts-expect-error Ignore type error for data being undefined
  return createResult(true, data, undefined, metadata)
}

/**
 * Creates a failure Result with optional error and metadata
 */
export function fail<E = string | Error, M = Records, V = void>(
  error?: E,
  metadata?: M,
): IResult<V, E, M> {
  // @ts-expect-error Ignore type error for data being undefined
  return createResult(false, undefined, error || "An error has occurred", metadata)
}

// Re-export for backward compatibility
export const Result = {
  Ok: ok,
  fail,
} as const
