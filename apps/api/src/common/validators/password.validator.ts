import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Password strength validator
 * Requires:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          // Minimum 8 characters
          if (value.length < 8) {
            return false;
          }

          // At least one uppercase letter
          if (!/[A-Z]/.test(value)) {
            return false;
          }

          // At least one lowercase letter
          if (!/[a-z]/.test(value)) {
            return false;
          }

          // At least one number
          if (!/[0-9]/.test(value)) {
            return false;
          }

          // At least one special character
          if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
            return false;
          }

          // Check for common weak passwords
          const commonPasswords = [
            'password',
            'password123',
            '12345678',
            'qwerty',
            'abc123',
            'letmein',
            'welcome',
            'admin',
          ];
          if (commonPasswords.some(weak => value.toLowerCase().includes(weak))) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        },
      },
    });
  };
}

/**
 * Check if password is strong enough
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  const commonPasswords = [
    'password',
    'password123',
    '12345678',
    'qwerty',
    'abc123',
    'letmein',
    'welcome',
    'admin',
  ];
  if (commonPasswords.some(weak => password.toLowerCase().includes(weak))) {
    errors.push('Password is too common or weak');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
