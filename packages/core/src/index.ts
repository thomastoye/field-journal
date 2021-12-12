import { either as E, function as F, option as O, array as A, number as N, ord as Ord } from 'fp-ts'
import groupBy from 'lodash.groupby'
import {
  ChatBerichtEvent,
  ChatBericht,
  VerstuurChatBerichtCommand,
  ChatBerichtVerstuurdEvent,
} from './aggregates/chat-bericht.js'
import {
  HernoemPloegCommand,
  Ploeg,
  PloegAangemaaktEvent,
  PloegEvent,
  RegisteerPloegCommand,
} from './aggregates/ploeg.js'
import {
  Aggregate,
  BaseEvent,
  EventStore,
  EventStoreLeft,
  ReactiveEventStore,
} from '@toye.io/field-journal-event-store'
import { map, Observable } from 'rxjs'
import {
  HernoemStandplaatsCommand,
  OmschrijfStandplaatsCommand,
  RegisteerStandplaatsCommand,
  Standplaats,
  StandplaatsAangemaaktEvent,
  StandplaatsEvent,
  WijzigStandplaatsLocatieCommand,
  WisStandplaatsLocatieCommand,
} from './aggregates/standplaats.js'

export { Ploeg, ChatBericht, Standplaats }

export type DBDoc = ChatBerichtEvent | PloegEvent | StandplaatsEvent

type CommandValidationLeft = {
  type: 'validation'
  message: string
}

export type QueryService = {
  queryPloeg(ploegId: string): Promise<E.Either<EventStoreLeft, O.Option<Ploeg>>>
  queryPloegen(): Promise<E.Either<EventStoreLeft, readonly Ploeg[]>>
  queryPloegen$(): Observable<E.Either<EventStoreLeft, readonly Ploeg[]>>

  queryChatBericht(berichtId: string): Promise<E.Either<EventStoreLeft, O.Option<ChatBericht>>>
  queryChatBerichten(): Promise<E.Either<EventStoreLeft, readonly ChatBericht[]>>
  queryChatBerichten$(): Observable<E.Either<EventStoreLeft, readonly ChatBericht[]>>

  queryStandplaats(id: string): Promise<E.Either<EventStoreLeft, O.Option<Standplaats>>>
  queryStandplaatsen(): Promise<E.Either<EventStoreLeft, readonly Standplaats[]>>
  queryStandplaatsen$(): Observable<E.Either<EventStoreLeft, readonly Standplaats[]>>
}

export class PouchDBQueryService implements QueryService {
  #es: ReactiveEventStore<DBDoc>

  constructor(es: ReactiveEventStore<DBDoc>) {
    this.#es = es
  }

  private createAggregateFromEvents<
    AT extends string,
    T extends Aggregate<AT, DBDoc & { aggregateType: AT }, unknown>,
    CE extends DBDoc & { aggregateType: AT; isAggregateCreationEvent: true },
  >(
    events: readonly (DBDoc & {
      aggregateType: AT
      aggregateId: string
    })[],
    createAggregate: (creationEvent: CE) => T,
  ): O.Option<T> {
    const sortByTimestamp = A.sortBy([
      F.pipe(
        N.Ord,
        Ord.contramap((event: BaseEvent) => event.timestamp),
      ),
    ])

    const relevantEvents = F.pipe(
      [...events],
      sortByTimestamp,
      A.dropLeftWhile((event) => !event.isAggregateCreationEvent),
    )

    const creationEvent = O.fromNullable(relevantEvents[0]) as O.Option<CE>

    return F.pipe(
      creationEvent,
      O.map((creationEvent: CE) => createAggregate(creationEvent)),
      O.map((aggregate) => relevantEvents.slice(1).reduce((agg, ev) => agg.apply(ev), aggregate)),
    )
  }

