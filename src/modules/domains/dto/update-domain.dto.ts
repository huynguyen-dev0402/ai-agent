import { IsNotEmpty } from 'class-validator';

export class UpdateDomainDto {
  @IsNotEmpty({ message: 'Domain name is not empty' })
  name: string;
}
