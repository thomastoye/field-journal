export type BaseEvent = {
  eventId: string
  aggregateType: string
  aggregateId: string
  eventType: string
  timestamp: number
}
