import { ComponentFixture, TestBed } from '@angular/core/testing'

import { StandplaatsenSettingsComponent } from './standplaatsen-settings.component'

describe('StandplaatsenSettingsComponent', () => {
  let component: StandplaatsenSettingsComponent
  let fixture: ComponentFixture<StandplaatsenSettingsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StandplaatsenSettingsComponent],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(StandplaatsenSettingsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
