import { PartialType } from '@nestjs/swagger';
import { CreateUsageLogDto } from './create-usage-log.dto';

export class UpdateUsageLogDto extends PartialType(CreateUsageLogDto) {}
