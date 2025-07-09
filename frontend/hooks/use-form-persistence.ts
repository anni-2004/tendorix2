
"use client";

import { useEffect, useCallback, useState } from 'react';
import type { UseFormReturn, FieldValues, Path, PathValue } from 'react-hook-form';

export function useFormPersistence<T extends FieldValues>(
  form: UseFormReturn<T>,
  storageKey: string,
  initialDefaultValuesFromProps: T // Accept memoized default values as a prop
) {
  const [isMounted, setIsMounted] = useState(false);
  const { watch, reset, setValue, getValues, formState: { isSubmitSuccessful } } = form;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadFromStorage = useCallback(() => {
    if (!isMounted) return;

    const storedDataString = localStorage.getItem(storageKey);
    if (storedDataString) {
      try {
        const parsedData = JSON.parse(storedDataString) as Partial<T>;
        // Use the passed-in initialDefaultValuesFromProps for merging structure
        const currentDefaultValues = initialDefaultValuesFromProps || ({} as T);

        const mergedData = { ...currentDefaultValues };

        for (const key in currentDefaultValues) {
          const sectionKey = key as Path<T>;
          if (parsedData.hasOwnProperty(key)) {
            if (typeof parsedData[sectionKey] === 'object' && parsedData[sectionKey] !== null && typeof currentDefaultValues[sectionKey] === 'object' && currentDefaultValues[sectionKey] !== null) {
               mergedData[sectionKey] = { ...(currentDefaultValues[sectionKey] as object), ...(parsedData[sectionKey] as object) } as PathValue<T, Path<T>>;
            } else {
              mergedData[sectionKey] = parsedData[sectionKey] as PathValue<T, Path<T>>;
            }
          }
        }
        
        reset(mergedData, { keepDefaultValues: false });

      } catch (error) {
        console.error("Failed to parse stored form data:", error);
        localStorage.removeItem(storageKey); // Clear corrupted data
         if (initialDefaultValuesFromProps) { // Fallback to initial defaults if parsing fails
            reset(initialDefaultValuesFromProps);
        }
      }
    } else {
      if (initialDefaultValuesFromProps) {
        reset(initialDefaultValuesFromProps);
      }
    }
  }, [reset, storageKey, initialDefaultValuesFromProps, isMounted]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]); 

  useEffect(() => {
    if (!isMounted) return;

    const subscription = watch((value) => {
      if (!form.formState.isSubmitting && !form.formState.isSubmitSuccessful) {
        localStorage.setItem(storageKey, JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, storageKey, form.formState.isSubmitting, form.formState.isSubmitSuccessful, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    if (isSubmitSuccessful) {
      localStorage.removeItem(storageKey);
      if (initialDefaultValuesFromProps) {
        reset(initialDefaultValuesFromProps);
      }
    }
  }, [isSubmitSuccessful, storageKey, reset, initialDefaultValuesFromProps, isMounted]);
}

