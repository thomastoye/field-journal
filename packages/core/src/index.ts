import { either as E, function as F, nonEmptyArray, option as O } from 'fp-ts'
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
  PloegEvent,
  RegisteerPloegCommand,
} from './aggregates/ploeg.js'
import { EventStore, EventStoreLeft, ReactiveEventStore } from '@toye.io/field-journal-event-store'
import { map, Observable } from 'rxjs'

export { Ploeg, ChatBericht }

export type DBDoc = ChatBerichtEvent | PloegEvent

type CommandValidationLeft = {
  type: 'validation'
  message: string
}

export class QueryService {
  #es: ReactiveEventStore<DBDoc>

  constructor(es: ReactiveEventStore<DBDoc>) {
    this.#es = es
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

  queryPloegen$(): Observable<E.Either<EventStoreLeft, readonly Ploeg[]>> {
    return this.#es.getEventsForAggregates$('ploeg').pipe(
      map((either) => {
        return F.pipe(
          either,
          E.map((res) => Object.values(groupBy(res, 'aggregateId'))),
          E.map((grouped) => grouped.map((events) => Ploeg.createFromEvents(events))),
        )
      }),
    )
  }

  async queryChatBericht(
    berichtId: string,
  ): Promise<E.Either<EventStoreLeft, O.Option<ChatBericht>>> {
    return F.pipe(
      await this.#es.getEventsForAggregate('chat-bericht', berichtId),
      E.map((events) => {
        if (events.length === 0) {
          return O.none
        } else {
          return O.some(
            ChatBericht.createFromEvents(
              events as nonEmptyArray.NonEmptyArray<ChatBerichtVerstuurdEvent>,
            ),
          )
        }
      }),
    )
  }

  async queryChatBerichten(): Promise<E.Either<EventStoreLeft, readonly ChatBericht[]>> {
    return F.pipe(
      await this.#es.getEventsForAggregates('chat-bericht'),
      E.map((res) => Object.values(groupBy(res, 'aggregateId'))),
      E.map((grouped) => grouped.map((events) => ChatBericht.createFromEvents(events))),
    )
  }

  queryChatBerichten$(): Observable<E.Either<EventStoreLeft, readonly ChatBericht[]>> {
    return this.#es.getEventsForAggregates$('chat-bericht').pipe(
      map((either) => {
        return F.pipe(
          either,
          E.map((res) => Object.values(groupBy(res, 'aggregateId'))),
          E.map((grouped) => grouped.map((events) => ChatBericht.createFromEvents(events))),
        )
      }),
    )
  }
}

export class CommandService {
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
    })

    return F.pipe(
      putResult,
      E.map(() => null),
    )
  }
}
