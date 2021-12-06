import { InjectionToken } from '@angular/core'
import { BaseEvent, ReactiveEventStore } from '@toye.io/field-journal-event-store'
import { CommandService, QueryService } from '@toye.io/field-journal-core'

export const POUCHDB_TOKEN = new InjectionToken<PouchDB.Database>('pouchdb-database')
export const REACTIVE_EVENTSTORE_TOKEN = new InjectionToken<ReactiveEventStore<BaseEvent>>(
  'event-store',
)
export const COMMAND_SERVICE_TOKEN = new InjectionToken<CommandService>('command-service')
export const QUERY_SERVICE_TOKEN = new InjectionToken<QueryService>('query-service')
