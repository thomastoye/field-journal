import { Component, Inject, OnInit } from '@angular/core'
import { CommandService, Ploeg, QueryService } from '@toye.io/field-journal-core'
import { EventStoreLeft } from '@toye.io/field-journal-event-store'
import { Observable } from 'rxjs'
import { QUERY_SERVICE_TOKEN, COMMAND_SERVICE_TOKEN } from 'src/app/services/tokens'
import { either as E } from 'fp-ts'

@Component({
  selector: 'app-ploegen-settings',
  templateUrl: './ploegen-settings.component.html',
  styleUrls: ['./ploegen-settings.component.scss'],
})
export class PloegenSettingsComponent implements OnInit {
  ploegen$: Observable<E.Either<EventStoreLeft, readonly Ploeg[]>> | null = null

  constructor(
    @Inject(QUERY_SERVICE_TOKEN) public queryService: QueryService,
    @Inject(COMMAND_SERVICE_TOKEN) public commandService: CommandService,
  ) {}

  ngOnInit(): void {
    this.ploegen$ = this.queryService.queryPloegen$()
  }

  async nieuwePloeg() {
    console.log(
      await this.commandService.registreerPloeg({
        commandName: 'registreer-ploeg',
        eventId: Date.now().toString(),
        ploegId: 'ploeg-' + Math.round(Math.random() * 100000),
        ploegNaam: 'India 10',
        timestamp: Date.now(),
      }),
    )
  }
}
