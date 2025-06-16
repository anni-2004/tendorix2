
"use client";

import type { FC } from 'react';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type { RegistrationFormData } from '@/lib/schemas/registration-schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Landmark, PlusCircle, Trash2 } from 'lucide-react';

interface FinancialLegalInfoStepProps {
  form: UseFormReturn<RegistrationFormData>;
}

const CURRENCY_OPTIONS = ["USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SGD", "AED"];

const MIN_DISPLAY_YEARS = 10;
const MAX_TOTAL_YEARS = 15;

// Helper to generate a financial year string like "YYYY-YY"
const getFinancialYearString = (startYear: number): string => {
  const endYearShort = (startYear + 1).toString().slice(-2);
  return `${startYear}-${endYearShort}`;
};

export const FinancialLegalInfoStep: FC<FinancialLegalInfoStepProps> = ({ form }) => {
  const { control, watch, setValue, getValues, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "financialLegalInfo.annualTurnovers",
  });

  const handleAddYear = () => {
    if (fields.length < MAX_TOTAL_YEARS) {
      const lastEntry = fields[fields.length - 1];
      let newStartYear;
      if (lastEntry && lastEntry.financialYear) {
        const lastStartYear = parseInt(lastEntry.financialYear.substring(0, 4), 10);
        newStartYear = lastStartYear - 1;
      } else {
        // Fallback: calculate based on current number of fields and date
        let latestFinancialYearStart = new Date().getFullYear();
        if (new Date().getMonth() < 3) { // Before April
          latestFinancialYearStart -= 1;
        }
        newStartYear = latestFinancialYearStart - fields.length;
      }
      append({ financialYear: getFinancialYearString(newStartYear), amount: '' });
    }
  };


  const watchIsBlacklisted = watch('financialLegalInfo.isBlacklistedOrLitigation');
  
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Landmark className="mr-2 h-6 w-6 text-primary" />
          Financial & Legal Information
        </CardTitle>
        <CardDescription>
          Provide your company's financial and legal details. 
          Check the boxes to confirm possession of registrations.
          Net Worth and the latest year's Annual Turnover are required. Other turnover years are optional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="financialLegalInfo.hasPan"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id={field.name}
                  aria-describedby={`${field.name}-description`}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={field.name} className="font-normal">
                  Do you have a PAN?
                </FormLabel>
                <FormDescription id={`${field.name}-description`}>
                  Permanent Account Number
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="financialLegalInfo.hasGstin"
          render={({ field }) => (
             <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id={field.name}
                  aria-describedby={`${field.name}-description`}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={field.name} className="font-normal">
                  Do you have a GSTIN?
                </FormLabel>
                 <FormDescription id={`${field.name}-description`}>
                  Goods and Services Tax Identification Number
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="financialLegalInfo.hasMsmeUdyam"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id={field.name}
                  aria-describedby={`${field.name}-description`}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={field.name} className="font-normal">
                  Do you have an MSME/Udyam Registration?
                </FormLabel>
                 <FormDescription id={`${field.name}-description`}>
                  Micro, Small and Medium Enterprises / Udyam Registration
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="financialLegalInfo.hasNsic"
          render={({ field }) => (
             <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id={field.name}
                  aria-describedby={`${field.name}-description`}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={field.name} className="font-normal">
                   Do you have an NSIC Registration?
                </FormLabel>
                <FormDescription id={`${field.name}-description`}>
                  National Small Industries Corporation
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <FormField
            control={control}
            name="financialLegalInfo.netWorthAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Net Worth Amount</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="e.g., 1000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="financialLegalInfo.netWorthCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Net Worth &amp; Annual Turnover Currency</FormLabel>
                 <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {CURRENCY_OPTIONS.map(currency => (
                        <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormDescription>This currency will apply to Net Worth and all Annual Turnover entries.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium">Annual Turnover (Last {MIN_DISPLAY_YEARS}-{MAX_TOTAL_YEARS} Years)</h4>
          <FormDescription>
            The turnover amount for the latest financial year ({fields[0]?.financialYear || getFinancialYearString(new Date().getFullYear() - (new Date().getMonth() < 3 ? 1: 0))}) is <strong className="text-foreground">required</strong>.
            Amounts for all other preceding financial years displayed are <strong className="text-foreground">optional</strong>.
            However, <strong>providing data for at least the last {MIN_DISPLAY_YEARS} financial years is recommended for better results.</strong>
            You can add up to {MAX_TOTAL_YEARS - MIN_DISPLAY_YEARS} more preceding years beyond the initial {MIN_DISPLAY_YEARS}.
            Amounts will use the Net Worth currency selected above.
          </FormDescription>
          <div className="space-y-3">
            {fields.map((item, index) => (
              <div key={item.id} className="p-3 border rounded-md space-y-2">
                <div className="flex justify-between items-center">
                    <FormLabel htmlFor={`financialLegalInfo.annualTurnovers.${index}.amount`}>
                        Financial Year: {item.financialYear}
                        {index === 0 && <span className="text-destructive">*</span>}
                    </FormLabel>
                    {index >= MIN_DISPLAY_YEARS && index === fields.length - 1 && ( 
                        <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                        aria-label={`Remove financial year ${item.financialYear}`}
                        >
                        <Trash2 className="mr-1 h-4 w-4" /> Remove
                        </Button>
                    )}
                </div>
                <FormField
                  control={control}
                  name={`financialLegalInfo.annualTurnovers.${index}.amount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          id={`financialLegalInfo.annualTurnovers.${index}.amount`}
                          type="text" 
                          placeholder="e.g., 5000000" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`financialLegalInfo.annualTurnovers.${index}.financialYear`}
                  render={({ field }) => (
                    <Input type="hidden" {...field} value={item.financialYear} />
                  )}
                />
              </div>
            ))}
          </div>
          {fields.length < MAX_TOTAL_YEARS && (
            <Button type="button" variant="outline" onClick={handleAddYear} className="mt-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Previous Financial Year
            </Button>
          )}
           {errors.financialLegalInfo?.annualTurnovers && !errors.financialLegalInfo?.annualTurnovers?.root && typeof errors.financialLegalInfo.annualTurnovers.message === 'string' && (
             <p className="text-sm font-medium text-destructive">
                {errors.financialLegalInfo.annualTurnovers.message}
             </p>
           )}
        </div>
        
        <FormField
          control={control}
          name="financialLegalInfo.isBlacklistedOrLitigation"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    if (!checked) {
                        setValue('financialLegalInfo.blacklistedDetails', '', { shouldValidate: true });
                    }
                  }}
                  id={field.name}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={field.name} className="font-normal">
                  Is the company blacklisted or in litigation?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        {watchIsBlacklisted && (
          <FormField
            control={control}
            name="financialLegalInfo.blacklistedDetails"
            render={({ field }) => (
              <FormItem className="pl-10"> 
                <FormLabel>Details of Blacklisting/Litigation</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Provide details" {...field} />
                </FormControl>
                <FormDescription>Required if 'Yes' is selected above.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};

    