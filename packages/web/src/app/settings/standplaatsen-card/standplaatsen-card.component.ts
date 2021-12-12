import { Component, Inject, Input } from '@angular/core'
import { CommandService, Standplaats } from '@toye.io/field-journal-core'
import { COMMAND_SERVICE_TOKEN } from 'src/app/services/tokens'

@Component({
  selector: 'app-standplaatsen-card',
  templateUrl: './standplaatsen-card.component.html',
  styleUrls: ['./standplaatsen-card.component.scss'],
})
export class StandplaatsenCardComponent {
  @Input() standplaats: Standplaats | null = null

  constructor(@Inject(COMMAND_SERVICE_TOKEN) public commandService: CommandService) {}

  async hernoemStandplaats(aggregateId: string, naam: string) {
    this.commandService.hernoemStandplaats({
      commandName: 'hernoem-standplaats',
      eventId: Date.now().toString(),
      standplaatsId: aggregateId,
      standplaatsNaam: naam,
      timestamp: Date.now(),
    })
  }

  async omschrijfStandplaats(aggregateId: string, omschrijving: string) {
    this.commandService.omschrijfStandplaats({
      commandName: 'omschrijf-standplaats',
      eventId: Date.now().toString(),
      standplaatsId: aggregateId,
      standplaatsOmschrijving: omschrijving,
      timestamp: Date.now(),
    })
  }
}
