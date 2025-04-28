import { Test, TestingModule } from '@nestjs/testing';
import { UsageLogsController } from './usage-logs.controller';
import { UsageLogsService } from './usage-logs.service';

describe('UsageLogsController', () => {
  let controller: UsageLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsageLogsController],
      providers: [UsageLogsService],
    }).compile();

    controller = module.get<UsageLogsController>(UsageLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
