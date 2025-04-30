import { Controller } from '@nestjs/common';
import { EndUsersService } from './end-users.service';

@Controller('end-users')
export class EndUsersController {
  constructor(private readonly endUsersService: EndUsersService) {}
}
