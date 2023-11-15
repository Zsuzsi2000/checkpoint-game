import { TestBed } from '@angular/core/testing';

import { LiveGameService } from './live-game.service';

describe('LiveGameService', () => {
  let service: LiveGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
