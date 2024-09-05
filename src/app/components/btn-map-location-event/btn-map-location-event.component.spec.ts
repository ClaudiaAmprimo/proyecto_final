import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnMapLocationEventComponent } from './btn-map-location-event.component';

describe('BtnMapLocationEventComponent', () => {
  let component: BtnMapLocationEventComponent;
  let fixture: ComponentFixture<BtnMapLocationEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnMapLocationEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnMapLocationEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
