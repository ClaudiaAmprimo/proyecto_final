import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapViewEventComponent } from './map-view-event.component';

describe('MapViewEventComponent', () => {
  let component: MapViewEventComponent;
  let fixture: ComponentFixture<MapViewEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapViewEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapViewEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
