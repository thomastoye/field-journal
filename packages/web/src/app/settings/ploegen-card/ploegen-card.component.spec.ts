import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TestingModule } from 'src/app/testing/testing.module'

import { PloegenCardComponent } from './ploegen-card.component'

describe('PloegenCardComponent', () => {
  let component: PloegenCardComponent
  let fixture: ComponentFixture<PloegenCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PloegenCardComponent],
      imports: [TestingModule],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(PloegenCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
