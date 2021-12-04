import test from 'ava'
import { EventStore, PouchDBEventStore } from './index.js'
import { isRightMatching } from '@toye.io/field-journal-test-utils'
import PouchDB from 'pouchdb'

import findPlugin from 'pouchdb-find'
import memoryAdapter from 'pouchdb-adapter-memory'

PouchDB.plugin(findPlugin)
PouchDB.plugin(memoryAdapter)

const createPouchDB = async <T>() => {
  const pouch = new PouchDB<T>('test', { adapter: 'memory' })

  await pouch.createIndex({
    index: { fields: ['aggregateType'] },
  })
  await pouch.createIndex({
    index: { fields: ['eventType'] },
  })
  await pouch.createIndex({
    index: { fields: ['aggregateType', 'eventType'] },
  })
  await pouch.createIndex({
    index: { fields: ['aggregateType', 'aggregateId'] },
  })

  return pouch
}

type MyEvent = {
  eventId: string
  aggregateType: 'my-aggregate'
  aggregateId: string
  eventType: 'my-other-event'
  timestamp: number
}

type MyOtherEvent = {
  eventId: string
  aggregateType: 'my-aggregate'
  aggregateId: string
  eventType: 'my-event'
  timestamp: number
}

type AnotherEvent = {
  eventId: string
  aggregateType: 'my-other-aggregate'
  aggregateId: string
  eventType: 'my-event'
  timestamp: number
}

type Events = MyEvent | MyOtherEvent | AnotherEvent

test('PouchDB event store', async (t) => {
  const es: EventStore<Events> = new PouchDBEventStore(await createPouchDB<Events>())

  const noEventsExpected = await es.getEventsForAggregate('my-aggregate', 'my-aggregate-id')

  isRightMatching(t, noEventsExpected, (t, l) => t.deepEqual(l, []))

  const event1 = {
    eventId: 'my-id-1',
    timestamp: 1638640782123,
    aggregateId: 'my-aggregate-id',
    aggregateType: 'my-aggregate',
    eventType: 'my-event',
  } as const

  const event2 = {
    eventId: 'my-id-2',
    timestamp: 1638640782124,
    aggregateId: 'my-aggregate-id',
    aggregateType: 'my-other-aggregate',
    eventType: 'my-event',
  } as const

  const event3 = {
    eventId: 'my-id-3',
    timestamp: 1638640782125,
    aggregateId: 'my-aggregate-id',
    aggregateType: 'my-aggregate',
    eventType: 'my-other-event',
  } as const

  const event4 = {
    eventId: 'my-id-4',
    timestamp: 1638640782126,
    aggregateId: 'my-aggregate-id',
    aggregateType: 'my-aggregate',
    eventType: 'my-event',
  } as const

  const event5 = {
    eventId: 'my-id-5',
    timestamp: 1638640782127,
    aggregateId: 'my-aggregate-id',
    aggregateType: 'my-aggregate',
    eventType: 'my-event',
  } as const

  const event6 = {
    eventId: 'my-id-6',
    timestamp: 1638640782127,
    aggregateId: 'my-other-aggregate-id',
    aggregateType: 'my-other-aggregate',
    eventType: 'my-event',
  } as const

  isRightMatching(t, await es.storeEvent(event1), (t, v) => t.deepEqual(v, event1))
  isRightMatching(t, await es.storeEvent(event2), (t, v) => t.deepEqual(v, event2))
  isRightMatching(t, await es.storeEvent(event3), (t, v) => t.deepEqual(v, event3))
  isRightMatching(t, await es.storeEvent(event4), (t, v) => t.deepEqual(v, event4))
  isRightMatching(t, await es.storeEvent(event5), (t, v) => t.deepEqual(v, event5))
  isRightMatching(t, await es.storeEvent(event6), (t, v) => t.deepEqual(v, event6))

  isRightMatching(t, await es.getEventsForAggregate('my-aggregate', 'my-aggregate-id'), (t, l) =>
    t.is(l.length, 4),
  )
  isRightMatching(
    t,
    await es.getEventsForAggregate('my-aggregate', 'not-my-aggregate-id'),
    (t, l) => t.is(l.length, 0),
  )
  isRightMatching(
    t,
    await es.getEventsForAggregate('my-other-aggregate', 'my-aggregate-id'),
    (t, l) => t.is(l.length, 1),
  )
  isRightMatching(
    t,
    await es.getEventsForAggregate('my-other-aggregate', 'not-my-aggregate-id'),
    (t, l) => t.is(l.length, 0),
  )
  isRightMatching(t, await es.getEventsForAggregates('my-other-aggregate'), (t, l) =>
    t.is(l.length, 2),
  )
})
