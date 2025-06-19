"use client";

import * as React from "react";
import { X, ChevronsUpDown, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
  allowCreate = true,
}) => {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedTags = React.useMemo(() => {
    return value ? value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
  }, [value]);

  const handleSelect = React.useCallback((currentValue: string) => {
    const trimmedValue = currentValue.trim();
    if (!trimmedValue) return;

    const newSelectedTags = [...selectedTags];
    const existingIndex = newSelectedTags.findIndex(tag => tag.toLowerCase() === trimmedValue.toLowerCase());
    
    if (existingIndex === -1) {
      newSelectedTags.push(trimmedValue);
      onChange(newSelectedTags.join(", "));
      
      if (onTagAdd) {
        onTagAdd(trimmedValue);
      }
    }

    setSearchQuery("");
    setOpen(false);
  }, [selectedTags, onChange, onTagAdd]);

  const handleRemove = React.useCallback((tagToRemove: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagToRemove);
    onChange(newSelectedTags.join(", "));
  }, [selectedTags, onChange]);

  const handleKeyDownRemove = (e: React.KeyboardEvent<HTMLSpanElement>, tagToRemove: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleRemove(tagToRemove);
    }
  };

  const availableOptions = React.useMemo(() => {
    return options.filter(option => 
      !selectedTags.some(tag => tag.toLowerCase() === option.toLowerCase())
    );
  }, [options, selectedTags]);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return availableOptions;
    return availableOptions.filter(option =>
      option.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [availableOptions, searchQuery]);

  const showCreateOption = React.useMemo(() => {
    if (!allowCreate) return false;
    const trimmedSearch = searchQuery.trim();
    if (!trimmedSearch) return false;
    const isAlreadySelected = selectedTags.some(tag => tag.toLowerCase() === trimmedSearch.toLowerCase());
    const isExistingOriginalOption = options.some(opt => opt.toLowerCase() === trimmedSearch.toLowerCase());
    return !isAlreadySelected && !isExistingOriginalOption;
  }, [searchQuery, selectedTags, options, allowCreate]);

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
                      tabIndex={disabled ? -1 : 0}
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
                      onKeyDown={disabled ? undefined : (e) => handleKeyDownRemove(e, tag)}
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
          className="w-[--radix-popover-trigger-width] p-0 max-h-80"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or type to add..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              disabled={disabled}
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) { 
                  e.preventDefault();
                  const trimmedSearch = searchQuery.trim();
                  if (trimmedSearch) {
                    const isAlreadySelected = selectedTags.some(tag => tag.toLowerCase() === trimmedSearch.toLowerCase());
                    if (isAlreadySelected) {
                      setOpen(false);
                      return;
                    }
              
                    const availableOptionMatch = availableOptions.find(
                      opt => opt.toLowerCase() === trimmedSearch.toLowerCase()
                    );
              
                    if (availableOptionMatch) {
                      handleSelect(availableOptionMatch);
                    } else {
                      const isExistingInOriginalOptions = options.some(opt => opt.toLowerCase() === trimmedSearch.toLowerCase());
                      if (allowCreate && !isExistingInOriginalOptions) {
                        handleSelect(trimmedSearch);
                      }
                    }
                  }
                }
              }}
            />
            <CommandList className="max-h-60 overflow-y-auto">
              <CommandEmpty>
                {searchQuery.trim() && !showCreateOption ? "No matching items found." : (allowCreate ? "Type to search or add new." : "Type to search.")}
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map(option => {
                  const isSelected = selectedTags.some(tag => tag.toLowerCase() === option.toLowerCase());
                  return (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={(selectedValue) => {
                        // Find the original option that matches (case-insensitive)
                        const originalOption = options.find(opt => opt.toLowerCase() === selectedValue.toLowerCase()) || selectedValue;
                        handleSelect(originalOption);
                      }}
                      disabled={disabled || isSelected}
                      className={cn(
                        "cursor-pointer hover:bg-accent flex items-center justify-between",
                        isSelected && "opacity-50"
                      )}
                    >
                      <span>{option}</span>
                      {isSelected && <Check className="h-4 w-4 text-green-600" />}
                    </CommandItem>
                  );
                })}
                {showCreateOption && searchQuery.trim() && (
                  <CommandItem
                    key={`create-${searchQuery.trim()}`}
                    value={searchQuery.trim()}
                    onSelect={() => handleSelect(searchQuery.trim())}
                    disabled={disabled}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
                  >
                    <span>Add "{searchQuery.trim()}"</span>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};