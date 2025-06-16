
"use client";
// This file is no longer used as its content is merged into geographic-reach-step.tsx
// Keeping it empty or deleting it would be appropriate. For now, an empty functional component.

import type { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { RegistrationFormData } from '@/lib/schemas/registration-schema';

interface DigitalReadinessStepProps {
  form: UseFormReturn<RegistrationFormData>;
}

export const DigitalReadinessStep: FC<DigitalReadinessStepProps> = ({ form }) => {
  return (
    <div>
      {/* Content moved to GeographicDigitalReachStep */}
    </div>
  );
};