  private async getAggregate<
    AT extends string,
    T extends Aggregate<AT, DBDoc & { aggregateType: AT }, unknown>,
    CE extends DBDoc & { aggregateType: AT; isAggregateCreationEvent: true },
  >(
    aggregateType: AT,
    aggregateId: string,
    createAggregate: (creationEvent: CE) => T,
  ): Promise<E.Either<EventStoreLeft, O.Option<T>>> {
    return F.pipe(
      await this.#es.getEventsForAggregate(aggregateType, aggregateId),
      E.map((events) => this.createAggregateFromEvents<AT, T, CE>(events, createAggregate)),
    )
  }

  private async getAggregates<
    AT extends string,
    T extends Aggregate<AT, DBDoc & { aggregateType: AT }, unknown>,
    CE extends DBDoc & { aggregateType: AT; isAggregateCreationEvent: true },
  >(
    aggregateType: AT,
    createAggregate: (creationEvent: CE) => T,
  ): Promise<E.Either<EventStoreLeft, readonly T[]>> {
    return F.pipe(
      await this.#es.getEventsForAggregates(aggregateType),
      E.map((res) =>
        F.pipe(
          Object.values(groupBy(res, 'aggregateId')),
          A.map((events) => this.createAggregateFromEvents<AT, T, CE>(events, createAggregate)),
          A.compact,
        ),
      ),
    )
  }

  private getAggregates$<
    AT extends string,
    T extends Aggregate<AT, DBDoc & { aggregateType: AT }, unknown>,
    CE extends DBDoc & { aggregateType: AT; isAggregateCreationEvent: true },
  >(
    aggregateType: AT,
    createAggregate: (creationEvent: CE) => T,
  ): Observable<E.Either<EventStoreLeft, readonly T[]>> {
    return this.#es.getEventsForAggregates$(aggregateType).pipe(
      map((either) =>
        F.pipe(
          either,
          E.map((res) =>
            F.pipe(
              Object.values(groupBy(res, 'aggregateId')),
              A.map((events) => this.createAggregateFromEvents<AT, T, CE>(events, createAggregate)),
              A.compact,
            ),
          ),
        ),
      ),
    )
  }

  queryPloeg(ploegId: string): Promise<E.Either<EventStoreLeft, O.Option<Ploeg>>> {
    return this.getAggregate<'ploeg', Ploeg, PloegAangemaaktEvent>('ploeg', ploegId, (ev) =>
      Ploeg.createFromCreationEvent(ev),
    )
  }

  queryPloegen(): Promise<E.Either<EventStoreLeft, readonly Ploeg[]>> {
    return this.getAggregates<'ploeg', Ploeg, PloegAangemaaktEvent>('ploeg', (ev) =>
      Ploeg.createFromCreationEvent(ev),
    )
  }

  queryPloegen$(): Observable<E.Either<EventStoreLeft, readonly Ploeg[]>> {
    return this.getAggregates$<'ploeg', Ploeg, PloegAangemaaktEvent>('ploeg', (ce) =>
      Ploeg.createFromCreationEvent(ce),
    )
  }

  queryChatBericht(berichtId: string): Promise<E.Either<EventStoreLeft, O.Option<ChatBericht>>> {
    return this.getAggregate<'chat-bericht', ChatBericht, ChatBerichtVerstuurdEvent>(
      'chat-bericht',
      berichtId,
      (ev) => ChatBericht.createFromCreationEvent(ev),
    )
  }

  queryChatBerichten(): Promise<E.Either<EventStoreLeft, readonly ChatBericht[]>> {
    return this.getAggregates<'chat-bericht', ChatBericht, ChatBerichtVerstuurdEvent>(
      'chat-bericht',
      (ev) => ChatBericht.createFromCreationEvent(ev),
    )
  }

  queryChatBerichten$(): Observable<E.Either<EventStoreLeft, readonly ChatBericht[]>> {
    return this.getAggregates$<'chat-bericht', ChatBericht, ChatBerichtVerstuurdEvent>(
      'chat-bericht',
      (ce) => ChatBericht.createFromCreationEvent(ce),
    )
  }

  queryStandplaats(id: string): Promise<E.Either<EventStoreLeft, O.Option<Standplaats>>> {
    return this.getAggregate<'standplaats', Standplaats, StandplaatsAangemaaktEvent>(
      'standplaats',
      id,
      (ev) => Standplaats.createFromCreationEvent(ev),
    )
  }

  queryStandplaatsen(): Promise<E.Either<EventStoreLeft, readonly Standplaats[]>> {
    return this.getAggregates<'standplaats', Standplaats, StandplaatsAangemaaktEvent>(
      'standplaats',
      (ev) => Standplaats.createFromCreationEvent(ev),
    )
  }

  queryStandplaatsen$(): Observable<E.Either<EventStoreLeft, readonly Standplaats[]>> {
    return this.getAggregates$<'standplaats', Standplaats, StandplaatsAangemaaktEvent>(
      'standplaats',
      (ce) => Standplaats.createFromCreationEvent(ce),
    )
  }
}

