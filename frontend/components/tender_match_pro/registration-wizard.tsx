"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm, FormProvider, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registrationSchema,
  RegistrationFormData,
  companyDetailsSchema,
  businessCapabilitiesSchema,
  financialLegalInfoSchema,
  tenderExperienceSchema,
  geographicDigitalReachSchema,
  termsAndConditionsSchema, 
  declarationsUploadsSchema
} from '@/lib/schemas/registration-schema';
import { useFormPersistence } from '@/hooks/use-form-persistence';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Progress } from '@/components/ui/progress';
import { FormNavigation } from './form-navigation';
import { CompanyDetailsStep } from './steps/company-details-step';
import { BusinessCapabilitiesStep } from './steps/business-capabilities-step';
import { FinancialLegalInfoStep } from './steps/financial-info-step';
import { TenderExperienceStep } from './steps/tender-experience-step';
import { GeographicDigitalReachStep } from './steps/geographic-reach-step';
import { TermsConditionsStep } from './steps/terms-conditions-step'; 
import { DeclarationsUploadsStep } from './steps/declarations-uploads-step';
import { ReviewSubmitStep } from './steps/review-submit-step';

const STEPS = [
  { id: 'companyDetails', title: 'Company Details', component: CompanyDetailsStep, schema: companyDetailsSchema, fields: ['companyDetails'] as const },
  { id: 'businessCapabilities', title: 'Business Capabilities', component: BusinessCapabilitiesStep, schema: businessCapabilitiesSchema, fields: ['businessCapabilities'] as const },
  { id: 'financialLegalInfo', title: 'Financial & Legal Info', component: FinancialLegalInfoStep, schema: financialLegalInfoSchema, fields: ['financialLegalInfo'] as const },
  { id: 'tenderExperience', title: 'Tender Experience', component: TenderExperienceStep, schema: tenderExperienceSchema, fields: ['tenderExperience'] as const },
  { id: 'geographicDigitalReach', title: 'Geographic & Digital', component: GeographicDigitalReachStep, schema: geographicDigitalReachSchema, fields: ['geographicDigitalReach'] as const },
  { id: 'termsAndConditions', title: 'Terms & Conditions', component: TermsConditionsStep, schema: termsAndConditionsSchema, fields: ['termsAndConditions'] as const }, 
  { id: 'declarationsUploads', title: 'Declarations', component: DeclarationsUploadsStep, schema: declarationsUploadsSchema, fields: ['declarationsUploads'] as const },
  { id: 'reviewSubmit', title: 'Review & Submit', component: ReviewSubmitStep, schema: registrationSchema, fields: [] as const },
];

const FORM_DATA_STORAGE_KEY = 'tenderMatchProRegistrationForm_v2';
const CURRENT_STEP_STORAGE_KEY = 'tenderMatchProRegistrationStep_v2';

// Helper to generate a financial year string like "YYYY-YY"
const getFinancialYearString = (startYear: number): string => {
  const endYearShort = (startYear + 1).toString().slice(-2);
  return `${startYear}-${endYearShort}`;
};

const generateInitialTurnovers = (count: number = 10) => {
  let latestFinancialYearStart = new Date().getFullYear();
  // Financial year in India (and many places) is typically April-March.
  // If current month is Jan, Feb, Mar (0,1,2), then the current FY started in the previous calendar year.
  if (new Date().getMonth() < 3) { 
    latestFinancialYearStart -= 1;
  }
  const turnovers = [];
  for (let i = 0; i < count; i++) { 
    const startYear = latestFinancialYearStart - i;
    turnovers.push({ financialYear: getFinancialYearString(startYear), amount: '' });
  }
  return turnovers;
};

