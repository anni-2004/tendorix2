
"use client";

import * as React from "react";
import { X, ChevronsUpDown } from "lucide-react";

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
import { buttonVariants } from "@/components/ui/button";

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
  allowCreate?: boolean; // New prop
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
  allowCreate = true, // Default to true
}) => {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const selectedTags = React.useMemo(() => {
    return value ? value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
  }, [value]);

  const handleSelect = (currentValue: string) => {
    const trimmedValue = currentValue.trim();
    if (!trimmedValue) return;

    const newSelectedTags = [...selectedTags];
    let isNewAddition = false;
    if (!newSelectedTags.some(tag => tag.toLowerCase() === trimmedValue.toLowerCase())) {
      newSelectedTags.push(trimmedValue);
      isNewAddition = true;
    }
    onChange(newSelectedTags.join(", "));

    if (isNewAddition && onTagAdd) {
      onTagAdd(trimmedValue);
    }

    setOpen(false);
    setSearchQuery("");
  };

  const handleRemove = (tagToRemove: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagToRemove);
    onChange(newSelectedTags.join(", "));
  };

  const handleKeyDownRemove = (e: React.KeyboardEvent<HTMLSpanElement>, tagToRemove: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRemove(tagToRemove);
    }
  };

  const availableOptions = React.useMemo(() => {
    return options.filter(option => !selectedTags.some(tag => tag.toLowerCase() === option.toLowerCase()));
  }, [options, selectedTags]);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return availableOptions;
    return availableOptions.filter(option =>
      option.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [availableOptions, searchQuery]);

  const showCreateOption = React.useMemo(() => {
    if (!allowCreate) return false; // Check allowCreate prop
    const trimmedSearch = searchQuery.trim();
    if (!trimmedSearch) return false;
    const isAlreadySelected = selectedTags.some(tag => tag.toLowerCase() === trimmedSearch.toLowerCase());
    const isExistingOriginalOption = options.some(opt => opt.toLowerCase() === trimmedSearch.toLowerCase());
    return !isAlreadySelected && !isExistingOriginalOption;
  }, [searchQuery, selectedTags, options, allowCreate]); // Add allowCreate to dependencies


  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          ref={triggerRef}
          asChild={false} 
          role="combobox"
          aria-expanded={open}
          aria-controls="tag-input-combobox"
          aria-disabled={disabled}
          data-disabled={disabled ? "" : undefined}
          disabled={disabled}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-between h-auto min-h-10 py-2 px-3 text-left font-normal hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          id={id}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          type="button"
          onClick={() => !disabled && setOpen(true)}
        >
          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedTags.map(tag => (
                <Badge
                  variant="secondary"
                  key={tag}
                  className="py-1 px-2 rounded-sm"
                >
                  {tag}
                  <span
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    className={cn(
                      "ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                    )}
                    onClick={(e) => {
                      if (disabled) return;
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(tag);
                    }}
                    onKeyDown={disabled ? undefined : (e) => handleKeyDownRemove(e, tag)}
                    aria-disabled={disabled}
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </span>
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
            style={{ width: triggerRef.current?.offsetWidth ? `${triggerRef.current.offsetWidth}px` : 'auto' }}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or type to add..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) { 
                  const trimmedSearch = searchQuery.trim();
                  if (trimmedSearch) {
                    const isAlreadySelected = selectedTags.some(tag => tag.toLowerCase() === trimmedSearch.toLowerCase());
                    if (isAlreadySelected) {
                       e.preventDefault();
                       setOpen(false);
                      return;
                    }
              
                    const availableOptionMatch = availableOptions.find(
                      opt => opt.toLowerCase() === trimmedSearch.toLowerCase()
                    );
              
                    if (availableOptionMatch) {
                      e.preventDefault();
                      handleSelect(availableOptionMatch);
                    } else {
                      const isExistingInOriginalOptions = options.some(opt => opt.toLowerCase() === trimmedSearch.toLowerCase());
                      if (allowCreate && !isExistingInOriginalOptions) { // Check allowCreate here
                        e.preventDefault();
                        handleSelect(trimmedSearch);
                      }
                    }
                  }
                }
              }}
            />
            <CommandList>
              <CommandEmpty>
                {searchQuery.trim() && !showCreateOption ? "No matching items found." : (allowCreate ? "Type to search or add new." : "Type to search.")}
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map(option => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                    disabled={disabled}
                  >
                    {option}
                  </CommandItem>
                ))}
                {showCreateOption && searchQuery.trim() && (
                  <CommandItem
                    key={`create-${searchQuery.trim()}`}
                    value={searchQuery.trim()}
                    onSelect={() => handleSelect(searchQuery.trim())}
                    disabled={disabled}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    Add "{searchQuery.trim()}"
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
