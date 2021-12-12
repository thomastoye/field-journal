import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'app-edit-in-place',
  templateUrl: './edit-in-place.component.html',
  styleUrls: ['./edit-in-place.component.scss'],
})
export class EditInPlaceComponent {
  @Input() text: string | null = null
  @Input() ifTextIsNull = 'Niet ingevuld, klik om aan te passen'
  @Input() label = ''
  @Input() placeholder = ''

  @Output() changed = new EventEmitter<string>()

  editing = false

  submit(value: string) {
    this.editing = false
    this.changed.emit(value)
  }
}
