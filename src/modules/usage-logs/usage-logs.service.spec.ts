import { Test, TestingModule } from '@nestjs/testing';
import { UsageLogsService } from './usage-logs.service';

describe('UsageLogsService', () => {
  let service: UsageLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsageLogsService],
    }).compile();

    service = module.get<UsageLogsService>(UsageLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
