import { Component, Inject, Input } from '@angular/core'
import { CommandService, Ploeg } from '@toye.io/field-journal-core'
import { COMMAND_SERVICE_TOKEN } from 'src/app/services/tokens'

@Component({
  selector: 'app-ploegen-card',
  templateUrl: './ploegen-card.component.html',
  styleUrls: ['./ploegen-card.component.scss'],
})
export class PloegenCardComponent {
  @Input() ploeg: Ploeg | null = null

  constructor(@Inject(COMMAND_SERVICE_TOKEN) public commandService: CommandService) {}

  async hernoemPloeg(aggregateId: string, naam: string) {
    this.commandService.hernoemPloeg({
      commandName: 'hernoem-ploeg',
      eventId: Date.now().toString(),
      ploegId: aggregateId,
      newName: naam,
      timestamp: Date.now(),
    })
  }

  async omschrijfPloeg(aggregateId: string, omschrijving: string) {
    this.commandService.omschrijfPloeg({
      commandName: 'omschrijf-ploeg',
      eventId: Date.now().toString(),
      ploegId: aggregateId,
      ploegOmschrijving: omschrijving,
      timestamp: Date.now(),
    })
  }
}
