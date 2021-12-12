import { ComponentFixture, TestBed } from '@angular/core/testing'

import { StandplaatsenCardComponent } from './standplaatsen-card.component'

describe('StandplaatsenCardComponent', () => {
  let component: StandplaatsenCardComponent
  let fixture: ComponentFixture<StandplaatsenCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StandplaatsenCardComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(StandplaatsenCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