export type CommandService = {
  verstuurChatBericht(
    command: VerstuurChatBerichtCommand,
  ): Promise<E.Either<EventStoreLeft | CommandValidationLeft, null>>

  registreerPloeg(
    command: RegisteerPloegCommand,
  ): Promise<E.Either<EventStoreLeft | CommandValidationLeft, { id: string }>>

  hernoemPloeg(command: HernoemPloegCommand): Promise<E.Either<EventStoreLeft, null>>

  registreerStandplaats(
    command: RegisteerStandplaatsCommand,
  ): Promise<E.Either<EventStoreLeft, null>>

  hernoemStandplaats(command: HernoemStandplaatsCommand): Promise<E.Either<EventStoreLeft, null>>

  omschrijfStandplaats(
    command: OmschrijfStandplaatsCommand,
  ): Promise<E.Either<EventStoreLeft, null>>

  wijzigStandplaatsLocatie(
    command: WijzigStandplaatsLocatieCommand,
  ): Promise<E.Either<EventStoreLeft, null>>

  wisStandplaatsLocatie(
    command: WisStandplaatsLocatieCommand,
  ): Promise<E.Either<EventStoreLeft, null>>
}

export class PouchDBCommandService implements CommandService {
  #es: EventStore<DBDoc>
  #queryService: QueryService

  constructor(es: EventStore<DBDoc>, queryService: QueryService) {
    this.#es = es
    this.#queryService = queryService
  }

