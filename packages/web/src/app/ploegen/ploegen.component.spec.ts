import { ComponentFixture, TestBed } from '@angular/core/testing'

import { PloegenComponent } from './ploegen.component'

describe('PloegenComponent', () => {
  let component: PloegenComponent
  let fixture: ComponentFixture<PloegenComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PloegenComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(PloegenComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
