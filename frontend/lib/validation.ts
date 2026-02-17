export interface ValidationRule {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  custom?: (value: any) => string | undefined;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export const validateField = (value: any, rules: ValidationRule): string | undefined => {
  if (rules.required) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return typeof rules.required === 'string' ? rules.required : 'Este campo es requerido';
    }
  }

  if (rules.minLength && value && value.length < rules.minLength.value) {
    return rules.minLength.message;
  }

  if (rules.maxLength && value && value.length > rules.maxLength.value) {
    return rules.maxLength.message;
  }

  if (rules.pattern && value) {
    if (!rules.pattern.value.test(value)) {
      return rules.pattern.message;
    }
  }

  if (rules.custom && value) {
    return rules.custom(value);
  }

  return undefined;
};

export const validateForm = (
  formData: Record<string, any>,
  validationRules: Record<string, ValidationRule>
): FormErrors => {
  const errors: FormErrors = {};

  for (const [field, rules] of Object.entries(validationRules)) {
    const error = validateField(formData[field], rules);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
};

// Common validation patterns
export const validationPatterns = {
  email: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Por favor ingresa un email válido',
  },
  phone: {
    value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    message: 'Por favor ingresa un teléfono válido',
  },
  password: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
  },
  zipCode: {
    value: /^[0-9]{5}(?:-[0-9]{4})?$/,
    message: 'Por favor ingresa un código postal válido (ej: 12345 o 12345-6789)',
  },
};
