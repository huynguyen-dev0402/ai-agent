// import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { RedisModule } from '@nestjs-modules/ioredis';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     RedisModule.forRootAsync({
//       useFactory: () => ({
//         type: 'single',
//         options: {
//           host: process.env.REDIS_HOST,
//           port: Number(process.env.REDIS_PORT),
//           username: process.env.REDIS_USERNAME,
//           password: process.env.REDIS_PASSWORD,
//         },
//       }),
//     }),
//   ],
//   exports: [RedisGlobalModule],
// })
// export class RedisGlobalModule {}
