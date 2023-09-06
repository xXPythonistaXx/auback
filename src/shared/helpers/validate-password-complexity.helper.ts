import { ValidationException } from '@shared/exceptions';

type ValidationOptions = {
  min?: number;
  max?: number;
  lowerCase?: number;
  upperCase?: number;
  numeric?: number;
  symbol?: number;
};

type ValidationObj = {
  valid: boolean;
  error?: string;
};

const validationOptions: ValidationOptions = {
  min: 8,
  max: 30,
  lowerCase: 1,
  upperCase: 1,
  symbol: 1,
};

export function validatePasswordComplexity(
  pass: string,
  options: ValidationOptions = validationOptions,
): boolean {
  const upperCaseRegex = /[A-Z]/g;
  const lowerCaseRegex = /[a-z]/g;
  const numberRegex = /[0-9]/g;
  const symbolRegex = /[^a-zA-Z0-9]/g;
  const obj: ValidationObj = {
    valid: true,
  };

  const {
    min = 0,
    max = 0,
    upperCase = 0,
    lowerCase = 0,
    numeric = 0,
    symbol = 0,
  } = options;

  if (typeof pass === 'string') {
    const upperCaseCount = pass.match(upperCaseRegex)?.length ?? 0;
    const lowercaseCount = pass.match(lowerCaseRegex)?.length ?? 0;
    const numericCount = pass.match(numberRegex)?.length ?? 0;
    const symbolCount = pass.match(symbolRegex)?.length ?? 0;

    const hasMin = pass.length >= min;
    const hasMax = pass.length <= max;
    const hasMinUpperCase = upperCaseCount >= upperCase;
    const hasMinLowerCase = lowercaseCount >= lowerCase;
    const hasMinNumeric = numericCount >= numeric;
    const hasMinSymbol = symbolCount >= symbol;

    if (!hasMin) {
      obj.valid = false;
      obj.error = `A senha precisa ter no mínimo ${min} caracteres`;
      throw new ValidationException('password', obj.error);
    }
    if (!hasMax) {
      obj.valid = false;
      obj.error = `A senha precisa ter no máximo ${max} caracteres`;
      throw new ValidationException('password', obj.error);
    }
    if (!hasMinUpperCase) {
      obj.valid = false;
      obj.error = `A senha precisa ter no mínimo ${upperCase} ${
        upperCase > 1 ? 'letras maiúsculas' : 'letra maiúscula'
      }`;
      throw new ValidationException('password', obj.error);
    }
    if (!hasMinLowerCase) {
      obj.valid = false;
      obj.error = `A senha precisa ter no mínimo ${lowerCase} ${
        lowerCase > 1 ? 'letras minúsculas' : 'letra minúscula'
      }`;
      throw new ValidationException('password', obj.error);
    }
    if (!hasMinNumeric) {
      obj.valid = false;
      obj.error = `A senha precisa ter no mínimo ${numeric} ${
        numeric > 1 ? 'números' : 'número'
      }`;
      throw new ValidationException('password', obj.error);
    }
    if (!hasMinSymbol) {
      obj.valid = false;
      obj.error = `A senha precisa ter no mínimo ${symbol} ${
        symbol > 1 ? 'caracteres especiais' : 'caracter especial'
      }`;
      throw new ValidationException('password', obj.error);
    }
    return obj.valid;
  }
  throw new ValidationException('password', 'A senha precisa ser uma string');
}
