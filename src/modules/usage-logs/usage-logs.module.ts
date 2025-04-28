import { Module } from '@nestjs/common';
import { UsageLogsService } from './usage-logs.service';
import { UsageLogsController } from './usage-logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLog } from './entities/usage-log.entity';
import { BullModule } from '@nestjs/bullmq';
import { UsageLogsProcessor } from './usage-logs.processor';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([UsageLog]),
    BullModule.registerQueue({
      name: 'usage-logs',
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    AuthModule,
  ],
  controllers: [UsageLogsController],
  providers: [UsageLogsService, UsageLogsProcessor],
  exports: [UsageLogsService],
})
export class UsageLogsModule {}
