import { ExecutionContext } from 'ava'
import { either as E } from 'fp-ts'

export const isRightMatching = <T>(
  t: ExecutionContext<unknown>,
  either: E.Either<unknown, T>,
  assertion: (t: ExecutionContext<unknown>, value: T) => void,
): void => {
  t.true(
    E.isRight(either),
    `The given either was not a Right value. Instead, the value was '${
      (either as E.Left<unknown>).left
    }' (${JSON.stringify((either as E.Left<unknown>).left)})`,
  )

  assertion(t, (either as E.Right<T>).right)
}

export const isLeftMatching = <E>(
  t: ExecutionContext<unknown>,
  either: E.Either<E, unknown>,
  assertion: (t: ExecutionContext<unknown>, value: E) => void,
): void => {
  t.true(E.isLeft(either), 'The given either was not a Left value')

  assertion(t, (either as E.Left<E>).left)
}
