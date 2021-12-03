import { either as E, function as F, nonEmptyArray } from 'fp-ts'
import groupBy from 'lodash.groupby'

export type Communicatie = {}

// Fiche / incident
export type Case = {}

export type ChatMessage = {
  contents: string
}

export type RegisteerPloegCommand = {
  commandName: 'registreer-ploeg'
  timestamp: number

  ploegId: string
  ploegNaam: string
}

export type HernoemPloegCommand = {
  commandName: 'hernoem-ploeg'
  timestamp: number

  ploegId: string
  newName: string
}

export class Ploeg {
  #id: string
  #ploegNaam: string

  private constructor(id: string, ploegNaam: string) {
    this.#id = id
    this.#ploegNaam = ploegNaam
  }

  get ploegId(): string {
    return this.#id
  }

  get ploegNaam(): string {
    return this.#ploegNaam
  }

  static createFromEvents(events: nonEmptyArray.NonEmptyArray<PloegEvent>): Ploeg {
    const instance = new Ploeg(events[0].ploegId, events[0].ploegNaam)

    return events.slice(1).reduce((i, ev) => i.apply(ev), instance)
  }

  apply(event: PloegEvent): Ploeg {
    if (event.aggregateName !== 'ploeg' || event.ploegId !== this.#id) {
      return this
    }

    switch (event.eventType) {
      case 'ploeg-hernoemd':
        return new Ploeg(this.#id, event.ploegNaam)
    }

    return this
  }

  serialize() {
    return {
      ploegNaam: this.#ploegNaam,
      aggregateName: 'ploeg',
      id: this.ploegId,
    }
  }

  toString() {
    return `Ploeg ${JSON.stringify(this.serialize())}`
  }
}

type PloegAangemaaktEvent = {
  aggregateName: 'ploeg'
  eventType: 'ploeg-aangemaakt'
  ploegId: string
  timestamp: number
  ploegNaam: string
}

type PloegHernoemdEvent = {
  aggregateName: 'ploeg'
  eventType: 'ploeg-hernoemd'
  ploegId: string
  timestamp: number
  ploegNaam: string
}

type ChatBerichtVerstuurdDoc = {
  aggregateName: 'chat-bericht'
  eventType: 'chat-bericht-verstuurd'
  contents: string
}

type PloegEvent = PloegAangemaaktEvent | PloegHernoemdEvent

type DBDoc = ChatBerichtVerstuurdDoc | PloegEvent

type IdGenerator = {
  nextId: () => string
}

export class Service {
  #pouch: PouchDB.Database<DBDoc>
  #idGenerator: IdGenerator

  constructor(pouch: PouchDB.Database<DBDoc>, idGenerator: IdGenerator) {
    this.#pouch = pouch
    this.#idGenerator = idGenerator
  }

  async registreerPloeg(command: RegisteerPloegCommand): Promise<E.Either<string, { id: string }>> {
    if (command.ploegId.match(/^[a-z\-0-9]+$/) == null) {
      return E.left('ploegId mag enkel kleine letters, nummers, en "-" bevatten')
    }

    if (!command.ploegId.startsWith('ploeg-')) {
      return E.left(`ploegId moet starten met 'ploeg-'`)
    }

    try {
      const putResult = await this.#pouch.put({
        aggregateName: 'ploeg',
        eventType: 'ploeg-aangemaakt',
        ploegNaam: command.ploegNaam,
        _id: this.#idGenerator.nextId(),
        timestamp: command.timestamp,
        ploegId: command.ploegId,
      })

      if (putResult.ok) {
        return E.right({ id: putResult.id })
      } else {
        return E.left('Unsuccessful: PouchDB return ok=false')
      }
    } catch (err) {
      if (err instanceof Error) {
        return E.left(err.message)
      }

      return E.left('' + err)
    }
  }

  async hernoemPloeg(command: HernoemPloegCommand): Promise<E.Either<string, { success: true }>> {
    const ploeg = await this.queryPloeg(command.ploegId)

    if (E.isLeft(ploeg)) {
      return ploeg
    }

    try {
      const putResult = await this.#pouch.put({
        aggregateName: 'ploeg',
        _id: this.#idGenerator.nextId(),
        timestamp: command.timestamp,
        eventType: 'ploeg-hernoemd',
        ploegNaam: command.newName,
        ploegId: command.ploegId,
      })

      if (putResult.ok) {
        return E.right({ success: true })
      } else {
        return E.left('Unsuccessful: PouchDB returned ok=false')
      }
    } catch (err) {
      return E.left('' + err)
    }
  }

  async queryPloeg(ploegId: string): Promise<E.Either<string, Ploeg>> {
    return F.pipe(
      await this.queryPloegen(),
      E.chain((list: readonly Ploeg[]) =>
        E.fromNullable<string>(`Ploeg met id "${ploegId}" niet gevonden`)(
          list.find((el) => `${ploegId}` === el.ploegId),
        ),
      ),
    )
  }

  async queryPloegen(): Promise<E.Either<string, readonly Ploeg[]>> {
    try {
      const list = await this.#pouch.find({
        selector: {
          aggregateName: 'ploeg',
        },
      })

      if (list.warning != null) {
        return E.left('Warning when getting list: ' + list.warning)
      }

      const docs = list.docs as PouchDB.Core.ExistingDocument<PloegEvent>[]

      const grouped = Object.values(groupBy(docs, 'ploegId'))

      return E.right(grouped.map((events) => Ploeg.createFromEvents(events)))
    } catch (err) {
      if (err instanceof Error) {
        return E.left(err.message)
      }

      return E.left('' + err)
    }
  }
}
