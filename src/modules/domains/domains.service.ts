import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain, DomainStatus } from './entities/domain.entity';
import isReachable from 'is-reachable';

@Injectable()
export class DomainsService {
  constructor(
    @InjectRepository(Domain)
    private domainsRepository: Repository<Domain>,
  ) {}

  private normalizeDomain(domain: string): string {
    let normalized = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    normalized = normalized.trim().toLowerCase();
    return normalized;
  }

  private isValidDomainFormat(domain: string): boolean {
    const domainRegex =
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    return domainRegex.test(domain);
  }

  async createDomain(domainName: string, userId: string): Promise<Domain> {
    const normalizedDomain = this.normalizeDomain(domainName);

    // Kiểm tra định dạng domain hợp lệ
    if (!this.isValidDomainFormat(normalizedDomain)) {
      throw new BadRequestException('Invalid domain format');
    }

    // Kiểm tra domain đã tồn tại trong hệ thống chưa
    const existingDomain = await this.domainsRepository.findOne({
      where: { name: normalizedDomain },
    });
    if (existingDomain) {
      throw new BadRequestException('Domain already exists');
    }

    // Lưu domain
    const domain = this.domainsRepository.create({
      user: { id: userId },
      name: normalizedDomain,
      status: DomainStatus.PENDING,
      isVerified: false,
      created_at: new Date(),
    });

    return this.domainsRepository.save(domain);
  }

  async findOne(domainId: string): Promise<Domain | null> {
    const domain = await this.domainsRepository.findOne({
      where: {
        id: domainId,
      },
    });
    return domain;
  }

  async findDomainsForUser(userId: string) {
    const domains = await this.domainsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
    return domains
  }

  async verifyDomain(domainId: string, userId: string): Promise<Domain | null> {
    const domain = await this.findOne(domainId);
    if (!domain) {
      throw new NotFoundException('Domain not found');
    }
    // Kiểm tra domain có reachable (trực tuyến) không
    const isDomainUp = await isReachable(`https://${domain.name}`);
    if (!isDomainUp) {
      throw new BadRequestException('Domain is unreachable or inactive');
    }

    // Cập nhật domain
    const isVerifiedDomain = await this.domainsRepository.update(domainId, {
      status: DomainStatus.ACTIVE,
      isVerified: true,
      updated_at: new Date(),
    });

    if (isVerifiedDomain.affected === 0) {
      return null;
    }

    return this.domainsRepository.findOne({
      where:{
        id: domainId
      }
    });
  }
}
