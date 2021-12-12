import { Aggregate } from '@toye.io/field-journal-event-store'

export type VerstuurChatBerichtCommand = {
  commandName: 'verstuur-chat-bericht'
  timestamp: number

  berichtId: string
  contents: string
}

export type ChatBerichtVerstuurdEvent = {
  eventId: string
  aggregateType: 'chat-bericht'
  aggregateId: string
  eventType: 'chat-bericht-verstuurd'
  timestamp: number
  contents: string
  isAggregateCreationEvent: true
}

export type ChatBerichtEvent = ChatBerichtVerstuurdEvent

export class ChatBericht extends Aggregate<
  'chat-bericht',
  ChatBerichtEvent,
  { contents: string; timestamp: number }
> {
  get timestamp() {
    return this.data.timestamp
  }

  get contents() {
    return this.data.contents
  }

  protected applyImpl(event: ChatBerichtEvent) {
    if (event.eventType === 'chat-bericht-verstuurd') {
      // TODO
      return this
    }
  }

  static createFromCreationEvent(event: ChatBerichtVerstuurdEvent): ChatBericht {
    return new ChatBericht('chat-bericht', event.aggregateId, {
      contents: event.contents,
      timestamp: event.timestamp,
    })
  }
}
