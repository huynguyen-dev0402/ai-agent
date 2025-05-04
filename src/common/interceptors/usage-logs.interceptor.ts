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
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // 1. Lấy userId từ các nguồn khác nhau
    let userId: string;

    if (user?.id) {
      userId = user.id;
    }
    // Nếu không, lấy từ body
    else if (request.body?.user_id) {
      userId = request.body.user_id;
    }
    // Nếu không, lấy từ params
    else if (request.params?.user_id) {
      userId = request.params.user_id;
    }
    // Nếu không, lấy từ query
    else if (request.query?.user_id) {
      userId = request.query.user_id;
    }
    // Nếu không tìm thấy userId từ bất kỳ nguồn nào
    else {
      throw new BadRequestException(
        'User ID not found in request, params, query, or body',
      );
    }

    // Super admin không cần kiểm tra quota
    if (user?.role === 'super_admin') {
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
      userId,
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
