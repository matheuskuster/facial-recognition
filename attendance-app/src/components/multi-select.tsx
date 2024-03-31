import { Command as CommandPrimitive } from 'cmdk';
import { Delete, X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Command, CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Option = Record<'value' | 'label', string>;

type MultiSelectProps = {
  placeholder?: string;
  options: Option[];
  value?: string[];
  onChange?: (value: string[]) => void;
  selectAll?: boolean;
  className?: string;
};

export function MultiSelect({
  placeholder,
  options,
  value,
  onChange,
  selectAll,
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(() => {
    return options.filter((option) => value?.includes(option.value) ?? false);
  }, [value]);

  const [inputValue, setInputValue] = React.useState('');

  const handleUnselect = React.useCallback((option: Option) => {
    onChange?.(value?.filter((v) => v !== option.value) ?? []);
  }, []);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (input.value === '') {
          onChange?.(value?.slice(0, -1) ?? []);
        }
      }
      // This is not a default behaviour of the <input /> field
      if (e.key === 'Escape') {
        input.blur();
      }
    }
  }, []);

  const selectables = options.filter((option) => !selected.includes(option));

  return (
    <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
      <div
        className={cn(
          'border border-input py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 w-[335px]',
          selected.length > 0 ? 'px-3' : 'px-1',
          className,
        )}
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((option) => {
            return (
              <Badge key={option.value} variant="secondary">
                {option.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnselect(option);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(option)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}

          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1 w-full"
          />

          {selected.length > 1 && (
            <TooltipProvider delayDuration={1}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Delete
                    onClick={() => onChange?.([])}
                    className="ml-2 w-[22px] h-[22px] text-muted-foreground cursor-pointer hover:opacity-80 transition-all"
                  />
                </TooltipTrigger>
                <TooltipContent side="top">Clear all</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="absolute w-[335px] z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-y-auto overflow-x-none p-0 pb-1">
              {selectAll && selected.length !== options.length && (
                <>
                  <CommandItem
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      setInputValue('');
                      onChange?.(options.map((option) => option.value));
                    }}
                    className="cursor-pointer flex items-center justify-center"
                  >
                    Select all
                    <Badge variant="outline" className="ml-2 mb-1">
                      {options.length - selected.length}
                    </Badge>
                  </CommandItem>

                  <CommandSeparator className="mb-1" />
                </>
              )}

              {selectables.map((option) => {
                return (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      setInputValue('');
                      onChange?.([...(value ?? []), option.value]);
                    }}
                    className="cursor-pointer mx-1"
                  >
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ) : null}
      </div>
    </Command>
  );
}
