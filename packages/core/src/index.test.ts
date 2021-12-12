import test from 'ava'
import { either as E, option as O } from 'fp-ts'
import { PouchDBCommandService, PouchDBQueryService } from './index.js'
import { isLeftMatching, isRightMatching } from '@toye.io/field-journal-test-utils'
import { createPouchDB } from './test-utils/pouchdb.js'
import { PouchDBEventStore } from '@toye.io/field-journal-event-store'

test('Creating and querying ploegen', async (t) => {
  const eventStore = new PouchDBEventStore(await createPouchDB())
  const queryService = new PouchDBQueryService(eventStore)
  const commandService = new PouchDBCommandService(eventStore, queryService)

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
  isRightMatching(ploegen, (list) => t.snapshot(list.map((el) => el.toString())))

  const foxtrotTwee = await queryService.queryPloeg('ploeg-foxtrot-2')

  isRightMatching(foxtrotTwee, (p) => {
    t.true(O.isSome(p))

    if (O.isSome(p)) {
      t.snapshot(p.value.toString())
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
  const queryService = new PouchDBQueryService(eventStore)
  const commandService = new PouchDBCommandService(eventStore, queryService)

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

test('Creating, modifying and querying standplaatsen', async (t) => {
  const eventStore = new PouchDBEventStore(await createPouchDB())
  const queryService = new PouchDBQueryService(eventStore)
  const commandService = new PouchDBCommandService(eventStore, queryService)

  await commandService.registreerStandplaats({
    commandName: 'registreer-standplaats',
    eventId: 'my-event-id-1',
    standplaatsId: 'hp-1',
    standplaatsNaam: 'Hulppost 1',
    timestamp: Date.now(),
  })

  await commandService.registreerStandplaats({
    commandName: 'registreer-standplaats',
    eventId: 'my-event-id-2',
    standplaatsId: 'stationsstraat',
    standplaatsNaam: 'Hoek Stationsstraat',
    timestamp: Date.now(),
  })

  await commandService.hernoemStandplaats({
    commandName: 'hernoem-standplaats',
    eventId: 'my-event-id-3',
    standplaatsId: 'stationsstraat',
    standplaatsNaam: 'Hoek Schoolstraat',
    timestamp: Date.now(),
  })

  await commandService.wijzigStandplaatsLocatie({
    commandName: 'wijzig-standplaats-locatie',
    eventId: 'my-event-id-4',
    standplaatsId: 'hp-1',
    lat: 3.45,
    lng: 5.44,
    timestamp: Date.now(),
  })

  await commandService.wijzigStandplaatsLocatie({
    commandName: 'wijzig-standplaats-locatie',
    eventId: 'my-event-id-5',
    standplaatsId: 'stationsstraat',
    lat: 3.45,
    lng: 5.44,
    timestamp: Date.now(),
  })

  await commandService.wisStandplaatsLocatie({
    commandName: 'wis-standplaats-locatie',
    eventId: 'my-event-id-6',
    standplaatsId: 'hp-1',
    timestamp: Date.now(),
  })

  isRightMatching(await queryService.queryStandplaatsen(), (standplaatsen) =>
    t.snapshot(standplaatsen.map((s) => s.toString())),
  )
})
