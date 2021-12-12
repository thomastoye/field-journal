import { Aggregate } from '@toye.io/field-journal-event-store'

export type RegisteerPloegCommand = {
  commandName: 'registreer-ploeg'
  timestamp: number

  ploegId: string
  ploegNaam: string
  eventId: string
}

export type HernoemPloegCommand = {
  commandName: 'hernoem-ploeg'
  timestamp: number

  ploegId: string
  newName: string
  eventId: string
}

export type PloegAangemaaktEvent = {
  eventId: string
  aggregateType: 'ploeg'
  eventType: 'ploeg-aangemaakt'
  aggregateId: string
  timestamp: number
  ploegNaam: string
  isAggregateCreationEvent: true
}

export type PloegHernoemdEvent = {
  eventId: string
  aggregateType: 'ploeg'
  aggregateId: string
  eventType: 'ploeg-hernoemd'
  timestamp: number
  ploegNaam: string
  isAggregateCreationEvent: false
}

export type PloegEvent = PloegAangemaaktEvent | PloegHernoemdEvent

export class Ploeg extends Aggregate<'ploeg', PloegAangemaaktEvent, { ploegNaam: string }> {
  get ploegNaam() {
    return this.data.ploegNaam
  }

  protected applyImpl(event: PloegEvent) {
    switch (event.eventType) {
      case 'ploeg-hernoemd':
        this.data.ploegNaam = event.ploegNaam
        return this
    }
  }

  static createFromCreationEvent(event: PloegAangemaaktEvent): Ploeg {
    return new Ploeg('ploeg', event.aggregateId, {
      ploegNaam: event.ploegNaam,
    })
  }
}
