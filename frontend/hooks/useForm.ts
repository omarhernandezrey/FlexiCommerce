'use client';

import { useState, useCallback } from 'react';
import { validateForm, ValidationRule, FormErrors } from '@/lib/validation';

export const useForm = (
  initialValues: Record<string, any>,
  validationRules?: Record<string, ValidationRule>,
  onSubmit?: (values: Record<string, any>) => void | Promise<void>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => ({ ...prev, [name]: newValue }));

      // Validate field if it has been touched
      if (validationRules && touched[name]) {
        const fieldError = validateForm({ [name]: newValue }, { [name]: validationRules[name] });
        setErrors((prev) => ({ ...prev, ...fieldError }));
      }
    },
    [validationRules, touched]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validationRules) {
        const fieldError = validateForm({ [name]: values[name] }, { [name]: validationRules[name] });
        setErrors((prev) => ({ ...prev, ...fieldError }));
      }
    },
    [validationRules, values]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Validate all fields
      if (validationRules) {
        const newErrors = validateForm(values, validationRules);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
          setIsSubmitting(false);
          return;
        }
      }

      try {
        if (onSubmit) {
          await onSubmit(values);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validationRules, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: string, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
  };
};
