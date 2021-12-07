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
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
