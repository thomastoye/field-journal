import { either as E, function as F, nonEmptyArray, option as O } from 'fp-ts'
import groupBy from 'lodash.groupby'
import { ChatBerichtEvent } from './aggregates/chat-bericht.js'
import {
  HernoemPloegCommand,
  Ploeg,
  PloegEvent,
  RegisteerPloegCommand,
} from './aggregates/ploeg.js'
import { EventStore, EventStoreLeft } from '@toye.io/field-journal-eventstore'

export type DBDoc = ChatBerichtEvent | PloegEvent

export type IdGenerator = {
  nextId: () => string
}

type RegisteerPloegCommandLeft = {
  type: 'validation'
  message: string
}

export class Service {
  #es: EventStore<DBDoc>
  #idGenerator: IdGenerator

  constructor(es: EventStore<DBDoc>, idGenerator: IdGenerator) {
    this.#es = es
    this.#idGenerator = idGenerator
  }

  async registreerPloeg(
    command: RegisteerPloegCommand,
  ): Promise<E.Either<EventStoreLeft | RegisteerPloegCommandLeft, { id: string }>> {
    if (command.ploegId.match(/^[a-z\-0-9]+$/) == null) {
      return E.left({
        type: 'validation',
        message: 'ploegId mag enkel kleine letters, nummers, en "-" bevatten',
      })
    }

    if (!command.ploegId.startsWith('ploeg-')) {
      return E.left({ type: 'validation', message: `ploegId moet starten met 'ploeg-'` })
    }

    const putResult = await this.#es.storeEvent({
      aggregateType: 'ploeg',
      eventType: 'ploeg-aangemaakt',
      ploegNaam: command.ploegNaam,
      eventId: this.#idGenerator.nextId(),
      timestamp: command.timestamp,
      ploegId: command.ploegId,
      aggregateId: command.ploegId,
    })

    return F.pipe(
      putResult,
      E.map((e) => ({ id: e.aggregateId })),
    )
  }

  async hernoemPloeg(command: HernoemPloegCommand): Promise<E.Either<EventStoreLeft, null>> {
    const ploeg = await this.queryPloeg(command.ploegId)

    if (E.isLeft(ploeg)) {
      return ploeg
    }

    const putResult = await this.#es.storeEvent({
      aggregateType: 'ploeg',
      eventId: this.#idGenerator.nextId(),
      aggregateId: command.ploegId,
      timestamp: command.timestamp,
      eventType: 'ploeg-hernoemd',
      ploegNaam: command.newName,
      ploegId: command.ploegId,
    })

    return F.pipe(
      putResult,
      E.map(() => null),
    )
  }

  async queryPloeg(ploegId: string): Promise<E.Either<EventStoreLeft, O.Option<Ploeg>>> {
    return F.pipe(
      await this.#es.getEventsForAggregate('ploeg', ploegId),
      E.map((events) => {
        if (events.length === 0) {
          return O.none
        } else {
          return O.some(Ploeg.createFromEvents(events as nonEmptyArray.NonEmptyArray<PloegEvent>))
        }
      }),
    )
  }

  async queryPloegen(): Promise<E.Either<EventStoreLeft, readonly Ploeg[]>> {
    return F.pipe(
      await this.#es.getEventsForAggregates('ploeg'),
      E.map((res) => Object.values(groupBy(res, 'aggregateId'))),
      E.map((grouped) => grouped.map((events) => Ploeg.createFromEvents(events))),
    )
  }
}
