import { validateCpfCnpj } from '@shared/helpers';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsCpfValid(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isCpfValid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          return validateCpfCnpj(value);
        },
      },
    });
  };
}
