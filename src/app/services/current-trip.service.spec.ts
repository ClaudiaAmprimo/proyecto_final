import { TestBed } from '@angular/core/testing';

import { CurrentTripService } from './current-trip.service';

describe('CurrentTripService', () => {
  let service: CurrentTripService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentTripService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
