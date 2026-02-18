/**
 * Email validation regex pattern
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password strength requirements
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  HAS_UPPERCASE: /[A-Z]/,
  HAS_LOWERCASE: /[a-z]/,
  HAS_NUMBER: /[0-9]/,
  HAS_SPECIAL: /[!@#$%^&*]/,
};

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEmail = (email: string): ValidationError | null => {
  if (!email.trim()) {
    return { field: 'email', message: 'El email es requerido' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { field: 'email', message: 'Email inválido' };
  }
  return null;
};

export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: 'password', message: 'La contraseña es requerida' };
  }
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    return {
      field: 'password',
      message: `La contraseña debe tener al menos ${PASSWORD_REQUIREMENTS.MIN_LENGTH} caracteres`,
    };
  }
  if (!PASSWORD_REQUIREMENTS.HAS_UPPERCASE.test(password)) {
    return {
      field: 'password',
      message: 'La contraseña debe tener mayúsculas',
    };
  }
  if (!PASSWORD_REQUIREMENTS.HAS_LOWERCASE.test(password)) {
    return {
      field: 'password',
      message: 'La contraseña debe tener minúsculas',
    };
  }
  if (!PASSWORD_REQUIREMENTS.HAS_NUMBER.test(password)) {
    return {
      field: 'password',
      message: 'La contraseña debe tener números',
    };
  }
  if (!PASSWORD_REQUIREMENTS.HAS_SPECIAL.test(password)) {
    return {
      field: 'password',
      message: 'La contraseña debe tener caracteres especiales (!@#$%^&*)',
    };
  }
  return null;
};

export const validateName = (name: string, fieldName: string = 'Nombre'): ValidationError | null => {
  if (!name.trim()) {
    return { field: 'name', message: `${fieldName} es requerido` };
  }
  if (name.trim().length < 2) {
    return { field: 'name', message: `${fieldName} debe tener al menos 2 caracteres` };
  }
  return null;
};

export const validateConfirmPassword = (password: string, confirm: string): ValidationError | null => {
  if (password !== confirm) {
    return { field: 'confirmPassword', message: 'Las contraseñas no coinciden' };
  }
  return null;
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  let strength = 0;

  if (password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH) strength++;
  if (PASSWORD_REQUIREMENTS.HAS_UPPERCASE.test(password)) strength++;
  if (PASSWORD_REQUIREMENTS.HAS_LOWERCASE.test(password)) strength++;
  if (PASSWORD_REQUIREMENTS.HAS_NUMBER.test(password)) strength++;
  if (PASSWORD_REQUIREMENTS.HAS_SPECIAL.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};
