import { ComponentFixture, TestBed } from '@angular/core/testing'

import { PloegCardComponent } from './ploeg-card.component'

describe('PloegCardComponent', () => {
  let component: PloegCardComponent
  let fixture: ComponentFixture<PloegCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PloegCardComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(PloegCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
