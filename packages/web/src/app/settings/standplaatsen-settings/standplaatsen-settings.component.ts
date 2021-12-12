import { Component, Inject, OnInit } from '@angular/core'
import { CommandService, QueryService, Standplaats } from '@toye.io/field-journal-core'
import { EventStoreLeft } from '@toye.io/field-journal-event-store'
import { Observable } from 'rxjs'
import { QUERY_SERVICE_TOKEN, COMMAND_SERVICE_TOKEN } from 'src/app/services/tokens'
import { either as E } from 'fp-ts'

@Component({
  selector: 'app-standplaatsen-settings',
  templateUrl: './standplaatsen-settings.component.html',
  styleUrls: ['./standplaatsen-settings.component.scss'],
})
export class StandplaatsenSettingsComponent implements OnInit {
  standplaatsen$: Observable<E.Either<EventStoreLeft, readonly Standplaats[]>> | null = null

  constructor(
    @Inject(QUERY_SERVICE_TOKEN) public queryService: QueryService,
    @Inject(COMMAND_SERVICE_TOKEN) public commandService: CommandService,
  ) {}

  ngOnInit(): void {
    this.standplaatsen$ = this.queryService.queryStandplaatsen$()
  }

  async nieuweStandplaats() {
    console.log(
      await this.commandService.registreerStandplaats({
        commandName: 'registreer-standplaats',
        eventId: Date.now().toString(),
        standplaatsId: 'standplaats-' + Math.round(Math.random() * 100000),
        standplaatsNaam: 'Hulppost 1',
        timestamp: Date.now(),
      }),
    )
  }
}
