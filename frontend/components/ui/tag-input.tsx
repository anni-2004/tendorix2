"use client";

import * as React from "react";
import { X, ChevronsUpDown, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  disabled?: boolean;
  className?: string;
  onTagAdd?: (tag: string) => void;
  allowCreate?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select items...",
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  disabled,
  className,
  onTagAdd,
  allowCreate = false, // Default to false for dropdown-only
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedTags = React.useMemo(() => {
    return value ? value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
  }, [value]);

  const handleSelect = React.useCallback((selectedOption: string) => {
    const trimmedValue = selectedOption.trim();
    if (!trimmedValue) return;

    const newSelectedTags = [...selectedTags];
    const existingIndex = newSelectedTags.findIndex(tag => tag.toLowerCase() === trimmedValue.toLowerCase());
    
    if (existingIndex === -1) {
      // Add the tag
      newSelectedTags.push(trimmedValue);
      onChange(newSelectedTags.join(", "));
      
      if (onTagAdd) {
        onTagAdd(trimmedValue);
      }
    }

    setOpen(false);
  }, [selectedTags, onChange, onTagAdd]);

  const handleRemove = React.useCallback((tagToRemove: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagToRemove);
    onChange(newSelectedTags.join(", "));
  }, [selectedTags, onChange]);

  const availableOptions = React.useMemo(() => {
    return options.filter(option => 
      !selectedTags.some(tag => tag.toLowerCase() === option.toLowerCase())
    );
  }, [options, selectedTags]);

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls="tag-input-combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between h-auto min-h-10 py-2 px-3 text-left font-normal hover:bg-background",
              "focus:ring-2 focus:ring-ring focus:ring-offset-2",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            id={id}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            type="button"
          >
            {selectedTags.length > 0 ? (
              <div className="flex flex-wrap gap-1 max-w-full">
                {selectedTags.map(tag => (
                  <Badge
                    variant="secondary"
                    key={tag}
                    className="py-1 px-2 rounded-sm max-w-full"
                  >
                    <span className="truncate">{tag}</span>
                    <button
                      type="button"
                      className={cn(
                        "ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-secondary-foreground/20"
                      )}
                      onClick={(e) => {
                        if (disabled) return;
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(tag);
                      }}
                      disabled={disabled}
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0 max-h-80 z-[200]"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-60 overflow-y-auto">
              <CommandEmpty>
                {availableOptions.length === 0 ? "All options selected" : "No options available"}
              </CommandEmpty>
              <CommandGroup>
                {availableOptions.map(option => {
                  const isSelected = selectedTags.some(tag => tag.toLowerCase() === option.toLowerCase());
                  return (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={(currentValue) => {
                        // Find the exact option that matches (case-insensitive)
                        const exactOption = availableOptions.find(
                          opt => opt.toLowerCase() === currentValue.toLowerCase()
                        );
                        if (exactOption && !disabled) {
                          handleSelect(exactOption);
                        }
                      }}
                      disabled={disabled || isSelected}
                      className={cn(
                        "cursor-pointer hover:bg-accent flex items-center justify-between",
                        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
                        isSelected && "opacity-50"
                      )}
                    >
                      <span>{option}</span>
                      {isSelected && <Check className="h-4 w-4 text-green-600" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};