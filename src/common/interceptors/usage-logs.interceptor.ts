import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { QuotaService } from '@modules/quota/quota.service';
import {
  CHECK_QUOTA_KEY,
  CheckQuotaOptions,
} from '@common/decorators/check-quota.decorator';
import {
  UsageSource,
  UsageStatus,
} from '@modules/usage-logs/entities/usage-log.entity';

@Injectable()
export class CheckQuotaInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly quotaService: QuotaService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 1. Lấy userId nhanh gọn từ user hoặc fallback từ body/params/query
    const userId =
      user?.id ||
      request.body?.user_id ||
      request.params?.user_id ||
      request.query?.user_id;

    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }

    // 2. Super admin bỏ qua kiểm tra
    if (user?.role === 'super_admin') {
      return next.handle();
    }

    // 3. Lấy metadata từ decorator
    const handler = context.getHandler();
    const options: CheckQuotaOptions = this.reflector.get(
      CHECK_QUOTA_KEY,
      handler,
    );
    if (!options) {
      return next.handle();
    }

    const { resourceType, action, quantity = 1 } = options;
    const source = UsageSource.API;

    // 4. Gọi checkQuotaAndLog để kiểm tra quota và log trạng thái PENDING
    const usageLogId = await this.quotaService.checkQuotaAndLog(
      userId,
      resourceType,
      action,
      source,
      quantity,
      request.body?.details || {},
    );

    console.log(`⏱ checkQuotaInterceptor total: ${Date.now() - now} ms`);

    // 5. Sau khi request xong, cập nhật log sang ACTIVE / CANCELED (không block pipe)
    return next.handle().pipe(
      tap(() => {
        this.quotaService
          .updateLogStatus(usageLogId, UsageStatus.ACTIVE)
          .catch((err) =>
            console.error('❗ Update log status (ACTIVE) error:', err),
          );
      }),
      catchError((err) => {
        this.quotaService
          .updateLogStatus(usageLogId, UsageStatus.CANCELED)
          .catch((e) =>
            console.error('❗ Update log status (CANCELED) error:', e),
          );
        throw err;
      }),
    );
  }
}
