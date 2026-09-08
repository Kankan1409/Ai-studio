import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X, Search } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

interface MultiSelectDropdownProps {
  id?: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (newValues: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  id,
  options,
  selectedValues,
  onChange,
  placeholder = 'เลือกรายการ...',
  searchPlaceholder = 'ค้นหา...',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((o) => o.value));
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Filter options by search query
  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      (opt.description && opt.description.toLowerCase().includes(q)) ||
      (opt.badge && opt.badge.toLowerCase().includes(q))
    );
  });

  // Display text in the trigger input (e.g., "Email address, Description")
  const displayText = options
    .filter((opt) => selectedValues.includes(opt.value))
    .map((opt) => opt.label)
    .join(', ');

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button - matches image preview box */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-left text-sm transition-all shadow-xs cursor-pointer ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`block truncate ${
            selectedValues.length > 0 ? 'text-slate-800 font-medium' : 'text-slate-400'
          }`}
        >
          {selectedValues.length > 0 ? displayText : placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {selectedValues.length > 0 && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer mr-0.5"
              title="ล้างทั้งหมด"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronsUpDown className="w-4 h-4 text-slate-400" />
        </div>
      </button>

      {/* Floating Dropdown Menu - matches screenshot layout */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          role="listbox"
        >
          {/* Optional Quick Search / Actions header */}
          {options.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Action Bar (Select all / Count) */}
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-slate-500 bg-slate-50/50 border-b border-slate-100">
            <span>
              เลือกแล้ว <strong className="text-indigo-600">{selectedValues.length}</strong> จาก {options.length} คน
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
            >
              {selectedValues.length === options.length ? 'ล้างทั้งหมด' : 'เลือกทั้งหมด'}
            </button>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-center text-slate-400">
                ไม่พบข้อมูลที่ค้นหา
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={(e) => handleToggleOption(option.value, e)}
                    className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/40 text-slate-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="truncate">{option.label}</span>
                      {option.badge && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-normal bg-slate-100 text-slate-500">
                          {option.badge}
                        </span>
                      )}
                      {option.description && (
                        <span className="text-xs text-slate-400 truncate">
                          {option.description}
                        </span>
                      )}
                    </div>

                    {/* Right side checkmark matching the screenshot */}
                    <div className="w-5 flex justify-end shrink-0">
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
