import { COMMAND_SERVICE_TOKEN, QUERY_SERVICE_TOKEN } from '../services/tokens'
import { Component, Inject, OnInit } from '@angular/core'
import { CommandService, QueryService } from '@toye.io/field-journal-core'
import { ChatBericht } from '@toye.io/field-journal-core'
import { Observable } from 'rxjs'
import { either as E } from 'fp-ts'
import { EventStoreLeft } from '@toye.io/field-journal-event-store'

@Component({
  selector: 'app-berichten-page',
  templateUrl: './berichten-page.component.html',
  styleUrls: ['./berichten-page.component.scss'],
})
export class BerichtenPageComponent implements OnInit {
  chats$: Observable<E.Either<EventStoreLeft, readonly ChatBericht[]>> | null = null

  constructor(
    @Inject(QUERY_SERVICE_TOKEN) public queryService: QueryService,

    @Inject(COMMAND_SERVICE_TOKEN) public commandService: CommandService,
  ) {}

  ngOnInit(): void {
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
