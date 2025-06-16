
"use client";

import type { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { RegistrationFormData } from '@/lib/schemas/registration-schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ClipboardList } from 'lucide-react';

interface DeclarationsUploadsStepProps {
  form: UseFormReturn<RegistrationFormData>;
}

export const DeclarationsUploadsStep: FC<DeclarationsUploadsStepProps> = ({ form }) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <ClipboardList className="mr-2 h-6 w-6 text-primary" />
          Declarations
        </CardTitle>
        <CardDescription>Please confirm the following declaration.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-lg font-semibold text-primary">Confirmation</h3>
        <FormField
          control={form.control}
          name="declarationsUploads.infoConfirmed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id={field.name}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={field.name}>
                  I confirm that all information provided in this form is true to the best of my knowledge and belief.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
