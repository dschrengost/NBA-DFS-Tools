import { TestBed } from '@angular/core/testing';
import { PlayerCsvService } from './player-csv.service';
import { PlayerIdsCsvService } from './player-ids-csv.service';

const SAMPLE = `ID,Name,Position,Team,Salary,Minutes,Fpts,own%,stddev,fieldFpts\n1,John Doe,PG,LAL,$5000,30,35,15%,5,40`;

describe('PlayerCsvService', () => {
  let service: PlayerCsvService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PlayerIdsCsvService, useValue: { load: () => Promise.resolve({}) } }],
    });
    service = TestBed.inject(PlayerCsvService);
  });

  it('parses players from CSV', async () => {
    const players = await service.parse(SAMPLE);
    expect(players.length).toBe(1);
    const p = players[0];
    expect(p.name).toBe('John Doe');
    expect(p.positions).toEqual(['PG']);
    expect(p.salary).toBe(5000);
    expect(p.ownership).toBeCloseTo(0.15, 5);
  });
});
