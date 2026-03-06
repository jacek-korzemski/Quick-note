import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import ChevronDownIcon from '../Icon/ChevronDownIcon';
import { SelectWrapper, SelectLabel, SelectTrigger, Placeholder, IconWrapper, Dropdown, SearchInput, HelperText, Option } from './styles';
import { SelectProps, SelectOption } from './types';

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  helperText,
  disabled = false,
  fullWidth = false,
  searchable = false,
  dropdownZIndex,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = searchable
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const updateDropdownPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        x: rect.left,
        y: rect.bottom + 4,
        width: rect.width,
      });
    }
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Close on outside click (must check both trigger and dropdown - dropdown is in portal)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideTrigger = triggerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      if (!isInsideTrigger && !isInsideDropdown) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  return (
    <SelectWrapper $fullWidth={fullWidth}>
      {label && <SelectLabel>{label}</SelectLabel>}
      
      <SelectTrigger
        ref={triggerRef}
        type="button"
        $error={!!error}
        $disabled={disabled}
        $isOpen={isOpen}
        onClick={handleToggle}
        disabled={disabled}
      >
        {selectedOption ? selectedOption.label : <Placeholder>{placeholder}</Placeholder>}
        <IconWrapper $isOpen={isOpen}>
          <ChevronDownIcon />
        </IconWrapper>
      </SelectTrigger>
      
      {isOpen && createPortal(
        <Dropdown
          ref={dropdownRef}
          $x={dropdownPosition.x}
          $y={dropdownPosition.y}
          $width={dropdownPosition.width}
          $zIndex={dropdownZIndex}
        >
          {searchable && (
            <SearchInput
              ref={searchRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          )}
 {filteredOptions.map(option => (
            <Option
              key={option.value}
              $selected={option.value === value}
              $disabled={option.disabled}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </Option>
          ))}
          {filteredOptions.length === 0 && (
            <Option $disabled>No options found</Option>
          )}
        </Dropdown>,
        document.body
      )}
      
      {(error || helperText) && (
        <HelperText $error={!!error}>{error || helperText}</HelperText>
      )}
    </SelectWrapper>
  );
};