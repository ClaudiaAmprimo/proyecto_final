import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnMapLocationComponent } from './btn-map-location.component';

describe('BtnMapLocationComponent', () => {
  let component: BtnMapLocationComponent;
  let fixture: ComponentFixture<BtnMapLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnMapLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnMapLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
