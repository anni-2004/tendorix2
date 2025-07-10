"use client";

import * as React from "react";
import { X, ChevronsUpDown, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  allowCreate = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const selectedTags = React.useMemo(() => {
    return value
      ? value
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];
  }, [value]);

  const availableOptions = React.useMemo(() => {
    return options.filter(
      (option) =>
        !selectedTags.some(
          (tag) => tag.toLowerCase() === option.toLowerCase()
        ) &&
        option.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [options, selectedTags, inputValue]);

  const handleSelect = React.useCallback(
    (selectedOption: string) => {
      const trimmedValue = selectedOption.trim();
      if (!trimmedValue) return;

      const newSelectedTags = [...selectedTags];
      const existingIndex = newSelectedTags.findIndex(
        (tag) => tag.toLowerCase() === trimmedValue.toLowerCase()
      );

      if (existingIndex === -1) {
        newSelectedTags.push(trimmedValue);
        onChange(newSelectedTags.join(", "));

        if (onTagAdd) {
          onTagAdd(trimmedValue);
        }
      }

      setInputValue("");
      setOpen(false);
    },
    [selectedTags, onChange, onTagAdd]
  );

  const handleRemove = React.useCallback(
    (tagToRemove: string) => {
      const newSelectedTags = selectedTags.filter(
        (tag) => tag !== tagToRemove
      );
      onChange(newSelectedTags.join(", "));
    },
    [selectedTags, onChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputValue && allowCreate) {
        e.preventDefault();
        handleSelect(inputValue);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [inputValue, handleSelect, allowCreate]
  );

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedTags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center px-2 py-1"
          >
            <span className="truncate max-w-[120px]">{tag}</span>
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-auto min-h-10 py-2 px-3 text-left font-normal",
              "focus:ring-2 focus:ring-ring focus:ring-offset-2",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            id={id}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            type="button"
          >
            <span className="truncate">
              {selectedTags.length > 0
                ? `${selectedTags.length} tag(s) selected`
                : placeholder}
            </span>
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
            <CommandInput
              placeholder="Search or add..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                {allowCreate && inputValue ? (
                  <div
                    className="cursor-pointer px-3 py-2 hover:bg-accent"
                    onClick={() => handleSelect(inputValue)}
                  >
                    Create "{inputValue}"
                  </div>
                ) : (
                  "No options available"
                )}
              </CommandEmpty>
              <CommandGroup>
                {availableOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                        if (!disabled) {
                          handleSelect(option);
                        }
                    }}
                    className={cn(
      "cursor-pointer flex items-center justify-between px-2 py-1.5",
      "hover:bg-accent hover:text-accent-foreground"
    )}

                    
                  >
                    <span>{option}</span>
                    {/* <Check className="h-4 w-4 text-green-600" /> */}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
