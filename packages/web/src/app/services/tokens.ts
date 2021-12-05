import { InjectionToken } from '@angular/core'
import { BaseEvent, EventStore } from '@toye.io/field-journal-event-store'
import { CommandService, QueryService } from '@toye.io/field-journal-core'
import PouchDB from 'pouchdb-browser'

export const POUCHDB_TOKEN = new InjectionToken<PouchDB.Database>('pouchdb-database')
export const EVENTSTORE_TOKEN = new InjectionToken<EventStore<BaseEvent>>('event-store')
export const COMMAND_SERVICE_TOKEN = new InjectionToken<CommandService>('command-service')
export const QUERY_SERVICE_TOKEN = new InjectionToken<QueryService>('query-service')
