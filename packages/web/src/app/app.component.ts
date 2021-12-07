import { Component, Inject, OnInit } from '@angular/core'
import { CommandService, QueryService } from '@toye.io/field-journal-core'
import { ChatBericht } from '@toye.io/field-journal-core'
import { Observable } from 'rxjs'
import { COMMAND_SERVICE_TOKEN, QUERY_SERVICE_TOKEN } from './services/tokens'
import { either as E } from 'fp-ts'
import { EventStoreLeft } from '@toye.io/field-journal-event-store'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  chats$: Observable<E.Either<EventStoreLeft, readonly ChatBericht[]>> | null = null

  constructor(
    @Inject(QUERY_SERVICE_TOKEN) public queryService: QueryService,
    @Inject(COMMAND_SERVICE_TOKEN) public commandService: CommandService,
  ) {}

  ngOnInit() {
    this.chats$ = this.queryService.queryChatBerichten$()
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
