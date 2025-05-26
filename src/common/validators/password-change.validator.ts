import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationError,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class PasswordChangeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as UpdateUserDto;
    // Kiểm tra nếu password hoặc oldPassword được nhập thì yêu cầu cả 2 phải có
    if (
      (object.oldPassword && !object.password) ||
      (!object.oldPassword && object.password)
    ) {
      return false; // Nếu chỉ có một trong hai, thì không hợp lệ
    }
    return true; // Nếu cả 2 đều có hoặc đều không có, thì hợp lệ
  }

  defaultMessage(args: ValidationArguments): string {
    return 'You must enter both your old and new password when changing your password.';
  }
}
