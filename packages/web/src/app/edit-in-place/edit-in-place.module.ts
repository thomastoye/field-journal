import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EditInPlaceComponent } from './edit-in-place.component'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { FormsModule } from '@angular/forms'
import { A11yModule } from '@angular/cdk/a11y'

@NgModule({
  declarations: [EditInPlaceComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    A11yModule,
  ],
  exports: [EditInPlaceComponent],
})
export class EditInPlaceModule {}
