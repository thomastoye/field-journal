import { Component, Inject, Input } from '@angular/core'
import { CommandService, Ploeg } from '@toye.io/field-journal-core'
import { COMMAND_SERVICE_TOKEN } from '../services/tokens'

@Component({
  selector: 'app-ploeg-card',
  templateUrl: './ploeg-card.component.html',
  styleUrls: ['./ploeg-card.component.scss'],
})
export class PloegCardComponent {
  @Input() ploeg: Ploeg | null = null

  constructor(@Inject(COMMAND_SERVICE_TOKEN) public commandService: CommandService) {}

  async hernoemPloeg(ploegId: string, naam: string) {
    const result = this.commandService.hernoemPloeg({
      commandName: 'hernoem-ploeg',
      eventId: Date.now().toString(),
      newName: naam,
      ploegId,
      timestamp: Date.now(),
    })

    console.log(result)
  }
}
