import { BaseEvent } from './base-event'

export abstract class Aggregate<AT, EV extends BaseEvent & { aggregateType: AT }, D> {
  #data: D
  #aggregateId: string
  #aggregateType: AT
  // #lastUpdated: Date

  protected constructor(aggregateType: AT, aggregateId: string, data: D) {
    this.#aggregateType = aggregateType
    this.#aggregateId = aggregateId
    this.#data = data
  }

  get aggregateId(): string {
    return this.#aggregateId
  }

  get aggregateType(): AT {
    return this.#aggregateType
  }

  protected get data(): D {
    return this.#data
  }

  apply(event: EV): this {
    if (event.aggregateType !== this.#aggregateType || event.aggregateId !== this.#aggregateId) {
      return this
    } else {
      return this.applyImpl(event) || this
    }
  }

  toString(): string {
    return `Aggregate {type=${this.#aggregateType} id=${this.#aggregateId}} data=${JSON.stringify(
      this.#data,
    )}`
  }

  protected abstract applyImpl(event: EV): this | void
}
