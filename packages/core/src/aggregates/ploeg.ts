import { nonEmptyArray } from 'fp-ts'

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

export type PloegAangemaaktEvent = {
  eventId: string
  aggregateType: 'ploeg'
  eventType: 'ploeg-aangemaakt'
  aggregateId: string
  ploegId: string // -> aggregateId
  timestamp: number
  ploegNaam: string
}

export type PloegHernoemdEvent = {
  eventId: string
  aggregateType: 'ploeg'
  aggregateId: string
  eventType: 'ploeg-hernoemd'
  ploegId: string // -> aggregateId
  timestamp: number
  ploegNaam: string
}

export type PloegEvent = PloegAangemaaktEvent | PloegHernoemdEvent

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
    if (event.aggregateType !== 'ploeg' || event.ploegId !== this.#id) {
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
