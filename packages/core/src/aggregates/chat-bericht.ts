import { nonEmptyArray } from 'fp-ts'

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
}

export type ChatBerichtEvent = ChatBerichtVerstuurdEvent

export class ChatBericht {
  #id: string
  #timestamp: number
  #contents: string

  private constructor(id: string, contents: string, timestamp: number) {
    this.#id = id
    this.#timestamp = timestamp
    this.#contents = contents
  }

  get id() {
    return this.#id
  }

  get timestamp() {
    return this.#timestamp
  }

  get contents() {
    return this.#contents
  }

  static createFromEvents(events: nonEmptyArray.NonEmptyArray<ChatBerichtEvent>): ChatBericht {
    const instance = new ChatBericht(events[0].aggregateId, events[0].contents, events[0].timestamp)

    return events.slice(1).reduce((i, ev) => i.apply(ev), instance)
  }

  apply(event: ChatBerichtEvent): ChatBericht {
    if (event.aggregateType !== 'chat-bericht' || event.aggregateId !== this.#id) {
      return this
    }

    // No other events defined for this aggregate

    return this
  }
}
