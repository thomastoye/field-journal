import { ComponentFixture, TestBed } from '@angular/core/testing'

import { PloegenPageComponent } from './ploegen-page.component'

describe('PloegenPageComponent', () => {
  let component: PloegenPageComponent
  let fixture: ComponentFixture<PloegenPageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PloegenPageComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(PloegenPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
