
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Send, RefreshCw } from 'lucide-react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  // AI related props removed
  // isAIValidating?: boolean;
  // onValidateAI?: () => void;
  // aiValidated?: boolean;
}

export const FormNavigation: FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isNextDisabled = false,
  isSubmitting = false,
  // AI related props removed
  // isAIValidating = false,
  // onValidateAI,
  // aiValidated = false,
}) => {
  const isFirstStep = currentStep === 0;
  // const isLastDataEntryStep = currentStep === totalSteps - 2; // Before review step - this logic might need adjustment if AI button is removed
  const isReviewStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting /*|| isAIValidating - removed */}
        className="btn"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      {isReviewStep ? (
        <>
          {/* AI Validate Button Removed */}
          {/* {onValidateAI && !aiValidated && (
            <Button
              onClick={onValidateAI}
              disabled={isAIValidating || isSubmitting}
              variant="default"
              className="btn bg-accent hover:bg-accent/90"
            >
              {isAIValidating ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
              )}
              Validate with AI
            </Button>
          )} */}
          <Button
            type="submit" 
            onClick={onNext} 
            disabled={isSubmitting /* || isAIValidating || !aiValidated - removed, adjust if submit depends on something else now */}
            className="btn"
          >
            {isSubmitting ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Profile
          </Button>
        </>
      ) : (
        <Button onClick={onNext} disabled={isNextDisabled || isSubmitting /*|| isAIValidating - removed */} className="btn">
          {currentStep === totalSteps - 2 ? 'Review Profile' : 'Next'} {/* Adjusted condition as AI button removed */}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
