import { TestBed } from '@angular/core/testing';

import { PusherServiceService } from './pusher-service.service';

describe('PusherServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PusherServiceService = TestBed.get(PusherServiceService);
    expect(service).toBeTruthy();
  });
});
