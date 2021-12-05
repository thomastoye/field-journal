import { BaseEvent } from './base-event.js'
import { either as E } from 'fp-ts'
import { EventStoreLeft } from './event-store-left.js'

export type EventStore<T extends BaseEvent> = {
  getEventsForAggregate<AT extends string, ID extends string>(
    aggregateType: AT,
    aggregrateId: ID,
  ): Promise<E.Either<EventStoreLeft, readonly (T & { aggregateType: AT; aggregateId: ID })[]>>
  getEventsForAggregates<AT extends string>(
    aggregateType: AT,
  ): Promise<E.Either<EventStoreLeft, readonly (T & { aggregateType: AT })[]>>
  storeEvent<I extends T>(event: I): Promise<E.Either<EventStoreLeft, I>>
  destroy(): Promise<void>
}
