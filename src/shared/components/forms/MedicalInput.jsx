/**
 * MedicalInput - Input reutilizable para campos médicos
 * 
 * Características:
 * - Label obligatorio
 * - Error display
 * - Unit support (kg, mmHg, °C, etc)
 * - Validación en tiempo real
 * - Accesibilidad WCAG
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { spacing, typography } from '@/shared/theme';

export const MedicalInput = React.forwardRef(
  (
    {
      label,
      unit = null,
      error = null,
      required = false,
      hint = null,
      size = 'md',
      disabled = false,
      className,
      inputClassName,
      ...props
    },
    ref
  ) => {
    const inputId = props.id || `input-${Math.random()}`;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium',
              error && 'text-red-700',
              disabled && 'text-gray-400'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {unit && (
            <span className="text-xs text-gray-500 font-medium">{unit}</span>
          )}
        </div>

        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              inputClassName,
              error && 'border-red-500 focus:ring-red-500',
              disabled && 'bg-gray-50 cursor-not-allowed'
            )}
            {...props}
          />
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

MedicalInput.displayName = 'MedicalInput';

export default MedicalInput;
