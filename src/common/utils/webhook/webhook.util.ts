import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";

@Injectable()
export class WebhookUtils {
  readonly API_KEY_HEADER = 'Authorization';
  readonly APIKEY_PREFIX = 'Apikey ';

  private readonly logger = new Logger(WebhookUtils.name);

  async validateWebhookAuth(authHeader: string, apiKey: string): Promise<void> {
    if (!this.isValidAuthHeader(authHeader)) {
      this.logger.warn('Invalid or missing authorization header');
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const token = this.extractToken(authHeader);
    if (!this.isValidApiKey(token, apiKey)) {
      this.logger.warn('Invalid API key provided');
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  private isValidAuthHeader(authHeader: string): boolean {
    return !!authHeader && authHeader.startsWith(this.APIKEY_PREFIX);
  }

  private extractToken(authHeader: string): string {
    return authHeader.substring(this.APIKEY_PREFIX.length);
  }

  private isValidApiKey(token: string, apiKey: string): boolean {
    if (!token || !apiKey || token.length !== apiKey.length) {
      return false;
    }
    let mismatch = 0;
    for (let i = 0; i < token.length; i++) {
      mismatch |= token.charCodeAt(i) ^ apiKey.charCodeAt(i);
    }
    return mismatch === 0;
  }
}
