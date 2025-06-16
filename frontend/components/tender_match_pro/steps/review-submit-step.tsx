
"use client";

import type { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { RegistrationFormData, TurnoverEntry } from '@/lib/schemas/registration-schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { format } from 'date-fns';

interface ReviewSubmitStepProps {
  form: UseFormReturn<RegistrationFormData>;
}

const formatDisplayData = (data: any, fieldName?: string, sectionData?: Record<string, any>): string => {
  if (typeof data === 'boolean') return data ? 'Agreed' : 'Not Agreed';
  if (typeof data === 'number') return data.toString();
  if (data instanceof Date) {
    try {
      return format(data, "PPP"); // e.g., "Mar 15th, 2024"
    } catch (e) {
      return "Invalid Date";
    }
  }


  if (data === null || data === undefined || data === '') {
     if (fieldName === 'websiteUrl' && sectionData && (sectionData as RegistrationFormData['companyDetails']).websiteUrl === '') {
        return 'Not Provided';
     }
     if (fieldName === 'technicalCapabilities' && sectionData && (sectionData as RegistrationFormData['businessCapabilities']).technicalCapabilities === '') {
        return 'Not Provided';
     }
     const financialFields = ['blacklistedDetails'];
     if (financialFields.includes(fieldName || '')) {
         return 'Details not provided';
     }
     if (fieldName === 'pastClients' && sectionData && (sectionData as RegistrationFormData['tenderExperience']).hasPastClients && (sectionData as RegistrationFormData['tenderExperience']).pastClients === '') {
        return 'Details not provided';
     }
     if (fieldName === 'operationalStates' && sectionData && (sectionData as RegistrationFormData['geographicDigitalReach']).operatesInMultipleStates && (sectionData as RegistrationFormData['geographicDigitalReach']).operationalStates === '') {
        return 'Details not provided';
     }
     if (fieldName === 'countriesServed' && sectionData && (sectionData as RegistrationFormData['geographicDigitalReach']).exportsToOtherCountries && (sectionData as RegistrationFormData['geographicDigitalReach']).countriesServed === '') {
        return 'Details not provided';
     }
    return 'N/A (Data Missing)';
  }

  if (Array.isArray(data) && fieldName !== 'annualTurnovers') {
    if (data.length === 0) return 'None (Data Missing)';
    return data.join(', ');
  }
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return Object.entries(data)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${formatDisplayData(value, key, data as Record<string, any>)}`)
      .join('; ');
  }
  return String(data);
};

const T_AND_C_DISPLAY_LABELS: Record<keyof RegistrationFormData['termsAndConditions'], string> = {
  acknowledgmentOfTenderMatching: "Acknowledgment of Tender Matching",
  accuracyOfSharedCompanyProfile: "Accuracy of Shared Company Profile",
  noResponsibilityForTenderOutcomes: "No Responsibility for Tender Outcomes",
  nonDisclosureAndLimitedUse: "Non-Disclosure and Limited Use",
};


const renderSectionData = (title: string, sectionData: Record<string, any> | undefined) => {
  if (!sectionData || Object.keys(sectionData).length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">No data provided for this section.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      <div className="p-4 bg-muted/50 rounded-md text-sm space-y-2">
        {Object.entries(sectionData).map(([key, value]) => {
          let displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          if (key === 'dateOfEstablishment') displayKey = 'Date Of Establishment'; // Correct display for new field
          let displayValue;

          if (title === "Terms & Conditions") {
            displayKey = T_AND_C_DISPLAY_LABELS[key as keyof RegistrationFormData['termsAndConditions']] || displayKey;
            displayValue = formatDisplayData(value); 
          } else if (title === "Business Capabilities") {
            if (key === 'hasNoCertifications') {
               return (
                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
                    <span className="font-medium col-span-1 capitalize break-words">Has No Certifications:</span>
                    <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{value ? 'Yes' : 'No'}</span>
                </div>
               );
            }
            if (key === 'certifications') {
               displayValue = sectionData.hasNoCertifications ? "Not Applicable (Declared no certifications)" : formatDisplayData(value, key, sectionData);
            } else {
               displayValue = formatDisplayData(value, key, sectionData);
            }
          } else if (title === "Financial & Legal Information") {
            const booleanDisplay = (val: any) => val ? 'Yes' : 'No';
            if (key === 'hasPan') {
                return (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
                        <span className="font-medium col-span-1 capitalize break-words">PAN Holder:</span>
                        <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{booleanDisplay(value)}</span>
                    </div>
                );
            } else if (key === 'hasGstin') {
                 return (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
                        <span className="font-medium col-span-1 capitalize break-words">GSTIN Holder:</span>
                        <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{booleanDisplay(value)}</span>
                    </div>
                );
            } else if (key === 'hasMsmeUdyam') {
                return (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
                        <span className="font-medium col-span-1 capitalize break-words">MSME/Udyam Registered:</span>
                        <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{booleanDisplay(value)}</span>
                    </div>
                );
            } else if (key === 'hasNsic') {
                return (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
                        <span className="font-medium col-span-1 capitalize break-words">NSIC Registered:</span>
                        <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{booleanDisplay(value)}</span>
                    </div>
                );
            } else if (key === 'isBlacklistedOrLitigation') {
                 return (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
                        <span className="font-medium col-span-1 capitalize break-words">Blacklisted or in Litigation:</span>
                        <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{booleanDisplay(value)}</span>
                    </div>
                );
            } else if (key === 'blacklistedDetails') {
              displayValue = sectionData.isBlacklistedOrLitigation ? (value ? formatDisplayData(value, key, sectionData) : "Details not provided") : "Not Blacklisted or in Litigation (as declared)";
            } else if (key === 'annualTurnovers' && Array.isArray(value)) {
                const netWorthCurrency = (sectionData as any).netWorthCurrency;
                const currencySuffix = netWorthCurrency ? ` (in ${netWorthCurrency})` : '';

                const sortedTurnovers = value as TurnoverEntry[];

                return (
                  <div key={key} className="space-y-1">
                    <span className="font-medium col-span-1 capitalize break-words">{displayKey} (Up to last {sortedTurnovers.length} years):</span>
                    {sortedTurnovers.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-0.5">
                        {sortedTurnovers.map((entry: TurnoverEntry, index: number) => {
                           const displayAmount = (entry.amount && entry.amount.trim() !== "")
                           ? formatDisplayData(entry.amount, 'amount', entry)
                           : (index === 0 ? "Required (Data Missing)" : "Not Provided"); 
                          return (
                            <li key={`${entry.financialYear}-${index}`} className="whitespace-pre-wrap break-words">
                              {`FY: ${formatDisplayData(entry.financialYear, 'financialYear', entry)}, Amount: ${displayAmount}${currencySuffix}`}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words"> No annual turnover data provided or structure error.</span>
                    )}
                  </div>
                );
            } else {
              displayValue = formatDisplayData(value, key, sectionData);
            }
          } else if (title === "Tender Experience") {
            const booleanDisplay = (val: any) => val ? 'Yes' : 'No';
            if (key === 'hasPastClients') {
              return (
                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
                  <span className="font-medium col-span-1 capitalize break-words">Can List Past Clients:</span>
                  <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{booleanDisplay(value)}</span>
                </div>
              );
            } else if (key === 'pastClients') {
              displayValue = sectionData.hasPastClients
                ? (value ? formatDisplayData(value, key, sectionData) : "Details not provided")
                : "Not Applicable (Indicated no past clients to list)";
            } else if (key === 'suppliedToGovtPsus') {
                 return (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
                        <span className="font-medium col-span-1 capitalize break-words">Supplied to Govt/PSUs:</span>
                        <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{booleanDisplay(value)}</span>
                    </div>
                 );
            }
            else {
              displayValue = formatDisplayData(value, key, sectionData);
            }
          } else if (title === "Geographic Reach & Digital Readiness") {
            const booleanDisplay = (val: any) => val ? 'Yes' : 'No';
            if (key === 'operatesInMultipleStates') {
              return (
                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
                  <span className="font-medium col-span-1 capitalize break-words">Operates In/Exports To Multiple States:</span>
                  <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{booleanDisplay(value)}</span>
                </div>
              );
            } else if (key === 'operationalStates') {
              displayValue = sectionData.operatesInMultipleStates
                ? (value ? formatDisplayData(value, key, sectionData) : "Details not provided")
                : "Not Applicable (Single state or no export to other states indicated)";
            } else if (key === 'exportsToOtherCountries') {
              return (
                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
                  <span className="font-medium col-span-1 capitalize break-words">Exports To Other Countries:</span>
                  <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{booleanDisplay(value)}</span>
                </div>
              );
            } else if (key === 'countriesServed') {
              displayValue = sectionData.exportsToOtherCountries
                ? (value ? formatDisplayData(value, key, sectionData) : "Details not provided")
                : "Not Applicable (No export to other countries indicated)";
            } else if (['hasImportLicense', 'hasExportLicense', 'registeredOnPortals', 'hasDigitalSignature'].includes(key)) {
                return (
                     <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
                        <span className="font-medium col-span-1 capitalize break-words">{displayKey}:</span>
                        <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{booleanDisplay(value)}</span>
                    </div>
                );
            }
             else {
              displayValue = formatDisplayData(value, key, sectionData);
            }
          } else if (title === "Declarations") {
            if (key === 'infoConfirmed') {
                 displayKey = "Information Confirmed Accurate";
                 displayValue = formatDisplayData(value); 
            }
          }
          else {
            displayValue = formatDisplayData(value, key, sectionData);
          }

          const handledFlags = ['hasPan', 'hasGstin', 'hasMsmeUdyam', 'hasNsic', 'isBlacklistedOrLitigation', 'hasNoCertifications', 'hasPastClients', 'operatesInMultipleStates', 'exportsToOtherCountries', 'suppliedToGovtPsus', 'hasImportLicense', 'hasExportLicense', 'registeredOnPortals', 'hasDigitalSignature'];
          if (title !== "Terms & Conditions" && title !== "Declarations" && handledFlags.includes(key)) {
            return null; 
          }
          
          if (key === 'annualTurnovers') return null;


          return (
            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2 items-start">
              <span className="font-medium col-span-1 capitalize break-words">
                {displayKey}:
              </span>
              <span className="col-span-1 md:col-span-2 whitespace-pre-wrap break-words">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export const ReviewSubmitStep: FC<ReviewSubmitStepProps> = ({ form }) => {
  const formData = form.getValues();

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Review Your Profile</CardTitle>
        <CardDescription>
          This is a comprehensive summary of your entire company profile.
          Please review all sections and details carefully before submission.
          Ensure all fields marked as required in previous steps are accurately filled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderSectionData("Company Details", formData.companyDetails)}
        {renderSectionData("Business Capabilities", formData.businessCapabilities)}
        {renderSectionData("Financial & Legal Information", formData.financialLegalInfo)}
        {renderSectionData("Tender Experience", formData.tenderExperience)}
        {renderSectionData("Geographic Reach & Digital Readiness", formData.geographicDigitalReach)}
        {renderSectionData("Terms & Conditions", formData.termsAndConditions)}
        {renderSectionData("Declarations", formData.declarationsUploads)}

        <Separator className="my-8" />

        <Alert variant="default" className="bg-blue-50 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700/50">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-300">Ready to Submit?</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              Once you submit, the form will be cleared. Ensure all information is correct.
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
