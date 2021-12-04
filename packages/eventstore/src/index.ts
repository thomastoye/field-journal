import { either as E } from 'fp-ts'

export type BaseEvent = {
  eventId: string
  aggregateType: string
  aggregateId: string
  eventType: string
  timestamp: number
}

export type EventStoreLeft =
  | {
      type: 'pouchdb-warning'
      warning: string
      message: string
    }
  | {
      type: 'pouchdb-error'
      message: string
      error: unknown
    }
  | {
      type: 'pouchdb-unsuccesful'
      message: string
    }

export type EventStore<T extends BaseEvent> = {
  getEventsForAggregate<AT extends string, ID extends string>(
    aggregateType: AT,
    aggregrateId: ID,
  ): Promise<E.Either<EventStoreLeft, readonly (T & { aggregateType: AT; aggregateId: ID })[]>>
  getEventsForAggregates<AT extends string>(
    aggregateType: AT,
  ): Promise<E.Either<EventStoreLeft, readonly (T & { aggregateType: AT })[]>>
  storeEvent<I extends T>(event: I): Promise<E.Either<EventStoreLeft, I>>
}

export class PouchDBEventStore<T extends BaseEvent> implements EventStore<T> {
  #pouch: PouchDB.Database<T>
  #warningsAsErrors: boolean

  constructor(
    pouch: PouchDB.Database<T>,
    options?: {
      warningsAsErrors?: boolean
    },
  ) {
    this.#pouch = pouch
    this.#warningsAsErrors = options?.warningsAsErrors == null ? true : options.warningsAsErrors
  }

  async getEventsForAggregate<AT extends string, ID extends string>(
    aggregateType: AT,
    aggregateId: ID,
  ): Promise<E.Either<EventStoreLeft, readonly (T & { aggregateType: AT; aggregateId: ID })[]>> {
    try {
      const events = await this.#pouch.find({
        selector: {
          aggregateType,
          aggregateId,
        },
      })

      const warning = events.warning

      if (warning != null && this.#warningsAsErrors) {
        return E.left({
          type: 'pouchdb-warning',
          warning,
          message: `PouchDB warning: ${warning}`,
        })
      }

      return E.right(
        events.docs as PouchDB.Core.ExistingDocument<T & { aggregateType: AT; aggregateId: ID }>[],
      )
    } catch (err) {
      return E.left({
        type: 'pouchdb-error',
        error: err,
        message: `PouchDB error: ${err}`,
      })
    }
  }

  async getEventsForAggregates<AT extends string>(
    aggregateType: string,
  ): Promise<E.Either<EventStoreLeft, readonly (T & { aggregateType: AT })[]>> {
    try {
      const events = await this.#pouch.find({
        selector: {
          aggregateType,
        },
      })

      const warning = events.warning

      if (warning != null && this.#warningsAsErrors) {
        return E.left({
          type: 'pouchdb-warning',
          warning,
          message: `PouchDB warning: ${warning}`,
        })
      }

      return E.right(events.docs as PouchDB.Core.ExistingDocument<T & { aggregateType: AT }>[])
    } catch (err) {
      return E.left({
        type: 'pouchdb-error',
        error: err,
        message: `PouchDB error: ${err}`,
      })
    }
  }

  async storeEvent<I extends T>(event: I): Promise<E.Either<EventStoreLeft, I>> {
    try {
      const result = await this.#pouch.put({ ...event, _id: event.eventId })

      if (!result.ok) {
        return E.left({
          type: 'pouchdb-unsuccesful',
          message: `PouchDB: Result was not ok: ${JSON.stringify(result)}`,
        })
      }

      return E.right(event)
    } catch (err) {
      return E.left({
        type: 'pouchdb-error',
        error: err,
        message: `PouchDB error: ${err}`,
      })
    }
  }
}
