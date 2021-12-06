import { Observable } from 'rxjs'
import { BaseEvent } from './base-event.js'
import { EventStoreLeft } from './event-store-left.js'
import { either as E } from 'fp-ts'
import { EventStore } from './event-store.js'

export type ReactiveEventStore<T extends BaseEvent> = {
  getEventsForAggregate$<AT extends string, ID extends string>(
    aggregateType: AT,
    aggregrateId: ID,
  ): Observable<E.Either<EventStoreLeft, readonly (T & { aggregateType: AT; aggregateId: ID })[]>>
  getEventsForAggregates$<AT extends string>(
    aggregateType: AT,
  ): Observable<E.Either<EventStoreLeft, readonly (T & { aggregateType: AT })[]>>

  destroy(): Promise<void>
} & EventStore<T>
