import { Aggregate } from '@toye.io/field-journal-event-store'

export type RegisteerStandplaatsCommand = {
  commandName: 'registreer-standplaats'
  timestamp: number

  standplaatsId: string
  standplaatsNaam: string
  standplaatsOmschrijving: string
  eventId: string
}

export type HernoemStandplaatsCommand = {
  commandName: 'hernoem-standplaats'
  timestamp: number

  standplaatsId: string
  standplaatsNaam: string
  eventId: string
}

export type WijzigStandplaatsLocatieCommand = {
  commandName: 'wijzig-standplaats-locatie'
  timestamp: number

  standplaatsId: string
  lat: number
  lng: number
  eventId: string
}

export type WisStandplaatsLocatieCommand = {
  commandName: 'wis-standplaats-locatie'
  timestamp: number

  standplaatsId: string
  eventId: string
}

export type StandplaatsAangemaaktEvent = {
  eventId: string
  aggregateType: 'standplaats'
  eventType: 'standplaats-aangemaakt'
  aggregateId: string
  timestamp: number
  standplaatsNaam: string
  standplaatsOmschrijving: string
  isAggregateCreationEvent: true
}

export type StandplaatsHernoemdEvent = {
  eventId: string
  aggregateType: 'standplaats'
  aggregateId: string
  eventType: 'standplaats-hernoemd'
  timestamp: number
  standplaatsNaam: string
  isAggregateCreationEvent: false
}

export type StandplaatsLocatieGewijzigdEvent = {
  eventId: string
  aggregateType: 'standplaats'
  aggregateId: string
  eventType: 'standplaats-locatie-gewijzigd'
  timestamp: number
  locatie?: {
    lat: number
    lng: number
  }
  isAggregateCreationEvent: false
}

export type StandplaatsEvent =
  | StandplaatsAangemaaktEvent
  | StandplaatsHernoemdEvent
  | StandplaatsLocatieGewijzigdEvent

export class Standplaats extends Aggregate<
  'standplaats',
  StandplaatsAangemaaktEvent,
  { naam: string; omschrijving: string; locatie?: { lat: number; lng: number } }
> {
  get naam() {
    return this.data.naam
  }

  protected applyImpl(event: StandplaatsEvent) {
    switch (event.eventType) {
      case 'standplaats-hernoemd':
        this.data.naam = event.standplaatsNaam
        return this
      case 'standplaats-locatie-gewijzigd':
        this.data.locatie = event.locatie
        return this
    }
  }

  static createFromCreationEvent(event: StandplaatsAangemaaktEvent): Standplaats {
    return new Standplaats('standplaats', event.aggregateId, {
      naam: event.standplaatsNaam,
      omschrijving: event.standplaatsOmschrijving,
    })
  }
}
