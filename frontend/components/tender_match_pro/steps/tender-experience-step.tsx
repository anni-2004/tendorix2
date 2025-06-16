
"use client";

import type { FC } from 'react';
import React, { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { RegistrationFormData } from '@/lib/schemas/registration-schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Award } from 'lucide-react';

interface TenderExperienceStepProps {
  form: UseFormReturn<RegistrationFormData>;
}

const TENDER_TYPE_OPTIONS = [
  // Construction and Infrastructure
  "Civil Works Contracts", "Road Construction Contracts", "Bridge Construction Projects",
  "Building Construction Projects", "Electrical Infrastructure Works", "Water Supply and Sanitation Projects",
  "Rail Infrastructure Development Contracts", "Renovation and Restoration Works",
  "Urban Infrastructure Development Projects", "Landscaping and Horticultural Services",
  // Supply and Procurement
  "Supply of Goods Contracts", "Supply of Equipment and Machinery", "Procurement of Medical Equipment",
  "Procurement of Laboratory Instruments", "Procurement of Office Furniture and Fixtures",
  "Procurement of IT Hardware and Accessories", "Supply of Vehicles and Automotive Components",
  "Supply of Electrical Goods and Components", "Procurement of Raw Materials", "Supply of Stationery and Office Supplies",
  // General Services
  "Housekeeping and Cleaning Services", "Security and Guarding Services", "Catering and Food Supply Services",
  "Facility Management Services", "Operation and Maintenance Services", "Waste Management and Disposal Services",
  "Pest Control Services", "Event Management Services", "Manpower Supply and Staffing Services",
  "Transport and Logistics Services",
  // Consultancy Services
  "Engineering Consultancy Services", "Architectural Design and Planning Services", "Legal Consultancy Services",
  "Financial and Tax Advisory Services", "Environmental Consultancy Services", "Project Management Consultancy Services",
  "Urban Planning and Development Consultancy", "Audit and Assurance Services", "Technical Feasibility Study Services",
  "Social Impact Assessment Consultancy",
  // Project-Based and Turnkey
  "Engineering, Procurement and Construction Contracts", "Turnkey Project Implementation Contracts",
  "Design, Build, Operate and Transfer Contracts", "Design and Build Infrastructure Projects",
  "Public-Private Partnership Infrastructure Projects", "Build-Operate-Transfer Project Contracts",
  "Build-Own-Operate Infrastructure Models",
  // Information Technology and Digital
  "Software Development Projects", "Website and Mobile Application Development",
  "System Integration and Implementation Services", "Information Technology Infrastructure Setup",
  "Enterprise Resource Planning System Deployment", "IT Support and Maintenance Services",
  "Cybersecurity Services and Solutions", "Data Center Design and Management",
  "Cloud Infrastructure and Hosting Services", "Electronic Governance Solutions",
  // Maintenance and Support
  "Annual Maintenance Contracts for Equipment", "Comprehensive Maintenance Contracts", "Preventive Maintenance Services",
  "Maintenance of IT Systems and Networks", "Maintenance of Building Infrastructure",
  "Electrical and Mechanical Maintenance Services",
  // Green and Sustainability-Focused
  "Renewable Energy System Installation (Solar, Wind, etc.)", "Solid Waste Management and Recycling Services",
  "Water Treatment Plant Construction and Operation", "Biomedical Waste Disposal Services",
  "Energy Efficiency Improvement Projects", "Green Building Certification and Consultancy",
  // Financial and Administrative
  "Statutory Audit Services", "Internal Audit and Risk Assessment Services", "Financial Due Diligence Services",
  "Insurance and Risk Management Services", "Bookkeeping and Accounting Services", "Payroll Processing Services",
  // Educational and Training
  "Vocational and Skill Development Training Programs", "Educational Content and Curriculum Development",
  "Classroom Technology Deployment Projects", "Training and Capacity Building Programs",
  "E-learning and Digital Education Solutions",
  // Research and Development
  "Scientific Research and Innovation Projects", "Product Development and Prototyping Services",
  "Laboratory Testing and Certification Services", "Academic Research Support Services", "Pilot Study and Field Testing Projects"
].filter((value, index, self) => self.indexOf(value) === index)
 .sort();


export const TenderExperienceStep: FC<TenderExperienceStepProps> = ({ form }) => {
  const { control, watch, setValue } = form;
  const netWorthCurrency = watch('financialLegalInfo.netWorthCurrency');
  const watchHasPastClients = watch('tenderExperience.hasPastClients');

  useEffect(() => {
    if (!watchHasPastClients) {
      setValue('tenderExperience.pastClients', '', { shouldValidate: true, shouldDirty: true });
    }
  }, [watchHasPastClients, setValue]);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Award className="mr-2 h-6 w-6 text-primary" />
          Tender Experience
        </CardTitle>
        <CardDescription>Detail your company's experience with government and private tenders.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="tenderExperience.suppliedToGovtPsus"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id={field.name}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={field.name} className="font-normal">
                  Supplied to Government/PSUs?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tenderExperience.hasPastClients"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id={field.name}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={field.name} className="font-normal">
                  Do you have past clients you can list?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {watchHasPastClients && (
          <FormField
            control={control}
            name="tenderExperience.pastClients"
            render={({ field }) => (
              <FormItem className="pl-10">
                <FormLabel>Past Clients</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="e.g., Ministry of Defence, Tata Motors, Reliance Industries" {...field} />
                </FormControl>
                <FormDescription>Enter client names separated by commas. Required if you checked the box above.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="tenderExperience.highestOrderValueFulfilled"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Highest Order Value Fulfilled
                {netWorthCurrency ? `, in ${netWorthCurrency}` : ', in your primary currency'}
              </FormLabel>
              <FormControl>
                 <Input
                    type="number"
                    placeholder="e.g., 1000000"
                    {...field}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                    value={field.value ?? ''}
                  />
              </FormControl>
              <FormDescription>Required.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="tenderExperience.tenderTypesHandled"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tender Types Handled</FormLabel>
              <FormControl>
                <TagInput
                  {...field}
                  options={TENDER_TYPE_OPTIONS}
                  placeholder="Select or type tender types..."
                  id="tenderTypesHandled"
                  aria-describedby="tenderTypesHandled-description"
                  aria-invalid={!!form.formState.errors.tenderExperience?.tenderTypesHandled}
                />
              </FormControl>
              <FormDescription id="tenderTypesHandled-description">
                Required. Select the types of tenders your company has experience with, or type to add custom ones.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};


    