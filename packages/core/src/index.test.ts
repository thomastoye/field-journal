import test from 'ava'
import { either as E, option as O } from 'fp-ts'
import { Service } from './index.js'
import { isLeftMatching, isRightMatching } from '@toye.io/field-journal-test-utils'
import { createPouchDB } from './test-utils/pouchdb.js'
import { PouchDBEventStore } from '@toye.io/field-journal-eventstore'

class MockIdGenerator {
  #curr = 0

  nextId(): string {
    this.#curr += 1

    return this.#curr.toString()
  }
}

test('Creating and querying ploegen', async (t) => {
  const eventStore = new PouchDBEventStore(await createPouchDB())
  const service = new Service(eventStore, new MockIdGenerator())

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
    (t, e) =>
      t.deepEqual(e, {
        type: 'validation',
        message: 'ploegId mag enkel kleine letters, nummers, en "-" bevatten',
      }),
  )

  const ploegen = await service.queryPloegen()
  isRightMatching(t, ploegen, (t, list) => t.snapshot(list.map((el) => el.serialize())))

  const foxtrotTwee = await service.queryPloeg('ploeg-foxtrot-2')
  isRightMatching(t, foxtrotTwee, (t, p) => {
    t.true(O.isSome(p))

    if (O.isSome(p)) {
      t.snapshot(p.value.serialize())
    }
  })

  const foxtrotDrie = await service.queryPloeg('ploeg-foxtrot-3')
  isRightMatching(t, foxtrotDrie, (t, e) => t.true(O.isNone(e)))

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

  isRightMatching(t, await service.queryPloeg('ploeg-foxtrot-2'), (t, p) => {
    t.true(O.isSome(p))

    if (O.isSome(p)) {
      t.is(p.value.ploegNaam, 'Mijn Fietsploeg')
    }
  })
})
