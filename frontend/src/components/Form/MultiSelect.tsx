import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import ChevronDownIcon from "../Icon/ChevronDownIcon";
import CloseIcon from "../Icon/CloseIcon";
import { Checkbox } from "./Checkbox";
import { Label, MultiSelectTrigger, TagsContainer, Tag, TagRemove, Placeholder, IconWrapper, Dropdown, SearchInput, HelperText, SelectWrapper, Option } from "./styles";
import { MultiSelectProps, SelectOption } from "./types";

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = 'Select...',
  label,
  error,
  helperText,
  disabled = false,
  fullWidth = false,
  searchable = false,
  maxSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter(opt => value.includes(opt.value));

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
    
    const isSelected = value.includes(option.value);
    
    if (isSelected) {
      onChange?.(value.filter(v => v !== option.value));
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      onChange?.([...value, option.value]);
    }
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(value.filter(v => v !== optionValue));
  };

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  return (
    <SelectWrapper $fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      
      <MultiSelectTrigger
        ref={triggerRef}
        type="button"
        $error={!!error}
        $disabled={disabled}
        $isOpen={isOpen}
        onClick={handleToggle}
        disabled={disabled}
      >
        <TagsContainer>
          {selectedOptions.length > 0 ? (
            selectedOptions.map(option => (
              <Tag key={option.value}>
                {option.label}
                <TagRemove onClick={(e) => handleRemove(option.value, e)}>
                  <CloseIcon />
                </TagRemove>
              </Tag>
            ))
          ) : (
            <Placeholder>{placeholder}</Placeholder>
          )}
        </TagsContainer>
        <IconWrapper $isOpen={isOpen}>
          <ChevronDownIcon />
        </IconWrapper>
      </MultiSelectTrigger>
      
      {isOpen && createPortal(
        <Dropdown 
          $x={dropdownPosition.x} 
          $y={dropdownPosition.y}
          $width={dropdownPosition.width}
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
              $selected={value.includes(option.value)}
              $disabled={option.disabled || (maxSelected !== undefined && value.length >= maxSelected && !value.includes(option.value))}
              onClick={() => handleSelect(option)}
            >
              <Checkbox 
                checked={value.includes(option.value)} 
                onChange={() => {}}
                style={{ pointerEvents: 'none' }}
              />
              <span style={{ marginLeft: '8px' }}>{option.label}</span>
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

export default MultiSelect;