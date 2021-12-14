import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TestingModule } from 'src/app/testing/testing.module'

import { PloegenSettingsComponent } from './ploegen-settings.component'

describe('PloegenSettingsComponent', () => {
  let component: PloegenSettingsComponent
  let fixture: ComponentFixture<PloegenSettingsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PloegenSettingsComponent],
      imports: [TestingModule],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(PloegenSettingsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
