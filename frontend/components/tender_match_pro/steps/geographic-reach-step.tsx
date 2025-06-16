
"use client";

import type { FC } from 'react';
import React, { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { RegistrationFormData } from '@/lib/schemas/registration-schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Globe2, Wifi } from 'lucide-react';
import { TagInput } from '@/components/ui/tag-input';

interface GeographicDigitalReachStepProps {
  form: UseFormReturn<RegistrationFormData>;
}

const INDIAN_STATES_UTS = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh",
  "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
].sort();

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
].sort();

const WORLD_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahamas, The", "Bahrain", "Bangladesh", "Barbados", "Belarus",
  "Belgium", "Belize", "Benin (Dahomey)", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso (Upper Volta)", "Burma", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Cayman Islands, The", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo, Democratic Republic of the", "Congo, Republic of the", "Cook Islands", "Costa Rica",
  "Cote d’Ivoire (Ivory Coast)", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "East Timor (Timor-Leste)", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
  "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia, The", "Georgia", "Germany",
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands, The", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka",
  "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand",
  "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
].sort();


export const GeographicDigitalReachStep: FC<GeographicDigitalReachStepProps> = ({ form }) => {
  const { control, watch, setValue } = form;
  const selectedCountry = watch('companyDetails.country');
  const watchOperatesInMultipleStates = watch('geographicDigitalReach.operatesInMultipleStates');
  const watchExportsToOtherCountries = watch('geographicDigitalReach.exportsToOtherCountries');

  useEffect(() => {
    if (!watchOperatesInMultipleStates) {
      setValue('geographicDigitalReach.operationalStates', '', { shouldValidate: true, shouldDirty: true });
    }
  }, [watchOperatesInMultipleStates, setValue]);

  useEffect(() => {
    if (!watchExportsToOtherCountries) {
      setValue('geographicDigitalReach.countriesServed', '', { shouldValidate: true, shouldDirty: true });
    }
  }, [watchExportsToOtherCountries, setValue]);


  const getStatesForCountry = (countryCode: string | undefined): string[] => {
    if (countryCode === "IN") return INDIAN_STATES_UTS;
    if (countryCode === "US") return US_STATES;
    return [];
  };

  const operationalStateOptions = getStatesForCountry(selectedCountry);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Globe2 className="mr-2 h-6 w-6 text-primary" />
          <span className="mr-2">Geographic Reach</span>
           & <Wifi className="ml-2 mr-2 h-6 w-6 text-primary" />
          Digital Readiness
        </CardTitle>
        <CardDescription>Define your operational markets and digital preparedness.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-lg font-semibold text-primary mt-4">Geographic Reach</h3>

        <FormField
          control={control}
          name="geographicDigitalReach.operatesInMultipleStates"
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
                  Do you operate in or export to multiple states within your primary country of operation?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {watchOperatesInMultipleStates && (
          <FormField
            control={control}
            name="geographicDigitalReach.operationalStates"
            render={({ field }) => (
              <FormItem className="pl-10">
                <FormLabel>List the states you operate in/export to:</FormLabel>
                <FormControl>
                  <TagInput
                    {...field}
                    options={operationalStateOptions}
                    placeholder={
                      selectedCountry
                        ? operationalStateOptions.length > 0
                          ? "Select or type operational states..."
                          : "No predefined states for selected country. Type to add."
                        : "Select country in Company Details first..."
                    }
                    id="operationalStates"
                    aria-describedby="operationalStates-description"
                    disabled={!selectedCountry && operationalStateOptions.length === 0}
                    aria-invalid={!!form.formState.errors.geographicDigitalReach?.operationalStates}
                  />
                </FormControl>
                <FormDescription id="operationalStates-description">
                  Required if checked above. Select from the list based on the country chosen in 'Company Details', or type to add custom states.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="geographicDigitalReach.exportsToOtherCountries"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm mt-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id={field.name}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={field.name} className="font-normal">
                   Do you export to other countries (outside your primary country of operation)?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        {watchExportsToOtherCountries && (
          <FormField
            control={control}
            name="geographicDigitalReach.countriesServed"
            render={({ field }) => (
              <FormItem className="pl-10">
                <FormLabel>List the countries you export to:</FormLabel>
                <FormControl>
                  <TagInput
                    {...field}
                    options={WORLD_COUNTRIES}
                    placeholder="Select countries served..."
                    id="countriesServed"
                    aria-describedby="countriesServed-description"
                    aria-invalid={!!form.formState.errors.geographicDigitalReach?.countriesServed}
                    allowCreate={false}
                  />
                </FormControl>
                <FormDescription id="countriesServed-description">
                  Required if checked above. Select the countries your company serves from the provided list.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="geographicDigitalReach.hasImportLicense"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm mt-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id={field.name}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor={field.name} className="font-normal">
                  Have Import License?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="geographicDigitalReach.hasExportLicense"
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
                  Have Export License?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />


        <h3 className="text-lg font-semibold text-primary mt-8">Digital Readiness</h3>
        <FormField
          control={control}
          name="geographicDigitalReach.registeredOnPortals"
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
                  Registered on GeM / CPPP / State Portals?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="geographicDigitalReach.hasDigitalSignature"
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
                  Have Digital Signature Certificate (DSC)?
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="geographicDigitalReach.preferredTenderLanguages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Languages for Tenders</FormLabel>
              <FormControl>
                <TagInput
                  {...field}
                  options={["English", "Hindi", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Russian", "Portuguese", "Bengali", "Urdu", "Tamil", "Telugu", "Marathi", "Gujarati", "Kannada", "Malayalam", "Odia", "Punjabi", "Assamese"]}
                  placeholder="Select or type preferred languages..."
                  id="preferredTenderLanguages"
                  aria-describedby="preferredTenderLanguages-description"
                  aria-invalid={!!form.formState.errors.geographicDigitalReach?.preferredTenderLanguages}
                />
              </FormControl>
              <FormDescription id="preferredTenderLanguages-description">
                Select preferred languages for tenders from the list, or type to add custom ones.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
