'use client';

import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  className?: string;
}

export default function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder = 'Search...',
  className
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    if (search) {
      const filtered = options.filter(option =>
        option.value.toLowerCase().includes(search.toLowerCase()) ||
        option.label.toLowerCase().includes(search.toLowerCase()) ||
        (option.description && option.description.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredOptions(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredOptions([]);
    }
  }, [search, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelect = (option: AutocompleteOption) => {
    setSearch(option.value);
    onChange(option.value);
    setIsOpen(false);
  };

  const clearInput = () => {
    setSearch('');
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" weight="bold" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500",
            className
          )}
        />
        {search && (
          <button
            onClick={clearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            type="button"
          >
            <X className="h-4 w-4" weight="bold" />
          </button>
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredOptions.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className={cn(
                "w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                index !== filteredOptions.length - 1 && "border-b border-gray-100 dark:border-gray-700"
              )}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {option.value}
              </div>
              {option.label !== option.value && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {option.label}
                </div>
              )}
              {option.description && (
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {option.description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}