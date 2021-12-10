/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormsModule } from '@angular/forms'
import { TestingModule } from '../testing/testing.module'

import { EditInPlaceComponent } from './edit-in-place.component'

describe('EditInPlaceComponent', () => {
  let component: EditInPlaceComponent
  let fixture: ComponentFixture<EditInPlaceComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditInPlaceComponent],
      imports: [FormsModule, TestingModule],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInPlaceComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('changed event is emitted after editing and confirming', () => {
    expect(component).toBeTruthy()
    const compiled = fixture.nativeElement as HTMLElement

    spyOn(component.changed, 'emit')

    expect(compiled.querySelector('form')).toBeNull()

    compiled.querySelector<HTMLButtonElement>('button.edit-in-place-start-editing')!.click()
    fixture.detectChanges()

    expect(compiled.querySelector('form')).not.toBeNull()

    compiled.querySelector<HTMLInputElement>(
      'form.edit-in-place-form > mat-form-field > input',
    )!.value = 'My New Value'
    compiled.querySelector<HTMLButtonElement>('button.edit-in-place-confirm')!.click()

    fixture.detectChanges()

    expect(component.changed.emit).toHaveBeenCalledWith('My New Value')
    expect(compiled.querySelector('form')).toBeNull()
  })

  it('no changed event is emitted after editing and cancelling', () => {
    const compiled = fixture.nativeElement as HTMLElement

    spyOn(component.changed, 'emit')

    expect(compiled.querySelector('form')).toBeNull()

    compiled.querySelector<HTMLButtonElement>('button.edit-in-place-start-editing')!.click()
    fixture.detectChanges()

    expect(compiled.querySelector('form')).not.toBeNull()

    compiled.querySelector<HTMLInputElement>(
      'form.edit-in-place-form > mat-form-field > input',
    )!.value = 'My New Value'
    compiled.querySelector<HTMLButtonElement>('button.edit-in-place-cancel')!.click()

    fixture.detectChanges()

    expect(component.changed.emit).not.toHaveBeenCalled()
    expect(compiled.querySelector('form')).toBeNull()
  })
})