export function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();

  const initialDefaultValues = useMemo<RegistrationFormData>(() => ({
    companyDetails: {
      companyName: '',
      companyType: '',
      dateOfEstablishment: new Date(),
      country: '',
      state: '',
      city: '',
      address: '',
      websiteUrl: ''
    },
    businessCapabilities: {
      businessRoles: '',
      industrySectors: '',
      productServiceKeywords: '',
      technicalCapabilities: '',
      certifications: '',
      hasNoCertifications: false,
    },
    financialLegalInfo: {
      hasPan: false,
      hasGstin: false,
      hasMsmeUdyam: false,
      hasNsic: false,
      annualTurnovers: generateInitialTurnovers(10),
      netWorthAmount: '',
      netWorthCurrency: '',
      isBlacklistedOrLitigation: false,
      blacklistedDetails: ''
    },
    tenderExperience: {
      suppliedToGovtPsus: false,
      hasPastClients: false,
      pastClients: '',
      highestOrderValueFulfilled: 0,
      tenderTypesHandled: ''
    },
    geographicDigitalReach: {
      operatesInMultipleStates: false,
      operationalStates: '',
      exportsToOtherCountries: false,
      countriesServed: '',
      hasImportLicense: false,
      hasExportLicense: false,
      registeredOnPortals: false,
      hasDigitalSignature: false,
      preferredTenderLanguages: ''
    },
    termsAndConditions: { 
      acknowledgmentOfTenderMatching: false,
      accuracyOfSharedCompanyProfile: false,
      noResponsibilityForTenderOutcomes: false,
      nonDisclosureAndLimitedUse: false,
    },
    declarationsUploads: {
      infoConfirmed: false,
    },
  }), []);

  const methods = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange', 
    defaultValues: initialDefaultValues,
  });

  // Check for existing profile on component mount
  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:8000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const profile = await response.json();
          setExistingProfile(profile);
          
          // Convert the profile data to form format
          const formData: RegistrationFormData = {
            companyDetails: {
              companyName: profile.companyDetails?.companyName || '',
              companyType: profile.companyDetails?.companyType || '',
              dateOfEstablishment: profile.companyDetails?.dateOfEstablishment 
                ? new Date(profile.companyDetails.dateOfEstablishment) 
                : new Date(),
              country: profile.companyDetails?.country || '',
              state: profile.companyDetails?.state || '',
              city: profile.companyDetails?.city || '',
              address: profile.companyDetails?.address || '',
              websiteUrl: profile.companyDetails?.websiteUrl || ''
            },
            businessCapabilities: {
              businessRoles: profile.businessCapabilities?.businessRoles || '',
              industrySectors: profile.businessCapabilities?.industrySectors || '',
              productServiceKeywords: profile.businessCapabilities?.productServiceKeywords || '',
              technicalCapabilities: profile.businessCapabilities?.technicalCapabilities || '',
              certifications: profile.businessCapabilities?.certifications || '',
              hasNoCertifications: profile.businessCapabilities?.hasNoCertifications || false,
            },
            financialLegalInfo: {
              hasPan: profile.financialLegalInfo?.hasPan || false,
              hasGstin: profile.financialLegalInfo?.hasGstin || false,
              hasMsmeUdyam: profile.financialLegalInfo?.hasMsmeUdyam || false,
              hasNsic: profile.financialLegalInfo?.hasNsic || false,
              annualTurnovers: profile.financialLegalInfo?.annualTurnovers || generateInitialTurnovers(10),
              netWorthAmount: profile.financialLegalInfo?.netWorthAmount || '',
              netWorthCurrency: profile.financialLegalInfo?.netWorthCurrency || '',
              isBlacklistedOrLitigation: profile.financialLegalInfo?.isBlacklistedOrLitigation || false,
              blacklistedDetails: profile.financialLegalInfo?.blacklistedDetails || ''
            },
            tenderExperience: {
              suppliedToGovtPsus: profile.tenderExperience?.suppliedToGovtPsus || false,
              hasPastClients: profile.tenderExperience?.hasPastClients || false,
              pastClients: profile.tenderExperience?.pastClients || '',
              highestOrderValueFulfilled: profile.tenderExperience?.highestOrderValueFulfilled || 0,
              tenderTypesHandled: profile.tenderExperience?.tenderTypesHandled || ''
            },
            geographicDigitalReach: {
              operatesInMultipleStates: profile.geographicDigitalReach?.operatesInMultipleStates || false,
              operationalStates: profile.geographicDigitalReach?.operationalStates || '',
              exportsToOtherCountries: profile.geographicDigitalReach?.exportsToOtherCountries || false,
              countriesServed: profile.geographicDigitalReach?.countriesServed || '',
              hasImportLicense: profile.geographicDigitalReach?.hasImportLicense || false,
              hasExportLicense: profile.geographicDigitalReach?.hasExportLicense || false,
              registeredOnPortals: profile.geographicDigitalReach?.registeredOnPortals || false,
              hasDigitalSignature: profile.geographicDigitalReach?.hasDigitalSignature || false,
              preferredTenderLanguages: profile.geographicDigitalReach?.preferredTenderLanguages || ''
            },
            termsAndConditions: {
              acknowledgmentOfTenderMatching: profile.termsAndConditions?.acknowledgmentOfTenderMatching || false,
              accuracyOfSharedCompanyProfile: profile.termsAndConditions?.accuracyOfSharedCompanyProfile || false,
              noResponsibilityForTenderOutcomes: profile.termsAndConditions?.noResponsibilityForTenderOutcomes || false,
              nonDisclosureAndLimitedUse: profile.termsAndConditions?.nonDisclosureAndLimitedUse || false,
            },
            declarationsUploads: {
              infoConfirmed: profile.declarationsUploads?.infoConfirmed || false,
            },
          };

          // Reset form with existing data
          methods.reset(formData);
          
          toast({
            title: "Profile Loaded",
            description: "Your existing profile has been loaded for editing.",
            className: "bg-blue-500 text-white",
          });
        } else if (response.status !== 404) {
          throw new Error("Failed to check profile");
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        toast({
          title: "Profile Check Failed",
          description: "Could not load existing profile. Starting fresh.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingProfile();
  }, [methods, router, toast]);

  useFormPersistence(methods, FORM_DATA_STORAGE_KEY, initialDefaultValues);

  useEffect(() => {
    const savedStep = localStorage.getItem(CURRENT_STEP_STORAGE_KEY);
    if (savedStep) {
      const stepNumber = parseInt(savedStep, 10);
      if (!isNaN(stepNumber) && stepNumber >= 0 && stepNumber < STEPS.length) {
        setCurrentStep(stepNumber);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CURRENT_STEP_STORAGE_KEY, currentStep.toString());
  }, [currentStep]);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      const currentStepFields = STEPS[currentStep].fields.slice() as (keyof RegistrationFormData)[];
      
      const fieldsToValidate: (keyof RegistrationFormData)[] | (Path<RegistrationFormData>)[] = 
        STEPS[currentStep].id === 'termsAndConditions' ? ['termsAndConditions'] :
        (currentStepFields.length > 0 ? currentStepFields as any : undefined);

      const isValid = await methods.trigger(fieldsToValidate as any);

      if (isValid) {
        try {
          const currentValues = methods.getValues();
          localStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(currentValues));
        } catch (error) {
          console.error("Failed to save form data to localStorage on Next:", error);
          toast({
            title: "Save Error",
            description: "Could not save form progress. Please try again.",
            variant: "destructive",
          });
        }
        setCurrentStep(prev => prev + 1);
      } else {
        toast({
          title: "Validation Error",
          description: "Please correct the errors on the current page before proceeding.",
          variant: "destructive",
        });
      }
    } 
    else {
      await onSubmit(methods.getValues());
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again to submit your profile.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:8000/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.detail || 'Failed to submit registration.');
      }

      const result = await response.json();

      toast({
        title: existingProfile ? "Profile Updated!" : "Profile Submitted!",
        description: result.message || `Your company profile has been successfully ${existingProfile ? 'updated' : 'submitted'}.`,
        className: "bg-green-500 text-white",
      });

      localStorage.removeItem(FORM_DATA_STORAGE_KEY);
      localStorage.removeItem(CURRENT_STEP_STORAGE_KEY);
      
      // Redirect to dashboard
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Something went wrong while submitting your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = STEPS[currentStep].component;
  const progressValue = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {existingProfile && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-blue-800 font-medium">
              Editing existing profile for {existingProfile.companyDetails?.companyName || 'your company'}
            </span>
          </div>
        </div>
      )}

      <FormProvider {...methods}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8 w-full">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progressValue)}% Complete
              </span>
            </div>
            <Progress value={progressValue} className="w-full h-3 bg-gray-200" />
          </div>

          <CurrentStepComponent form={methods} />

          <FormNavigation
            currentStep={currentStep}
            totalSteps={STEPS.length}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isNextDisabled={methods.formState.isSubmitting || (currentStep === STEPS.length -1 && !methods.formState.isValid && methods.formState.isSubmitted) }
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>
    </div>
  );
}