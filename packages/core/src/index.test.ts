import test from 'ava'
import { either as E, option as O } from 'fp-ts'
import { QueryService, CommandService } from './index.js'
import { isLeftMatching, isRightMatching } from '@toye.io/field-journal-test-utils'
import { createPouchDB } from './test-utils/pouchdb.js'
import { PouchDBEventStore } from '@toye.io/field-journal-event-store'

test('Creating and querying ploegen', async (t) => {
  const eventStore = new PouchDBEventStore(await createPouchDB())
  const queryService = new QueryService(eventStore)
  const commandService = new CommandService(eventStore, queryService)

  isRightMatching(
    await commandService.registreerPloeg({
      commandName: 'registreer-ploeg',
      ploegId: 'ploeg-foxtrot-2',
      ploegNaam: 'Fietsploeg 2',
      timestamp: Date.now(),
      eventId: 'my-id-1',
    }),
    (res) => t.truthy(res),
  )

  isLeftMatching(
    await commandService.registreerPloeg({
      commandName: 'registreer-ploeg',
      ploegId: 'ploeg-Foxtrot-3',
      ploegNaam: 'Fietsploeg 3',
      timestamp: Date.now(),
      eventId: 'my-id-2',
    }),
    (e) =>
      t.deepEqual(e, {
        type: 'validation',
        message: 'ploegId mag enkel kleine letters, nummers, en "-" bevatten',
      }),
  )

  const ploegen = await queryService.queryPloegen()
  isRightMatching(ploegen, (list) => t.snapshot(list.map((el) => el.serialize())))

  const foxtrotTwee = await queryService.queryPloeg('ploeg-foxtrot-2')

  isRightMatching(foxtrotTwee, (p) => {
    t.true(O.isSome(p))

    if (O.isSome(p)) {
      t.snapshot(p.value.serialize())
    }
  })

  const foxtrotDrie = await queryService.queryPloeg('ploeg-foxtrot-3')
  isRightMatching(foxtrotDrie, (e) => t.true(O.isNone(e)))

  t.true(
    E.isRight(
      await commandService.hernoemPloeg({
        commandName: 'hernoem-ploeg',
        newName: 'Mijn Fietsploeg',
        ploegId: 'ploeg-foxtrot-2',
        timestamp: Date.now(),
        eventId: 'my-id-3',
      }),
    ),
  )

  isRightMatching(await queryService.queryPloeg('ploeg-foxtrot-2'), (p) => {
    t.true(O.isSome(p))

    if (O.isSome(p)) {
      t.is(p.value.ploegNaam, 'Mijn Fietsploeg')
    }
  })
})

test('Creating and querying chat messages', async (t) => {
  const eventStore = new PouchDBEventStore(await createPouchDB())
  const queryService = new QueryService(eventStore)
  const commandService = new CommandService(eventStore, queryService)

  await commandService.verstuurChatBericht({
    commandName: 'verstuur-chat-bericht',
    berichtId: 'mijn-bericht-id-1',
    contents: 'Mijn test chatbericht ✨',
    timestamp: Date.now(),
  })

  isLeftMatching(
    await commandService.verstuurChatBericht({
      commandName: 'verstuur-chat-bericht',
      berichtId: 'mijn-bericht-id-2',
      contents: '',
      timestamp: Date.now(),
    }),
    (e) =>
      t.deepEqual(e, {
        type: 'validation',
        message: 'Chatbericht kan niet leeg zijn',
      }),
  )

  isLeftMatching(
    await commandService.verstuurChatBericht({
      commandName: 'verstuur-chat-bericht',
      berichtId: 'mijn-bericht-id-3',
      contents: 'H'.repeat(600),
      timestamp: Date.now(),
    }),
    (e) =>
      t.deepEqual(e, {
        type: 'validation',
        message: 'Chatbericht kan niet langer dan 500 karakters zijn',
      }),
  )

  await commandService.verstuurChatBericht({
    commandName: 'verstuur-chat-bericht',
    berichtId: 'mijn-bericht-id-3',
    contents: 'Nog een test ✨',
    timestamp: Date.now(),
  })

  await commandService.verstuurChatBericht({
    commandName: 'verstuur-chat-bericht',
    berichtId: 'mijn-bericht-id-4',
    contents: 'Hallo',
    timestamp: Date.now(),
  })

  isRightMatching(await queryService.queryChatBerichten(), (l) => {
    t.is(l.length, 3)
  })

  isRightMatching(await queryService.queryChatBericht('mijn-bericht-id-4'), (l) => {
    t.truthy(O.isSome(l))

    if (O.isSome(l)) {
      t.is(l.value.contents, 'Hallo')
    }
  })

  isRightMatching(await queryService.queryChatBericht('mijn-bericht-id-bestaat-niet'), (l) => {
    t.truthy(O.isNone(l))
  })
})
