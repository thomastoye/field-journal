import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { MatButtonModule } from '@angular/material/button'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  COMMAND_SERVICE_TOKEN,
  REACTIVE_EVENTSTORE_TOKEN,
  POUCHDB_TOKEN,
  QUERY_SERVICE_TOKEN,
} from './services/tokens'
import { CommandService, DBDoc, QueryService } from '@toye.io/field-journal-core'
import { PouchDBEventStore, ReactiveEventStore } from '@toye.io/field-journal-event-store'
import PouchDB from 'pouchdb-browser'
import PouchDBFindPlugin from 'pouchdb-find'
import { NgxFpTsModule } from 'ngx-fp-ts'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    NgxFpTsModule,
  ],
  providers: [
    {
      provide: POUCHDB_TOKEN,
      useFactory: () => {
        // TODO implement DB switching (probably will require refactor to service that returns Observable<PouchDB>)
        const db = new PouchDB('test')
        PouchDB.plugin(PouchDBFindPlugin)

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
      useFactory: (es: ReactiveEventStore<DBDoc>) => new QueryService(es),
      deps: [REACTIVE_EVENTSTORE_TOKEN],
    },
    {
      provide: COMMAND_SERVICE_TOKEN,
      useFactory: (es: ReactiveEventStore<DBDoc>, queryService: QueryService) =>
        new CommandService(es, queryService),
      deps: [REACTIVE_EVENTSTORE_TOKEN, QUERY_SERVICE_TOKEN],
    },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: () => {
    //     // TODO initialize PouchDB indexes here
    //   },
    //   multi: true
    // }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
