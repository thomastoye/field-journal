import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  COMMAND_SERVICE_TOKEN,
  POUCHDB_TOKEN,
  QUERY_SERVICE_TOKEN,
  REACTIVE_EVENTSTORE_TOKEN,
} from '../services/tokens'
import { PouchDBEventStore, ReactiveEventStore } from '@toye.io/field-journal-event-store'
import {
  CommandService,
  DBDoc,
  PouchDBCommandService,
  PouchDBQueryService,
  QueryService,
} from '@toye.io/field-journal-core'
import PouchDB from 'pouchdb'

import PouchDBFindPlugin from 'pouchdb-find'
// import PouchDBMemoryAdapter from 'pouchdb-adapter-memory'

PouchDB.plugin(PouchDBFindPlugin)
// PouchDB.plugin(PouchDBMemoryAdapter)

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    {
      provide: POUCHDB_TOKEN,
      useFactory: () => {
        // TODO implement DB switching (probably will require refactor to service that returns Observable<PouchDB>)
        const db = new PouchDB(`ng-testing-${Date.now()}-${Math.random()}`)

        return db
      },
    },
    {
      provide: REACTIVE_EVENTSTORE_TOKEN,
      useFactory: (pouch: PouchDB.Database<DBDoc>) =>
        new PouchDBEventStore(pouch, { warningsAsErrors: false }),
      deps: [POUCHDB_TOKEN],
    },
    {
      provide: QUERY_SERVICE_TOKEN,
      useFactory: (es: ReactiveEventStore<DBDoc>) => new PouchDBQueryService(es),
      deps: [REACTIVE_EVENTSTORE_TOKEN],
    },
    {
      provide: COMMAND_SERVICE_TOKEN,
      useFactory: (es: ReactiveEventStore<DBDoc>, queryService: QueryService) =>
        new PouchDBCommandService(es, queryService),
      deps: [REACTIVE_EVENTSTORE_TOKEN, QUERY_SERVICE_TOKEN],
    },
  ],
})
export class TestingModule {}
