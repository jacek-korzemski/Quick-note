import React, { forwardRef } from 'react';
import { CheckboxWrapper, CheckboxContainer, HiddenInput, CheckboxBox, IndeterminateIcon, CheckIcon, CheckboxLabel } from './styles';
import { CheckboxProps } from './types';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  indeterminate = false,
  ...props
}, ref) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
  
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
  return (
    <CheckboxWrapper>
      <CheckboxContainer>
        <HiddenInput ref={inputRef} type="checkbox" {...props} />
        <CheckboxBox>
          {indeterminate ? (
            <IndeterminateIcon style={indeterminate ? { opacity: 1, transform: 'scale(1)' } : {}} />
          ) : (
            <CheckIcon viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </CheckIcon>
          )}
        </CheckboxBox>
      </CheckboxContainer>
      {label && <CheckboxLabel>{label}</CheckboxLabel>}
    </CheckboxWrapper>
  );
});

Checkbox.displayName = 'Checkbox';