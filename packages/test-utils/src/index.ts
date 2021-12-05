import { either as E } from 'fp-ts'

export const isRightMatching = <T>(
  either: E.Either<unknown, T>,
  assertion: (value: T) => void,
): void => {
  if (!E.isRight(either)) {
    throw new Error(
      `The given either was not a Right value. Instead, the value was '${
        (either as E.Left<unknown>).left
      }' (${JSON.stringify((either as E.Left<unknown>).left)})`,
    )
  }

  assertion(either.right)
}

export const isLeftMatching = <E>(
  either: E.Either<E, unknown>,
  assertion: (value: E) => void,
): void => {
  if (!E.isLeft(either)) {
    throw new Error(
      `The given Either was not a Left value. Instead, I received "${
        either.right
      }" (${JSON.stringify(either.right)})`,
    )
  }

  assertion(either.left)
}
