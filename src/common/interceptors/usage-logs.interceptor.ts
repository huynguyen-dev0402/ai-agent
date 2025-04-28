// ... existing code ...
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
import { QuotaService } from 'src/modules/quota/quota.service';
import {
  CHECK_QUOTA_KEY,
  CheckQuotaOptions,
} from 'src/common/decorators/check-quota.decorator';
import {
  UsageSource,
  UsageStatus,
} from 'src/modules/usage-logs/entities/usage-log.entity';

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
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 1. Kiểm tra user
    if (!user?.id) {
      throw new BadRequestException('User ID not found in request');
    }

    // Super admin không cần kiểm tra quota
    if (user.role === 'super_admin') {
      return next.handle();
    }

    // 2. Lấy metadata từ decorator
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

    // 3. Kiểm tra quota và ghi log (đồng bộ, trả về usageLogId)
    const usageLogId = await this.quotaService.checkQuotaAndLog(
      user.id,
      resourceType,
      action,
      source,
      quantity,
      request.body.details || {},
    );

    // 4. Xử lý request và cập nhật trạng thái log (bất đồng bộ)
    return next.handle().pipe(
      tap(() => {
        // Đẩy job update status sang ACTIVE vào queue
        this.quotaService
          .updateLogStatus(usageLogId, UsageStatus.ACTIVE)
          .catch((err) => console.error('Update log status error:', err));
      }),
      catchError((err) => {
        // Đẩy job update status sang CANCELED vào queue
        this.quotaService
          .updateLogStatus(usageLogId, UsageStatus.CANCELED)
          .catch((e) => console.error('Update log status error:', e));
        throw err;
      }),
    );
  }
}
