import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { BerichtenPageComponent } from './berichten-page/berichten-page.component'
import { PloegenPageComponent } from './ploegen-page/ploegen-page.component'

const routes: Routes = [
  {
    path: 'ploegen',
    component: PloegenPageComponent,
  },
  {
    path: 'berichten',
    component: BerichtenPageComponent,
  },
  {
    path: 'instellingen',
    loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule),
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
