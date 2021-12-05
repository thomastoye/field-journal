import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { CommandService, DBDoc, QueryService } from '@toye.io/field-journal-core'
import { EventStore, PouchDBEventStore } from '@toye.io/field-journal-eventstore'
import { AppComponent } from './app.component'
import {
  COMMAND_SERVICE_TOKEN,
  EVENTSTORE_TOKEN,
  POUCHDB_TOKEN,
  QUERY_SERVICE_TOKEN,
} from './services/tokens'
import PouchDB from 'pouchdb'
import PouchDBFindPlugin from 'pouchdb-find'

PouchDB.plugin(PouchDBFindPlugin)

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        {
          provide: POUCHDB_TOKEN,
          useFactory: () => {
            // TODO implement DB switching (probably will require refactor to service that returns Observable<PouchDB>)
            const db = new PouchDB('test')
            return db
          },
        },
        {
          provide: EVENTSTORE_TOKEN,
          useFactory: (pouch: PouchDB.Database<DBDoc>) =>
            new PouchDBEventStore(pouch, { warningsAsErrors: false }),
          deps: [POUCHDB_TOKEN],
        },
        {
          provide: QUERY_SERVICE_TOKEN,
          useFactory: (es: EventStore<DBDoc>) => new QueryService(es),
          deps: [EVENTSTORE_TOKEN],
        },
        {
          provide: COMMAND_SERVICE_TOKEN,
          useFactory: (es: EventStore<DBDoc>, queryService: QueryService) =>
            new CommandService(es, queryService),
          deps: [EVENTSTORE_TOKEN, QUERY_SERVICE_TOKEN],
        },
      ],
    }).compileComponents()
  })

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.componentInstance
    expect(app).toBeTruthy()
  })

  it(`should have as title 'field-journal-web'`, () => {
    const fixture = TestBed.createComponent(AppComponent)
    const app = fixture.componentInstance
    expect(app.commandService).not.toBeNull()
    expect(app.queryService).not.toBeNull()
  })

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent)
    fixture.detectChanges()
    const compiled = fixture.nativeElement as HTMLElement
    expect(compiled.querySelector('button')?.textContent).toContain('GET CHATS')
  })
})
