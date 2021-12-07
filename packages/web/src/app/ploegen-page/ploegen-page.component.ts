import { Component, Inject, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { either as E } from 'fp-ts'
import { EventStoreLeft } from '@toye.io/field-journal-event-store'
import { Ploeg, QueryService } from '@toye.io/field-journal-core'
import { QUERY_SERVICE_TOKEN } from '../services/tokens'

@Component({
  selector: 'app-ploegen-page',
  templateUrl: './ploegen-page.component.html',
  styleUrls: ['./ploegen-page.component.scss'],
})
export class PloegenPageComponent implements OnInit {
  ploegen$: Observable<E.Either<EventStoreLeft, readonly Ploeg[]>> | null = null

  constructor(@Inject(QUERY_SERVICE_TOKEN) public queryService: QueryService) {}

  ngOnInit(): void {
    this.ploegen$ = this.queryService.queryPloegen$()
  }
}
