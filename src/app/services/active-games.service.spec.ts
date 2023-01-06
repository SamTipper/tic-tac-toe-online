import { TestBed } from '@angular/core/testing';

import { ActiveGamesService } from './active-games.service';

describe('ActiveGamesService', () => {
  let service: ActiveGamesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveGamesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
