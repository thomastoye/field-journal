import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TestingModule } from '../testing/testing.module'

import { PloegCardNewComponent } from './ploeg-card-new.component'

describe('PloegCardNewComponent', () => {
  let component: PloegCardNewComponent
  let fixture: ComponentFixture<PloegCardNewComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PloegCardNewComponent],
      imports: [TestingModule],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(PloegCardNewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
