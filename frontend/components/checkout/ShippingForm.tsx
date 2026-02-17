'use client';

import { useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useForm } from '@/hooks/useForm';
import { validationPatterns } from '@/lib/validation';

interface ShippingFormProps {
  onNext: (data: ShippingData) => void;
  initialData?: ShippingData;
}

export interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export function ShippingForm({ onNext, initialData }: ShippingFormProps) {
  const initialValues: ShippingData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    ...initialData,
  };

  const { values, errors, touched, handleChange, handleSubmit } = useForm({
    initialValues,
    validate: (values: ShippingData) => {
      const newErrors: Record<string, string> = {};

      if (!values.firstName.trim()) {
        newErrors.firstName = 'Nombre es requerido';
      }
      if (!values.lastName.trim()) {
        newErrors.lastName = 'Apellido es requerido';
      }
      if (!values.email) {
        newErrors.email = 'Email es requerido';
      } else if (!validationPatterns.email.value.test(values.email)) {
        newErrors.email = 'Email inválido';
      }
      if (!values.phone) {
        newErrors.phone = 'Teléfono es requerido';
      }
      if (!values.street.trim()) {
        newErrors.street = 'Dirección es requerida';
      }
      if (!values.city.trim()) {
        newErrors.city = 'Ciudad es requerida';
      }
      if (!values.zipCode) {
        newErrors.zipCode = 'Código postal es requerido';
      }

      return newErrors;
    },
    onSubmit: (values: ShippingData) => {
      onNext(values);
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">
            Nombre
          </label>
          <input
            type="text"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.firstName && touched.firstName ? 'border-red-500' : 'border-slate-200'
            }`}
          />
          {errors.firstName && touched.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">
            Apellido
          </label>
          <input
            type="text"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.lastName && touched.lastName ? 'border-red-500' : 'border-slate-200'
            }`}
          />
          {errors.lastName && touched.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.email && touched.email ? 'border-red-500' : 'border-slate-200'
            }`}
          />
          {errors.email && touched.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.phone && touched.phone ? 'border-red-500' : 'border-slate-200'
            }`}
          />
          {errors.phone && touched.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-primary mb-2">
          Dirección
        </label>
        <input
          type="text"
          name="street"
          value={values.street}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.street && touched.street ? 'border-red-500' : 'border-slate-200'
          }`}
        />
        {errors.street && touched.street && (
          <p className="text-red-500 text-sm mt-1">{errors.street}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">
            Ciudad
          </label>
          <input
            type="text"
            name="city"
            value={values.city}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.city && touched.city ? 'border-red-500' : 'border-slate-200'
            }`}
          />
          {errors.city && touched.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">
            Código Postal
          </label>
          <input
            type="text"
            name="zipCode"
            value={values.zipCode}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.zipCode && touched.zipCode ? 'border-red-500' : 'border-slate-200'
            }`}
          />
          {errors.zipCode && touched.zipCode && (
            <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        Continuar al Pago
        <MaterialIcon name="arrow_forward" />
      </button>
    </form>
  );
}
