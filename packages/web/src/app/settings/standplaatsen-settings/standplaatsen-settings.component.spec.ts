import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TestingModule } from 'src/app/testing/testing.module'

import { StandplaatsenSettingsComponent } from './standplaatsen-settings.component'

describe('StandplaatsenSettingsComponent', () => {
  let component: StandplaatsenSettingsComponent
  let fixture: ComponentFixture<StandplaatsenSettingsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StandplaatsenSettingsComponent],
      imports: [TestingModule],
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
