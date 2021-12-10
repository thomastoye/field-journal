import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TestingModule } from '../testing/testing.module'

import { EditInPlaceComponent } from './edit-in-place.component'

describe('EditInPlaceComponent', () => {
  let component: EditInPlaceComponent
  let fixture: ComponentFixture<EditInPlaceComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditInPlaceComponent],
      imports: [TestingModule],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInPlaceComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})