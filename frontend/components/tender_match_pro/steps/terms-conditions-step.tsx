
"use client";

import type { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { RegistrationFormData } from '@/lib/schemas/registration-schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';

interface TermsConditionsStepProps {
  form: UseFormReturn<RegistrationFormData>;
}

const T_AND_C_POINTS = [
  {
    id: "acknowledgmentOfTenderMatching" as const,
    label: "Acknowledgment of Tender Matching",
    text: "We acknowledge that TenderMatch Pro is providing us with a list of tenders that align with our business profile, based on the information we have shared.",
  },
  {
    id: "accuracyOfSharedCompanyProfile" as const,
    label: "Accuracy of Shared Company Profile",
    text: "We confirm that the company information we have provided (such as products/services, certifications, financials, etc.) is accurate and up to date for the purpose of matching with relevant tenders.",
  },
  {
    id: "noResponsibilityForTenderOutcomes" as const,
    label: "No Responsibility for Tender Outcomes",
    text: "We understand that TenderMatch Pro is not responsible for the tender results, outcomes, eligibility, or success of any application based on the shared tender information.",
  },
  {
    id: "nonDisclosureAndLimitedUse" as const,
    label: "Non-Disclosure and Limited Use",
    text: "We authorize TenderMatch Pro to use our company profile strictly for the purpose of identifying and displaying relevant tenders. We understand our information will not be shared with third parties without prior consent.",
  },
];

export const TermsConditionsStep: FC<TermsConditionsStepProps> = ({ form }) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <FileText className="mr-2 h-6 w-6 text-primary" />
          Terms & Conditions
        </CardTitle>
        <CardDescription>Please review and agree to the following terms and conditions to proceed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {T_AND_C_POINTS.map((point) => (
          <FormField
            key={point.id}
            control={form.control}
            name={`termsAndConditions.${point.id}`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id={`termsAndConditions.${point.id}`}
                    aria-labelledby={`label-termsAndConditions.${point.id}`}
                  />
                </FormControl>
                <div className="space-y-1 leading-normal">
                  <FormLabel htmlFor={`termsAndConditions.${point.id}`} id={`label-termsAndConditions.${point.id}`} className="font-medium cursor-pointer">
                    {point.label}
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">{point.text}</p>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        ))}
      </CardContent>
    </Card>
  );
};
