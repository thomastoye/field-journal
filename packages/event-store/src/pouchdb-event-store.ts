import { either as E } from 'fp-ts'
import { filter, Observable, mergeMap, Subject, concat } from 'rxjs'
import { BaseEvent } from './base-event.js'
import { EventStore } from './event-store.js'
import { EventStoreLeft } from './event-store-left.js'
import { ReactiveEventStore } from './reactive-event-store.js'

export class PouchDBEventStore<T extends BaseEvent>
  implements EventStore<T>, ReactiveEventStore<T>
{
  #pouch: PouchDB.Database<T>
  #warningsAsErrors: boolean
  #changes: Subject<PouchDB.Core.ChangesResponseChange<T>> | null = null
  #changesEventEmitter: PouchDB.Core.Changes<T> | null = null

  constructor(
    pouch: PouchDB.Database<T>,
    options?: {
      warningsAsErrors?: boolean
    },
  ) {
    this.#pouch = pouch
    this.#warningsAsErrors = options?.warningsAsErrors == null ? true : options.warningsAsErrors
  }

  private get changes(): Observable<PouchDB.Core.ChangesResponseChange<T>> {
    if (this.#changes != null) {
      return this.#changes
    }

    const changes = new Subject<PouchDB.Core.ChangesResponseChange<T>>()

    this.#changesEventEmitter = this.#pouch
      .changes({
        live: true,
        since: 'now',
      })
      .on('change', (change) => changes.next(change))
      .on('complete', () => changes.complete())
      .on('error', (err) => changes.error(err))

    this.#changes = changes

    return changes
  }

  async destroy() {
    this.#changesEventEmitter?.cancel()
    this.#changesEventEmitter = null
    this.#changes = null
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

  getEventsForAggregate$<AT extends string, ID extends string>(
    aggregateType: AT,
    aggregrateId: ID,
  ): Observable<E.Either<EventStoreLeft, readonly (T & { aggregateType: AT; aggregateId: ID })[]>> {
    return concat(
      this.getEventsForAggregate(aggregateType, aggregrateId),
      this.changes.pipe(
        filter((change) => {
          // Is this change relevant for us?
          const [eAggregateType, eAggregateId] = change.id.split('--')
          return eAggregateType === aggregateType && eAggregateId === aggregrateId
        }),
        mergeMap(() => this.getEventsForAggregate(aggregateType, aggregrateId)),
      ),
    )
  }

  getEventsForAggregates$<AT extends string>(
    aggregateType: AT,
  ): Observable<E.Either<EventStoreLeft, readonly (T & { aggregateType: AT })[]>> {
    return concat(
      this.getEventsForAggregates<AT>(aggregateType),
      this.changes.pipe(
        filter((change) => {
          // Is this change relevant for us?
          const eventAggregateType = change.id.split('--')[0]
          return eventAggregateType === aggregateType
        }),
        mergeMap(() => this.getEventsForAggregates<AT>(aggregateType)),
      ),
    )
  }

  async storeEvent<I extends T>(event: I): Promise<E.Either<EventStoreLeft, I>> {
    try {
      if (event.aggregateType.length > 30 || event.aggregateType.length < 3) {
        return E.left({
          type: 'pouchdb-error',
          message: `The aggregate type name ("${event.aggregateType}") cannot be longer than 30 characters or shorter than 3.`,
        })
      }

      if (event.aggregateType.match(/^([a-z0-9]+(-[a-z0-9])*)+$/) == null) {
        return E.left({
          type: 'pouchdb-error',
          message: `The aggregate type name ("${event.aggregateType}") must only consist of lowercase letters, numbers, and (non-consecutive) dashes`,
        })
      }

      if (event.eventId.match(/^([a-z0-9]+(-[a-z0-9])*)+$/) == null) {
        return E.left({
          type: 'pouchdb-error',
          message: `The event id ("${event.eventId}") must only consist of lowercase letters, numbers, and (non-consecutive) dashes`,
        })
      }

      if (event.aggregateId.match(/^([a-z0-9]+(-[a-z0-9])*)+$/) == null) {
        return E.left({
          type: 'pouchdb-error',
          message: `The aggregate id ("${event.aggregateId}") must only consist of lowercase letters, numbers, and (non-consecutive) dashes`,
        })
      }

      const result = await this.#pouch.put({
        ...event,
        _id: `${event.aggregateType}--${event.aggregateId}--${event.eventId}`,
      })

      if (!result.ok) {
        return E.left({
          type: 'pouchdb-unsuccesful',
          message: `PouchDB: Result was not ok: ${JSON.stringify(result)}`,
          details: result,
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
