import test from 'ava'
import { EventStore, PouchDBEventStore } from './index.js'
import { isRightMatching } from '@toye.io/field-journal-test-utils'
import PouchDB from 'pouchdb'

import findPlugin from 'pouchdb-find'
import memoryAdapter from 'pouchdb-adapter-memory'
import { lastValueFrom, takeUntil, timer } from 'rxjs'

PouchDB.plugin(findPlugin)
PouchDB.plugin(memoryAdapter)

const createPouchDB = async <T>() => {
  const pouch = new PouchDB<T>(`test-${Math.random()}`, { adapter: 'memory' })

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

  isRightMatching(noEventsExpected, (l) => t.deepEqual(l, []))

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

  isRightMatching(await es.storeEvent(event1), (v) => t.deepEqual(v, event1))
  isRightMatching(await es.storeEvent(event2), (v) => t.deepEqual(v, event2))
  isRightMatching(await es.storeEvent(event3), (v) => t.deepEqual(v, event3))
  isRightMatching(await es.storeEvent(event4), (v) => t.deepEqual(v, event4))
  isRightMatching(await es.storeEvent(event5), (v) => t.deepEqual(v, event5))
  isRightMatching(await es.storeEvent(event6), (v) => t.deepEqual(v, event6))

  isRightMatching(await es.getEventsForAggregate('my-aggregate', 'my-aggregate-id'), (l) =>
    t.is(l.length, 4),
  )
  isRightMatching(await es.getEventsForAggregate('my-aggregate', 'not-my-aggregate-id'), (l) =>
    t.is(l.length, 0),
  )
  isRightMatching(await es.getEventsForAggregate('my-other-aggregate', 'my-aggregate-id'), (l) =>
    t.is(l.length, 1),
  )
  isRightMatching(
    await es.getEventsForAggregate('my-other-aggregate', 'not-my-aggregate-id'),
    (l) => t.is(l.length, 0),
  )
  isRightMatching(await es.getEventsForAggregates('my-other-aggregate'), (l) => t.is(l.length, 2))

  await es.destroy()
})

test('PouchDB reactive event store - getEventsForAggregate$', async (t) => {
  const es = new PouchDBEventStore(await createPouchDB<Events>())

  const noEventsExpected = await lastValueFrom(
    es.getEventsForAggregate$('my-aggregate', 'my-aggregate-id').pipe(takeUntil(timer(100))),
  )

  isRightMatching(noEventsExpected, (l) => t.deepEqual(l, []))

  // Set up the observable
  const oneEventExpected = lastValueFrom(
    es.getEventsForAggregate$('my-aggregate', 'my-aggregate-id').pipe(takeUntil(timer(100))),
  )

  // Store an event
  await es.storeEvent({
    eventId: 'my-id-1',
    timestamp: 1638640782123,
    aggregateId: 'my-aggregate-id',
    aggregateType: 'my-aggregate',
    eventType: 'my-event',
  } as const)

  // Our observable should see the event
  isRightMatching(await oneEventExpected, (l) => t.is(l.length, 1))

  await es.destroy()
})

test('PouchDB reactive event store - getEventsForAggregates$', async (t) => {
  const es = new PouchDBEventStore(await createPouchDB<Events>())

  const noEventsExpected = await lastValueFrom(
    es.getEventsForAggregates$('my-aggregate').pipe(takeUntil(timer(100))),
  )

  isRightMatching(noEventsExpected, (l) => t.deepEqual(l, []))

  // Set up the observable
  const oneEventExpected = lastValueFrom(
    es.getEventsForAggregates$('my-aggregate').pipe(takeUntil(timer(100))),
  )

  // Store an event
  await es.storeEvent({
    eventId: 'my-id-1',
    timestamp: 1638640782123,
    aggregateId: 'my-aggregate-id',
    aggregateType: 'my-aggregate',
    eventType: 'my-event',
  } as const)

  // Our observable should see the event
  isRightMatching(await oneEventExpected, (l) => t.is(l.length, 1))

  await es.destroy()
})
