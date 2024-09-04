import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionarAmigoComponent } from './seleccionar-amigo.component';

describe('SeleccionarAmigoComponent', () => {
  let component: SeleccionarAmigoComponent;
  let fixture: ComponentFixture<SeleccionarAmigoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionarAmigoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionarAmigoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
