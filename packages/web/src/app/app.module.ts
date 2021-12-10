import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  COMMAND_SERVICE_TOKEN,
  REACTIVE_EVENTSTORE_TOKEN,
  POUCHDB_TOKEN,
  QUERY_SERVICE_TOKEN,
} from './services/tokens'
import {
  DBDoc,
  PouchDBCommandService,
  PouchDBQueryService,
  QueryService,
} from '@toye.io/field-journal-core'
import { PouchDBEventStore, ReactiveEventStore } from '@toye.io/field-journal-event-store'
import PouchDB from 'pouchdb'
import PouchDBFindPlugin from 'pouchdb-find'
import { NgxFpTsModule } from 'ngx-fp-ts'
import { PloegenComponent } from './ploegen/ploegen.component'
import { PloegenPageComponent } from './ploegen-page/ploegen-page.component'
import { BerichtenPageComponent } from './berichten-page/berichten-page.component'
import { PloegCardComponent } from './ploeg-card/ploeg-card.component'
import { EditInPlaceComponent } from './edit-in-place/edit-in-place.component'
import { FormsModule } from '@angular/forms'
import { A11yModule } from '@angular/cdk/a11y'
import { PloegCardNewComponent } from './ploeg-card-new/ploeg-card-new.component'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'

@NgModule({
  declarations: [
    AppComponent,
    PloegenComponent,
    PloegenPageComponent,
    BerichtenPageComponent,
    PloegCardComponent,
    EditInPlaceComponent,
    PloegCardNewComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    A11yModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
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
      useFactory: (es: ReactiveEventStore<DBDoc>) => new PouchDBQueryService(es),
      deps: [REACTIVE_EVENTSTORE_TOKEN],
    },
    {
      provide: COMMAND_SERVICE_TOKEN,
      useFactory: (es: ReactiveEventStore<DBDoc>, queryService: QueryService) =>
        new PouchDBCommandService(es, queryService),
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
