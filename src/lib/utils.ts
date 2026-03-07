import { Effect } from 'effect'

/**
 * Greet someone with an effectful computation.
 *
 * @example
 *
 * ```ts
 *   import { Effect } from 'effect'
 *   import { greet } from 'template-typescript-lib'
 *
 *   const program = greet('World')
 *   const result = Effect.runSync(program)
 *   console.log(result) // "Hello, World!"
 * ```
 */
export const greet = (name: string): Effect.Effect<string> => Effect.succeed(`Hello, ${name}!`)
