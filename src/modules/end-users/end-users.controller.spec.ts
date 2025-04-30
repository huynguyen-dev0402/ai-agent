import { Test, TestingModule } from '@nestjs/testing';
import { EndUsersController } from './end-users.controller';
import { EndUsersService } from './end-users.service';

describe('EndUsersController', () => {
  let controller: EndUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EndUsersController],
      providers: [EndUsersService],
    }).compile();

    controller = module.get<EndUsersController>(EndUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
