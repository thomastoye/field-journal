export type EventStoreLeft =
  | {
      type: 'pouchdb-warning'
      warning: string
      message: string
    }
  | {
      type: 'pouchdb-error'
      message: string
      error?: unknown
    }
  | {
      type: 'pouchdb-unsuccesful'
      message: string
      details: unknown
    }
