import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { DomainsService } from './domains.service';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}
  @Post()
  async createDomain(
    @Body('domain') domainName: string,
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    return this.domainsService.createDomain(domainName, request.user.id);
  }

  @Post(':id/verify')
  async verifyDomain(
    @Param('id') domainId: string,
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const isVerified = await this.domainsService.verifyDomain(
      domainId,
      request.user.id,
    );
    if (!isVerified) {
      throw new BadRequestException(
        'Domain verification failed. Domain is unreachable or invalid.',
      );
    }
    return isVerified;
  }
}
