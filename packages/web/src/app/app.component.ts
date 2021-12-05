import { Component, Inject } from '@angular/core'
import { CommandService, QueryService } from '@toye.io/field-journal-core'
import { COMMAND_SERVICE_TOKEN, QUERY_SERVICE_TOKEN } from './services/tokens'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    @Inject(QUERY_SERVICE_TOKEN) public queryService: QueryService,
    @Inject(COMMAND_SERVICE_TOKEN) public commandService: CommandService,
  ) {}

  async getChats() {
    console.log('Getting chats...')
    const berichten = await this.queryService.queryChatBerichten()

    console.log(berichten)
  }

  async addChat() {
    console.log(
      await this.commandService.verstuurChatBericht({
        berichtId: Date.now().toString(),
        commandName: 'verstuur-chat-bericht',
        contents: 'Hallo!',
        timestamp: Date.now(),
      }),
    )
  }
}
