import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TestingModule } from '../testing/testing.module'

import { PloegCardComponent } from './ploeg-card.component'

describe('PloegCardComponent', () => {
  let component: PloegCardComponent
  let fixture: ComponentFixture<PloegCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PloegCardComponent],
      imports: [TestingModule],
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
