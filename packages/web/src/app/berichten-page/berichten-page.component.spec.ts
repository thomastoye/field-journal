import { ComponentFixture, TestBed } from '@angular/core/testing'

import { BerichtenPageComponent } from './berichten-page.component'

describe('BerichtenPageComponent', () => {
  let component: BerichtenPageComponent
  let fixture: ComponentFixture<BerichtenPageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BerichtenPageComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(BerichtenPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
