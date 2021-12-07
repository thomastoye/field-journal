import { Component, Inject, Input, OnInit } from '@angular/core'
import { CommandService, Ploeg } from '@toye.io/field-journal-core'
import { COMMAND_SERVICE_TOKEN } from '../services/tokens'

@Component({
  selector: 'app-ploegen',
  templateUrl: './ploegen.component.html',
  styleUrls: ['./ploegen.component.scss'],
})
export class PloegenComponent implements OnInit {
  @Input() ploegen: readonly Ploeg[] | null = null

  constructor(@Inject(COMMAND_SERVICE_TOKEN) public commandService: CommandService) {}

  ngOnInit(): void {
    //...
  }

  async nieuwePloeg() {
    console.log(
      await this.commandService.registreerPloeg({
        commandName: 'registreer-ploeg',
        eventId: Date.now().toString(),
        ploegId: 'ploeg-snthaoeu',
        ploegNaam: 'Mijn Nieuwe Ploeg',
        timestamp: Date.now(),
      }),
    )
  }
}
