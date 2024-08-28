import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditViajeComponent } from './add-edit-viaje.component';

describe('AddEditViajeComponent', () => {
  let component: AddEditViajeComponent;
  let fixture: ComponentFixture<AddEditViajeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditViajeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditViajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