  async verstuurChatBericht(
    command: VerstuurChatBerichtCommand,
  ): Promise<E.Either<EventStoreLeft | CommandValidationLeft, null>> {
    if (command.contents.length === 0) {
      return E.left({
        type: 'validation',
        message: 'Chatbericht kan niet leeg zijn',
      })
    } else if (command.contents.length > 500) {
      return E.left({
        type: 'validation',
        message: 'Chatbericht kan niet langer dan 500 karakters zijn',
      })
    }

    const putResult = await this.#es.storeEvent({
      aggregateType: 'chat-bericht',
      aggregateId: command.berichtId,
      contents: command.contents,
      eventId: command.berichtId,
      eventType: 'chat-bericht-verstuurd',
      timestamp: command.timestamp,
      isAggregateCreationEvent: true,
    })

    return F.pipe(
      putResult,
      E.map(() => null),
    )
  }

  async registreerPloeg(
    command: RegisteerPloegCommand,
  ): Promise<E.Either<EventStoreLeft | CommandValidationLeft, { id: string }>> {
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
      eventId: command.eventId,
      timestamp: command.timestamp,
      ploegId: command.ploegId,
      aggregateId: command.ploegId,
      isAggregateCreationEvent: true,
    })

    return F.pipe(
      putResult,
      E.map((e) => ({ id: e.aggregateId })),
    )
  }

  async hernoemPloeg(command: HernoemPloegCommand): Promise<E.Either<EventStoreLeft, null>> {
    const ploeg = await this.#queryService.queryPloeg(command.ploegId)

    if (E.isLeft(ploeg)) {
      return ploeg
    }

    const putResult = await this.#es.storeEvent({
      aggregateType: 'ploeg',
      eventId: command.eventId,
      aggregateId: command.ploegId,
      timestamp: command.timestamp,
      eventType: 'ploeg-hernoemd',
      ploegNaam: command.newName,
      ploegId: command.ploegId,
      isAggregateCreationEvent: false,
    })

    return F.pipe(
      putResult,
      E.map(() => null),
    )
  }

  async registreerStandplaats(
    command: RegisteerStandplaatsCommand,
  ): Promise<E.Either<EventStoreLeft, null>> {
    const standplaats = await this.#queryService.queryPloeg(command.standplaatsId)

    // TODO validation

    if (E.isLeft(standplaats)) {
      return standplaats
    }

    const putResult = await this.#es.storeEvent({
      aggregateType: 'standplaats',
      eventId: command.eventId,
      aggregateId: command.standplaatsId,
      timestamp: command.timestamp,
      eventType: 'standplaats-aangemaakt',
      standplaatsNaam: command.standplaatsNaam,
      isAggregateCreationEvent: true,
    })

    return F.pipe(
      putResult,
      E.map(() => null),
    )
  }

  async hernoemStandplaats(
    command: HernoemStandplaatsCommand,
  ): Promise<E.Either<EventStoreLeft, null>> {
    const standplaats = await this.#queryService.queryPloeg(command.standplaatsId)

    // TODO validation

    if (E.isLeft(standplaats)) {
      return standplaats
    }

    const putResult = await this.#es.storeEvent({
      aggregateType: 'standplaats',
      eventId: command.eventId,
      aggregateId: command.standplaatsId,
      timestamp: command.timestamp,
      eventType: 'standplaats-hernoemd',
      standplaatsNaam: command.standplaatsNaam,
      isAggregateCreationEvent: false,
    })

    return F.pipe(
      putResult,
      E.map(() => null),
    )
  }

  async wijzigStandplaatsLocatie(
    command: WijzigStandplaatsLocatieCommand,
  ): Promise<E.Either<EventStoreLeft, null>> {
    const standplaats = await this.#queryService.queryPloeg(command.standplaatsId)

    // TODO validation

    if (E.isLeft(standplaats)) {
      return standplaats
    }

    const putResult = await this.#es.storeEvent({
      aggregateType: 'standplaats',
      eventId: command.eventId,
      aggregateId: command.standplaatsId,
      timestamp: command.timestamp,
      eventType: 'standplaats-locatie-gewijzigd',
      locatie: {
        lat: command.lat,
        lng: command.lng,
      },
      isAggregateCreationEvent: false,
    })

    return F.pipe(
      putResult,
      E.map(() => null),
    )
  }

  async wisStandplaatsLocatie(
    command: WisStandplaatsLocatieCommand,
  ): Promise<E.Either<EventStoreLeft, null>> {
    const standplaats = await this.#queryService.queryPloeg(command.standplaatsId)

    if (E.isLeft(standplaats)) {
      return standplaats
    }

    const putResult = await this.#es.storeEvent({
      aggregateType: 'standplaats',
      eventId: command.eventId,
      aggregateId: command.standplaatsId,
      timestamp: command.timestamp,
      eventType: 'standplaats-locatie-gewijzigd',
      locatie: undefined,
      isAggregateCreationEvent: false,
    })

    return F.pipe(
      putResult,
      E.map(() => null),
    )
  }

  async omschrijfStandplaats(
    command: OmschrijfStandplaatsCommand,
  ): Promise<E.Either<EventStoreLeft, null>> {
    const standplaats = await this.#queryService.queryPloeg(command.standplaatsId)

    if (E.isLeft(standplaats)) {
      return standplaats
    }

    const putResult = await this.#es.storeEvent({
      aggregateType: 'standplaats',
      eventId: command.eventId,
      aggregateId: command.standplaatsId,
      timestamp: command.timestamp,
      eventType: 'standplaats-omschreven',
      standplaatsOmschrijving: command.standplaatsOmschrijving,
      isAggregateCreationEvent: false,
    })

    return F.pipe(
      putResult,
      E.map(() => null),
    )
  }
}
