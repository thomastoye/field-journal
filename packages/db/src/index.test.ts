import test, { ExecutionContext } from 'ava'
import { either as E } from 'fp-ts'
import { Service } from './index.js'
import PouchDB from 'pouchdb'

import findPlugin from 'pouchdb-find'
import memoryAdapter from 'pouchdb-adapter-memory'

PouchDB.plugin(findPlugin)
PouchDB.plugin(memoryAdapter)

class MockIdGenerator {
  #curr = 0

  nextId(): string {
    this.#curr += 1

    return this.#curr.toString()
  }
}

const isRightMatching = <T>(
  t: ExecutionContext<unknown>,
  either: E.Either<unknown, T>,
  assertion: (t: ExecutionContext<unknown>, value: T) => void,
): void => {
  t.true(
    E.isRight(either),
    `The given either was not a Right value. Instead, the value was '${
      (either as E.Left<unknown>).left
    }'`,
  )

  assertion(t, (either as E.Right<T>).right)
}

const isLeftMatching = <E>(
  t: ExecutionContext<unknown>,
  either: E.Either<E, unknown>,
  assertion: (t: ExecutionContext<unknown>, value: E) => void,
): void => {
  t.true(E.isLeft(either), 'The given either was not a Left value')

  assertion(t, (either as E.Left<E>).left)
}

test('Creating and querying ploegen', async (t) => {
  const pouch = new PouchDB('test', { adapter: 'memory' })
  await pouch.createIndex({
    index: { fields: ['aggregateName'] },
  })
  await pouch.createIndex({
    index: { fields: ['eventType'] },
  })
  await pouch.createIndex({
    index: { fields: ['aggregateName', 'eventType'] },
  })

  // @ts-ignore
  const service = new Service(pouch, new MockIdGenerator())

  await service.registreerPloeg({
    commandName: 'registreer-ploeg',
    ploegId: 'ploeg-foxtrot-2',
    ploegNaam: 'Fietsploeg 2',
    timestamp: Date.now(),
  })

  isLeftMatching(
    t,
    await service.registreerPloeg({
      commandName: 'registreer-ploeg',
      ploegId: 'ploeg-Foxtrot-3',
      ploegNaam: 'Fietsploeg 3',
      timestamp: Date.now(),
    }),
    (t, e) => t.is(e, 'ploegId mag enkel kleine letters, nummers, en "-" bevatten'),
  )

  const ploegen = await service.queryPloegen()
  isRightMatching(t, ploegen, (t, list) => t.snapshot(list.map((el) => el.serialize())))

  const foxtrotTwee = await service.queryPloeg('ploeg-foxtrot-2')
  isRightMatching(t, foxtrotTwee, (t, p) => t.snapshot(p.serialize()))

  const foxtrotDrie = await service.queryPloeg('ploeg-foxtrot-3')
  isLeftMatching(t, foxtrotDrie, (t, e) => t.is(e, 'Ploeg met id "ploeg-foxtrot-3" niet gevonden'))

  t.true(
    E.isRight(
      await service.hernoemPloeg({
        commandName: 'hernoem-ploeg',
        newName: 'Mijn Fietsploeg',
        ploegId: 'ploeg-foxtrot-2',
        timestamp: Date.now(),
      }),
    ),
  )

  isRightMatching(t, await service.queryPloeg('ploeg-foxtrot-2'), (t, p) =>
    t.is(p.ploegNaam, 'Mijn Fietsploeg'),
  )
})
