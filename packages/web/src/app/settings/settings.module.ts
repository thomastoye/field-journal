import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SettingsComponent } from './settings/settings.component'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { StandplaatsenSettingsComponent } from './standplaatsen-settings/standplaatsen-settings.component'
import { RouterModule, Routes } from '@angular/router'
import { NgxFpTsModule } from 'ngx-fp-ts'
import { StandplaatsenCardComponent } from './standplaatsen-card/standplaatsen-card.component'
import { EditInPlaceModule } from '../edit-in-place/edit-in-place.module'
import { PloegenCardComponent } from './ploegen-card/ploegen-card.component'
import { PloegenSettingsComponent } from './ploegen-settings/ploegen-settings.component'

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: 'standplaatsen',
        component: StandplaatsenSettingsComponent,
      },
      {
        path: 'ploegen',
        component: PloegenSettingsComponent,
      },
    ],
  },
]

@NgModule({
  declarations: [
    SettingsComponent,
    StandplaatsenSettingsComponent,
    StandplaatsenCardComponent,
    PloegenCardComponent,
    PloegenSettingsComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterModule.forChild(routes),
    NgxFpTsModule,
    EditInPlaceModule,
  ],
})
export class SettingsModule {}
